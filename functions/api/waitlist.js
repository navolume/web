const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function onRequestPost({ request, env }) {
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
      message: result.meta.changes ? "You’re on the list. We’ll be in touch." : "You’re already on the list. We’ll be in touch.",
    });
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return json({ error: "We could not save your email. Please try again." }, 500);
  }
}
