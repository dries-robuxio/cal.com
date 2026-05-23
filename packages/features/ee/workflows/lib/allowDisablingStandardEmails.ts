import { WorkflowActions, WorkflowTriggerEvents } from "@calcom/prisma/enums";

type WorkflowWithStepsAndTrigger = {
  trigger: WorkflowTriggerEvents;
  steps: {
    action: WorkflowActions;
  }[];
};

export function allowDisablingHostConfirmationEmails(workflows: WorkflowWithStepsAndTrigger[]): boolean {
  return hasHostNewEventEmailWorkflow(workflows);
}

export function allowDisablingAttendeeConfirmationEmails(workflows: WorkflowWithStepsAndTrigger[]): boolean {
  return (
    hasAttendeeNewEventEmailWorkflow(workflows) ||
    !!workflows.find(
      (workflow) =>
        workflow.trigger === WorkflowTriggerEvents.NEW_EVENT &&
        !!workflow.steps.find((step) => step.action === WorkflowActions.SMS_ATTENDEE)
    )
  );
}

export function hasHostNewEventEmailWorkflow(workflows: WorkflowWithStepsAndTrigger[]): boolean {
  return !!workflows.find(
    (workflow) =>
      workflow.trigger === WorkflowTriggerEvents.NEW_EVENT &&
      !!workflow.steps.find((step) => step.action === WorkflowActions.EMAIL_HOST)
  );
}

export function hasAttendeeNewEventEmailWorkflow(workflows: WorkflowWithStepsAndTrigger[]): boolean {
  return !!workflows.find(
    (workflow) =>
      workflow.trigger === WorkflowTriggerEvents.NEW_EVENT &&
      !!workflow.steps.find((step) => step.action === WorkflowActions.EMAIL_ATTENDEE)
  );
}
