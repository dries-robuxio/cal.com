import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetEmailRateLimitForTests, waitForEmailRateLimit } from "./emailRateLimiter";

describe("waitForEmailRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-27T00:00:00.000Z"));
    resetEmailRateLimitForTests();
  });

  afterEach(() => {
    resetEmailRateLimitForTests();
    vi.useRealTimers();
  });

  it("allows the first email immediately", async () => {
    await expect(waitForEmailRateLimit()).resolves.toBeUndefined();
  });

  it("spaces concurrent email sends five seconds apart", async () => {
    const firstSend = waitForEmailRateLimit();
    const secondSend = waitForEmailRateLimit();
    const thirdSend = waitForEmailRateLimit();

    await expect(firstSend).resolves.toBeUndefined();

    let secondSendResolved = false;
    void secondSend.then(() => {
      secondSendResolved = true;
    });

    await vi.advanceTimersByTimeAsync(4999);
    expect(secondSendResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(secondSend).resolves.toBeUndefined();

    let thirdSendResolved = false;
    void thirdSend.then(() => {
      thirdSendResolved = true;
    });

    await vi.advanceTimersByTimeAsync(4999);
    expect(thirdSendResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(thirdSend).resolves.toBeUndefined();
  });

  it("allows the send interval to be configured", async () => {
    vi.stubEnv("EMAIL_SEND_INTERVAL_MS", "2500");

    const firstSend = waitForEmailRateLimit();
    const secondSend = waitForEmailRateLimit();

    await expect(firstSend).resolves.toBeUndefined();

    let secondSendResolved = false;
    void secondSend.then(() => {
      secondSendResolved = true;
    });

    await vi.advanceTimersByTimeAsync(2499);
    expect(secondSendResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(secondSend).resolves.toBeUndefined();
  });
});
