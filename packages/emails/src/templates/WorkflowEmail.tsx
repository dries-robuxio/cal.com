import { BaseEmailHtml, RawHtml } from "../components";

export const WorkflowEmail = (props: { subject: string; html: string }) => (
  <BaseEmailHtml subject={props.subject}>
    <RawHtml html={props.html} />
  </BaseEmailHtml>
);
