import { SENDER_NAME } from "@calcom/lib/constants";
import { JSDOM } from "jsdom";

import renderEmail from "../src/renderEmail";
import BaseEmail from "./_base-email";

type Attachment = {
  content: string;
  filename: string;
  [key: string]: unknown;
};

type WorkflowEmailData = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  sender?: string | null;
  attachments?: Attachment[];
};

class WorkflowEmail extends BaseEmail {
  mailData: WorkflowEmailData;

  constructor(mailData: WorkflowEmailData) {
    super();
    this.mailData = mailData;
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      to: this.mailData.to,
      from: `${this.mailData.sender || SENDER_NAME} <${this.getMailerOptions().from}>`,
      ...(this.mailData.replyTo && { replyTo: this.mailData.replyTo }),
      subject: this.mailData.subject,
      html: await buildWorkflowEmailHtml({
        subject: this.mailData.subject,
        html: this.mailData.html,
      }),
      attachments: this.mailData.attachments,
    };
  }
}

async function buildWorkflowEmailHtml({
  subject,
  html,
}: {
  subject: string;
  html?: string;
}): Promise<string> {
  return await renderEmail("WorkflowEmail", {
    subject,
    html: extractBodyHtml(addHTMLStyles(html)),
  });
}

function addHTMLStyles(html?: string): string {
  if (!html) {
    return "";
  }
  const dom = new JSDOM(html);
  // Select all <a> tags inside <h6> elements --> only used for emojis in rating template
  const links = Array.from(dom.window.document.querySelectorAll("h6 a")).map((link) => link as HTMLElement);

  links.forEach((link) => {
    link.style.fontSize = "20px";
    link.style.textDecoration = "none";
  });

  return dom.serialize();
}

function extractBodyHtml(html: string): string {
  const dom = new JSDOM(html);
  return dom.window.document.body.innerHTML;
}

export { addHTMLStyles, buildWorkflowEmailHtml };
export type { Attachment, WorkflowEmailData };
export default WorkflowEmail;
