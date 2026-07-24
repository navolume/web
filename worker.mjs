const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resendEndpoint = "https://api.resend.com/emails";
const confirmationSubject = "You’re on the Navolume early-access list";
const confirmationText = "You’re on the Navolume early-access list. We’ll be in touch.";

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
