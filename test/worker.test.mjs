import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker.mjs";

function request(path, options = {}) {
  return new Request(`https://navolume.com${path}`, options);
}

test("stores a normalized waitlist address and returns a success response", async () => {
  let insertedEmail;
  const env = {
    WAITLIST_DB: {
      prepare(sql) {
        assert.equal(sql, "INSERT OR IGNORE INTO waitlist_signups (email) VALUES (?)");
        return {
          bind(email) {
            insertedEmail = email;
            return { run: async () => ({ meta: { changes: 1 } }) };
          },
        };
      },
    },
  };

  const response = await worker.fetch(
    request("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "  CREATOR@Example.COM " }),
    }),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(insertedEmail, "creator@example.com");
  assert.deepEqual(await response.json(), {
    message: "You’re on the list. We’ll be in touch.",
  });
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
