const EMAIL_SEND_INTERVAL_MS = 1000;

let nextEmailSendAt = 0;
let emailSendQueue = Promise.resolve();

const sleep = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));

export const waitForEmailRateLimit = () => {
  const queuedEmailSend = emailSendQueue.then(async () => {
    const delayMs = Math.max(0, nextEmailSendAt - Date.now());

    if (delayMs > 0) {
      await sleep(delayMs);
    }

    nextEmailSendAt = Date.now() + EMAIL_SEND_INTERVAL_MS;
  });

  emailSendQueue = queuedEmailSend.catch(() => undefined);

  return queuedEmailSend;
};

export const resetEmailRateLimitForTests = () => {
  nextEmailSendAt = 0;
  emailSendQueue = Promise.resolve();
};
