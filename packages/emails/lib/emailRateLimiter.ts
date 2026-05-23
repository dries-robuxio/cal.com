import process from "node:process";

const DEFAULT_EMAIL_SEND_INTERVAL_MS = 5000;

let nextEmailSendAt = 0;
let emailSendQueue: Promise<void> = Promise.resolve();

const sleep = (delayMs: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, delayMs));

const getEmailSendIntervalMs = (): number => {
  const configuredIntervalMs = Number(process.env.EMAIL_SEND_INTERVAL_MS);

  if (Number.isFinite(configuredIntervalMs) && configuredIntervalMs > 0) {
    return configuredIntervalMs;
  }

  return DEFAULT_EMAIL_SEND_INTERVAL_MS;
};

export const waitForEmailRateLimit = (): Promise<void> => {
  const queuedEmailSend = emailSendQueue.then(async () => {
    const delayMs = Math.max(0, nextEmailSendAt - Date.now());

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    nextEmailSendAt = Date.now() + getEmailSendIntervalMs();
  });

  emailSendQueue = queuedEmailSend.catch(() => undefined);

  return queuedEmailSend;
};

export const resetEmailRateLimitForTests = (): void => {
  nextEmailSendAt = 0;
  emailSendQueue = Promise.resolve();
};
