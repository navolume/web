const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
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
    const result = await env.WAITLIST_DB
      .prepare("INSERT OR IGNORE INTO waitlist_signups (email) VALUES (?)")
      .bind(email)
      .run();

    return json({
      message: result.meta.changes
        ? "You’re on the list. We’ll be in touch."
        : "You’re already on the list. We’ll be in touch.",
    });
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return json({ error: "We could not save your email. Please try again." }, 500);
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
