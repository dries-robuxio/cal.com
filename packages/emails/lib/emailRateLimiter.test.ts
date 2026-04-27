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

  it("spaces concurrent email sends one second apart", async () => {
    const firstSend = waitForEmailRateLimit();
    const secondSend = waitForEmailRateLimit();
    const thirdSend = waitForEmailRateLimit();

    await expect(firstSend).resolves.toBeUndefined();

    let secondSendResolved = false;
    void secondSend.then(() => {
      secondSendResolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(secondSendResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(secondSend).resolves.toBeUndefined();

    let thirdSendResolved = false;
    void thirdSend.then(() => {
      thirdSendResolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(thirdSendResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(thirdSend).resolves.toBeUndefined();
  });
});
