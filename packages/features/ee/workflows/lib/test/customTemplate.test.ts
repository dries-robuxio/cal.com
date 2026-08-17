import { describe, expect, test } from "vitest";

import customTemplate, { MEETING_URL_FALLBACK_TEXT } from "../reminders/templates/customTemplate";

const baseVariables = {
  eventName: "Discovery Call",
  organizerName: "Pavel Kycek",
  attendeeName: "Wouter Van Peteghem",
};

describe("customTemplate {MEETING_URL} handling", () => {
  test("fills anchor href when meetingUrl is available", () => {
    const body = '<a href="{MEETING_URL}">Join Google Meet</a>';
    const result = customTemplate(
      body,
      { ...baseVariables, meetingUrl: "https://meet.google.com/abc-defg-hij" },
      "en"
    );
    expect(result.text).toBe('<a href="https://meet.google.com/abc-defg-hij">Join Google Meet</a>');
  });

  test("replaces the whole link with a fallback notice when meetingUrl is missing", () => {
    const body = '<a href="{MEETING_URL}" style="color:#fff" target="_blank">Join Google Meet</a>';
    const result = customTemplate(body, { ...baseVariables }, "en");
    expect(result.text).not.toContain('href=""');
    expect(result.text).not.toContain("<a");
    expect(result.text).toBe(MEETING_URL_FALLBACK_TEXT);
  });

  test("replaces a bare {MEETING_URL} placeholder with the fallback notice when meetingUrl is missing", () => {
    const body = "Meeting link: {MEETING_URL}";
    const result = customTemplate(body, { ...baseVariables }, "en");
    expect(result.text).toBe(`Meeting link: ${MEETING_URL_FALLBACK_TEXT}`);
  });

  test("replaces a bare {MEETING_URL} placeholder with the URL when available", () => {
    const body = "Meeting link: {MEETING_URL}";
    const result = customTemplate(
      body,
      { ...baseVariables, meetingUrl: "https://meet.google.com/abc-defg-hij" },
      "en"
    );
    expect(result.text).toBe("Meeting link: https://meet.google.com/abc-defg-hij");
  });
});
