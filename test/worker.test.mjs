import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker.mjs";

function request(path, options = {}) {
  return new Request(`https://navolume.com${path}`, options);
}

function database({ inserted = true, confirmationSentAt = null } = {}) {
  const statements = [];
  return {
    statements,
    prepare(sql) {
      statements.push(sql);
      return {
        bind() {
          if (sql.startsWith("INSERT OR IGNORE")) {
            return { run: async () => ({ meta: { changes: inserted ? 1 : 0 } }) };
          }
          if (sql.startsWith("SELECT confirmation_sent_at")) {
            return { first: async () => ({ confirmation_sent_at: confirmationSentAt }) };
          }
          if (sql.startsWith("UPDATE waitlist_signups SET confirmation_sent_at")) {
            return { run: async () => ({ success: true }) };
          }
          throw new Error(`Unexpected query: ${sql}`);
        },
      };
    },
  };
}

async function withFetchStub(stub, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function withoutConsoleError(run) {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    return await run();
  } finally {
    console.error = originalConsoleError;
  }
}

test("stores a normalized waitlist address and sends its confirmation email", async () => {
  const WAITLIST_DB = database();
  const sent = [];

  const response = await withFetchStub(async (url, options) => {
    sent.push({ url, options });
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  }, () => worker.fetch(
    request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "  CREATOR@Example.COM " }),
    }),
    { WAITLIST_DB, RESEND_API_KEY: "re_test" },
  ));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    message: "You’re on the list. Check your inbox to confirm.",
  });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, "https://api.resend.com/emails");
  assert.equal(sent[0].options.headers.Authorization, "Bearer re_test");
  const email = JSON.parse(sent[0].options.body);
  assert.deepEqual({
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
  }, {
    from: "Navolume <hello@navolume.com>",
    to: ["creator@example.com"],
    subject: "You’re on the Navolume early-access list",
    text: "You’re on the Navolume early-access list. We’ll be in touch.",
  });
  assert.match(email.html, /^<!doctype html>/i);
  assert.match(email.html, /<table role="presentation"/);
  assert.match(email.html, /You’re officially<br>on the list\./);
  assert.match(email.html, /What’s next/);
  assert.match(email.html, /background-color:#17211c/);
  assert.ok(WAITLIST_DB.statements.some((sql) => sql.startsWith("UPDATE waitlist_signups SET confirmation_sent_at")));
});

test("does not send another confirmation after an already-confirmed signup", async () => {
  const WAITLIST_DB = database({ inserted: false, confirmationSentAt: "2026-07-24 07:00:00" });

  const response = await withFetchStub(async () => {
    throw new Error("Resend must not be called for a confirmed signup");
  }, () => worker.fetch(
    request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "creator@example.com" }),
    }),
    { WAITLIST_DB, RESEND_API_KEY: "re_test" },
  ));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    message: "You’re already on the list. We’ll be in touch.",
  });
});

test("leaves a signup eligible for retry when Resend rejects its confirmation", async () => {
  const WAITLIST_DB = database();

  const response = await withoutConsoleError(() => withFetchStub(
    async () => new Response(JSON.stringify({ message: "Rejected" }), { status: 403 }),
    () => worker.fetch(
      request("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "creator@example.com" }),
      }),
      { WAITLIST_DB, RESEND_API_KEY: "re_test" },
    ),
  ));

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: "We could not send your confirmation. Please try again.",
  });
  assert.ok(!WAITLIST_DB.statements.some((sql) => sql.startsWith("UPDATE waitlist_signups SET confirmation_sent_at")));
});

test("rejects invalid waitlist addresses without accessing D1", async () => {
  const env = {
    WAITLIST_DB: {
      prepare() {
        throw new Error("D1 must not be used for invalid input");
      },
    },
  };

  const response = await worker.fetch(
    request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    }),
    env,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Send a valid email address." });
});

test("returns a method-not-allowed response for non-POST waitlist requests", async () => {
  const response = await worker.fetch(request("/api/waitlist"), {});

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
});
