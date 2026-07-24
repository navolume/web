const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resendEndpoint = "https://api.resend.com/emails";
const confirmationSubject = "You’re on the Navolume early-access list";
const confirmationText = "You’re on the Navolume early-access list. We’ll be in touch.";
const confirmationHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>You’re on the Navolume list</title></head><body style="margin:0;padding:0;background-color:#f2f5ed;color:#17211c;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">Your early-access spot is saved. Big things are on the way.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f2f5ed"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background-color:#17211c;border-radius:24px"><tr><td style="padding:32px 32px 28px"><p style="margin:0;color:#c4ff7a;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase">NAVOLUME&nbsp;&nbsp;●</p><h1 style="margin:28px 0 14px;color:#f7f8f3;font-size:38px;line-height:44px;letter-spacing:-1.5px">You’re officially<br>on the list.</h1><p style="margin:0;color:#c4cbc7;font-size:18px;line-height:28px">Your early-access spot is saved. We’re building a better home for the digital work people care about.</p></td></tr><tr><td style="padding:0 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#c4ff7a;border-radius:16px"><tr><td style="padding:20px 22px"><p style="margin:0 0 7px;color:#17211c;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">What’s next</p><p style="margin:0;color:#17211c;font-size:16px;line-height:24px">We’ll send the first invitation and occasional behind-the-scenes updates straight to this inbox.</p></td></tr></table></td></tr><tr><td style="padding:30px 32px 34px"><p style="margin:0;color:#aeb5b5;font-size:14px;line-height:22px">Made for creators who want every product to feel owned—not merely delivered.</p></td></tr></table><p style="margin:18px 0 0;color:#69756d;font-size:12px;line-height:18px">Navolume · Digital products deserve a home.</p></td></tr></table></body></html>`;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

async function sendConfirmation(email, apiKey) {
  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Navolume <hello@navolume.com>",
      to: [email],
      subject: confirmationSubject,
      text: confirmationText,
      html: confirmationHtml,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the confirmation with status ${response.status}`);
  }
}

async function needsConfirmation(email, database) {
  const insert = await database
    .prepare("INSERT OR IGNORE INTO waitlist_signups (email) VALUES (?)")
    .bind(email)
    .run();

  if (insert.meta.changes) {
    return true;
  }

  const signup = await database
    .prepare("SELECT confirmation_sent_at FROM waitlist_signups WHERE email = ?")
    .bind(email)
    .first();

  return !signup?.confirmation_sent_at;
}

async function handleWaitlist(request, env) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Send a valid email address." }, 400);
  }

  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return json({ error: "Send a valid email address." }, 400);
  }

  try {
    if (!await needsConfirmation(email, env.WAITLIST_DB)) {
      return json({ message: "You’re already on the list. We’ll be in touch." });
    }

    await sendConfirmation(email, env.RESEND_API_KEY);
    await env.WAITLIST_DB
      .prepare("UPDATE waitlist_signups SET confirmation_sent_at = CURRENT_TIMESTAMP WHERE email = ?")
      .bind(email)
      .run();

    return json({ message: "You’re on the list. Check your inbox to confirm." });
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return json({ error: "We could not send your confirmation. Please try again." }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/waitlist") {
      return handleWaitlist(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
