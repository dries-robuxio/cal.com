import { describe, expect, it } from "vitest";

import { buildWorkflowEmailHtml } from "./workflow-email";

describe("buildWorkflowEmailHtml", () => {
  it("wraps workflow email content in the Robuxio email shell", async () => {
    const html = await buildWorkflowEmailHtml({
      subject: "Reminder",
      html: '<body><p>Join from <a href="https://meet.example.com/abc">https://meet.example.com/abc</a></p></body>',
    });

    expect(html).toContain("robuxio-logo-white.png");
    expect(html).toContain("Join from");
    expect(html).toContain("https://meet.example.com/abc");
    expect(html).not.toContain("<body><body");
  });
});
