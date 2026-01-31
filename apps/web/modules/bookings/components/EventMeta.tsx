import { m } from "framer-motion";

import { shallow } from "zustand/shallow";

import { EventDetails, EventMembers, EventMetaSkeleton, EventTitle } from "./event-meta";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import type { Timezone } from "@calcom/features/bookings/Booker/types";
import { SeatsAvailabilityText } from "@calcom/web/modules/bookings/components/SeatsAvailabilityText";
import { EventMetaBlock } from "@calcom/web/modules/bookings/components/event-meta/Details";
import type { BookerEvent } from "@calcom/features/bookings/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { markdownToSafeHTMLClient } from "@calcom/lib/markdownToSafeHTMLClient";
import type { EventTypeTranslation } from "@calcom/prisma/client";
import { EventTypeAutoTranslatedField } from "@calcom/prisma/enums";

import i18nConfigration from "../../../../../i18n.json";
import { fadeInUp } from "@calcom/features/bookings/Booker/config";
import { FromToTime } from "@calcom/features/bookings/Booker/utils/dates";
import { ScrollableWithGradients } from "./ScrollableWithGradients";
import { useBookerTime } from "@calcom/features/bookings/Booker/components/hooks/useBookerTime";
import { TimezoneSelectBlock } from "./TimezoneSelectBlock";

const getTranslatedField = (
  translations: Array<Pick<EventTypeTranslation, "field" | "targetLocale" | "translatedText">>,
  field: EventTypeAutoTranslatedField,
  userLocale: string
) => {
  const i18nLocales = i18nConfigration.locale.targets.concat([i18nConfigration.locale.source]);

  return translations?.find(
    (trans) =>
      trans.field === field &&
      i18nLocales.includes(trans.targetLocale) &&
      (userLocale === trans.targetLocale || userLocale.split("-")[0] === trans.targetLocale)
  )?.translatedText;
};

export const EventMeta = ({
  event,
  isPending,
  isPlatform = true,
  isPrivateLink,
  classNames,
  locale,
  timeZones,
  children,
  selectedTimeslot,
  roundRobinHideOrgAndTeam,
  hideEventTypeDetails = false,
  showTimezoneSelect = true,
}: {
  event?: Pick<
    BookerEvent,
    | "lockTimeZoneToggleOnBookingPage"
    | "lockedTimeZone"
    | "schedule"
    | "seatsPerTimeSlot"
    | "subsetOfUsers"
    | "length"
    | "schedulingType"
    | "profile"
    | "entity"
    | "description"
    | "title"
    | "metadata"
    | "locations"
    | "currency"
    | "requiresConfirmation"
    | "recurringEvent"
    | "price"
    | "isDynamic"
    | "fieldTranslations"
    | "autoTranslateDescriptionEnabled"
  > | null;
  isPending: boolean;
  isPrivateLink: boolean;
  isPlatform?: boolean;
  classNames?: {
    eventMetaContainer?: string;
    eventMetaTitle?: string;
    eventMetaTimezoneSelect?: string;
    eventMetaChildren?: string;
  };
  locale?: string | null;
  timeZones?: Timezone[];
  children?: React.ReactNode;
  selectedTimeslot: string | null;
  roundRobinHideOrgAndTeam?: boolean;
  hideEventTypeDetails?: boolean;
  showTimezoneSelect?: boolean;
}) => {
  const { timeFormat, timezone } = useBookerTime();
  const selectedDuration = useBookerStoreContext((state) => state.selectedDuration);
  const bookerState = useBookerStoreContext((state) => state.state);
  const bookingData = useBookerStoreContext((state) => state.bookingData);
  const rescheduleUid = useBookerStoreContext((state) => state.rescheduleUid);
  const [seatedEventData, setSeatedEventData] = useBookerStoreContext(
    (state) => [state.seatedEventData, state.setSeatedEventData],
    shallow
  );
  const { i18n, t } = useLocale();

  if (hideEventTypeDetails) {
    return null;
  }
  // If we didn't pick a time slot yet, we load bookingData via SSR so bookingData should be set
  // Otherwise we load seatedEventData from useBookerStore
  const bookingSeatAttendeesQty = seatedEventData?.attendees || bookingData?.attendees.length;
  const eventTotalSeats = seatedEventData?.seatsPerTimeSlot || event?.seatsPerTimeSlot;

  const isHalfFull =
    bookingSeatAttendeesQty && eventTotalSeats && bookingSeatAttendeesQty / eventTotalSeats >= 0.5;
  const isNearlyFull =
    bookingSeatAttendeesQty && eventTotalSeats && bookingSeatAttendeesQty / eventTotalSeats >= 0.83;

  const colorClass = isNearlyFull
    ? "text-rose-600"
    : isHalfFull
    ? "text-yellow-500"
    : "text-bookinghighlight";
  const userLocale = locale ?? navigator.language;
  const translatedDescription = getTranslatedField(
    event?.fieldTranslations ?? [],
    EventTypeAutoTranslatedField.DESCRIPTION,
    userLocale
  );
  const translatedTitle = getTranslatedField(
    event?.fieldTranslations ?? [],
    EventTypeAutoTranslatedField.TITLE,
    userLocale
  );

  return (
    <div className={`${classNames?.eventMetaContainer || ""} relative z-10 p-6`} data-testid="event-meta">
      {isPending && (
        <m.div {...fadeInUp} initial="visible" layout>
          <EventMetaSkeleton />
        </m.div>
      )}
      {!isPending && !!event && (
        <m.div {...fadeInUp} layout transition={{ ...fadeInUp.transition, delay: 0.3 }}>
          <EventMembers
            schedulingType={event.schedulingType}
            users={event.subsetOfUsers}
            profile={event.profile}
            entity={event.entity}
            isPrivateLink={isPrivateLink}
            roundRobinHideOrgAndTeam={roundRobinHideOrgAndTeam}
          />
          <EventTitle className={`${classNames?.eventMetaTitle} my-2`}>
            {translatedTitle ?? event?.title}
          </EventTitle>
          <div className="stack-y-4 font-medium rtl:-mr-2">
            {rescheduleUid && bookingData && (
              <EventMetaBlock icon="calendar">
                {t("former_time")}
                <br />
                <span className="line-through" data-testid="former_time_p">
                  <FromToTime
                    date={bookingData.startTime.toString()}
                    duration={null}
                    timeFormat={timeFormat}
                    timeZone={timezone}
                    language={i18n.language}
                  />
                </span>
              </EventMetaBlock>
            )}
            {selectedTimeslot && (
              <EventMetaBlock icon="calendar">
                <FromToTime
                  date={selectedTimeslot}
                  duration={selectedDuration || event.length}
                  timeFormat={timeFormat}
                  timeZone={timezone}
                  language={i18n.language}
                />
              </EventMetaBlock>
            )}
            <EventDetails event={event} />
            {showTimezoneSelect && (
              <TimezoneSelectBlock
                event={event}
                isPlatform={isPlatform}
                timeZones={timeZones}
                timezoneSelectClassName={classNames?.eventMetaTimezoneSelect}
              />
            )}
            {!showTimezoneSelect && bookerState === "booking" && (
              <EventMetaBlock icon="globe">{timezone}</EventMetaBlock>
            )}
            {bookerState === "booking" && eventTotalSeats && bookingSeatAttendeesQty ? (
              <EventMetaBlock icon="user" className={`${colorClass}`}>
                <div className="text-bookinghighlight flex items-start text-sm">
                  <p>
                    <SeatsAvailabilityText
                      showExact={!!seatedEventData.showAvailableSeatsCount}
                      totalSeats={eventTotalSeats}
                      bookedSeats={bookingSeatAttendeesQty || 0}
                      variant="fraction"
                    />
                  </p>
                </div>
              </EventMetaBlock>
            ) : null}
          </div>
          {bookerState !== "booking" && (event.description || translatedDescription) && (
            <EventMetaBlock data-testid="event-meta-description" contentClassName="mb-8">
              <ScrollableWithGradients
                className="wrap-break-word max-w-full overflow-visible text-base leading-relaxed"
                ariaLabel={t("description")}>
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized via markdownToSafeHTMLClient */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: markdownToSafeHTMLClient(translatedDescription ?? event.description),
                  }}
                />
              </ScrollableWithGradients>
            </EventMetaBlock>
          )}
          {children && <div className={classNames?.eventMetaChildren}>{children}</div>}
        </m.div>
      )}
    </div>
  );
};
