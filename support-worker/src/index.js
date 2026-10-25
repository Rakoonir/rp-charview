const CATEGORY_LABELS = {
  feedback: "Allgemeines Feedback",
  bug: "Fehlerbericht",
  wish: "Feature-Wunsch",
};
const MAX_PER_HOUR = 5;

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return Response.json({ error: "Methode nicht erlaubt." }, { status: 405 });
    }
    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip) {
      return Response.json({ error: "Anfrage konnte nicht geprüft werden." }, { status: 400 });
    }
    const limiterId = env.SUPPORT_RATE_LIMITER.idFromName(ip);
    const limitResponse = await env.SUPPORT_RATE_LIMITER
      .get(limiterId)
      .fetch("https://rate-limit/check");
    if (limitResponse.status === 429) {
      return Response.json(
        { error: "Zu viele Nachrichten. Bitte versuche es später erneut." },
        { status: 429 },
      );
    }

    let submission;
    try {
      submission = await request.json();
    } catch {
      return Response.json({ error: "Ungültiges JSON." }, { status: 400 });
    }
    if (
      !submission ||
      !Object.hasOwn(CATEGORY_LABELS, submission.category) ||
      typeof submission.title !== "string" ||
      typeof submission.message !== "string" ||
      (submission.email !== undefined && typeof submission.email !== "string") ||
      (submission.discordName !== undefined && typeof submission.discordName !== "string") ||
      (submission.contact !== undefined && typeof submission.contact !== "string")
    ) {
      return Response.json({ error: "Ungültige Support-Nachricht." }, { status: 400 });
    }
    const title = submission.title.trim();
    const message = submission.message.trim();
    const email = submission.email?.trim() || "";
    const discordName = submission.discordName?.trim() || "";
    const contact = submission.contact?.trim() || "";
    if (
      title.length < 1 ||
      title.length > 120 ||
      message.length < 1 ||
      message.length > 3000 ||
      email.length > 200 ||
      discordName.length > 100 ||
      contact.length > 200
    ) {
      return Response.json({ error: "Bitte prüfe Betreff, Nachricht und Kontaktangabe." }, { status: 400 });
    }

    const webhookUrl = submission.category === "wish"
      ? env.WISH_WEBHOOK_URL
      : env.BUG_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json({ error: "Discord-Weiterleitung ist nicht konfiguriert." }, { status: 503 });
    }
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: `${CATEGORY_LABELS[submission.category]}: ${title}`,
          description: message,
          fields: [
            ...(email ? [{ name: "E-Mail für Rückfragen", value: email }] : []),
            ...(discordName ? [{ name: "Discord-Name", value: discordName }] : []),
            ...(contact ? [{ name: "Kontakt für Rückfragen", value: contact }] : []),
          ],
          color: submission.category === "wish" ? 0xd8a64b : 0xd5502f,
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    if (!webhookResponse.ok) {
      console.error("Discord webhook rejected support submission.", webhookResponse.status);
      return Response.json({ error: "Discord konnte die Nachricht nicht annehmen." }, { status: 502 });
    }
    return Response.json({ ok: true });
  },
};

export class SupportRateLimiter {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch() {
    const now = Date.now();
    const cutoff = now - 60 * 60 * 1000;
    const submissions = (await this.ctx.storage.get("submissions") || [])
      .filter((timestamp) => timestamp > cutoff);
    if (submissions.length >= MAX_PER_HOUR) {
      await this.ctx.storage.put("submissions", submissions);
      return new Response(null, { status: 429 });
    }
    submissions.push(now);
    await this.ctx.storage.put("submissions", submissions);
    return new Response(null, { status: 204 });
  }
}
