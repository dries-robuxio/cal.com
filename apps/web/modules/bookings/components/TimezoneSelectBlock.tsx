import { shallow } from "zustand/shallow";
import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

import { Timezone as PlatformTimezoneSelect } from "@calcom/atoms/timezone";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { useBookerTime } from "@calcom/features/bookings/Booker/components/hooks/useBookerTime";
import type { Timezone } from "@calcom/features/bookings/Booker/types";
import type { BookerEvent } from "@calcom/features/bookings/types";
import { useTimePreferences } from "@calcom/features/bookings/lib";
import { CURRENT_TIMEZONE } from "@calcom/lib/timezoneConstants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";

import { EventMetaBlock } from "./event-meta/Details";

const WebTimezoneSelect = dynamic(
  () => import("@calcom/features/components/timezone-select").then((mod) => mod.TimezoneSelect),
  {
    ssr: false,
  }
);

type TimezoneSelectBlockProps = {
  event?: Pick<BookerEvent, "lockTimeZoneToggleOnBookingPage" | "lockedTimeZone" | "schedule"> | null;
  isPlatform?: boolean;
  timeZones?: Timezone[];
  className?: string;
  contentClassName?: string;
  timezoneSelectClassName?: string;
  showLabel?: boolean;
  labelClassName?: string;
  showIcon?: boolean;
  showHelperText?: boolean;
  helperText?: string;
  helperClassName?: string;
  isProminent?: boolean;
  labelText?: string;
};

export const TimezoneSelectBlock = ({
  event,
  isPlatform = true,
  timeZones,
  className,
  contentClassName,
  timezoneSelectClassName,
  showLabel = false,
  labelClassName,
  showIcon = true,
  showHelperText = false,
  helperText,
  helperClassName,
  isProminent = false,
  labelText,
}: TimezoneSelectBlockProps) => {
  const { timezone } = useBookerTime();
  const [setTimezone] = useTimePreferences((state) => [state.setTimezone]);
  const [setBookerStoreTimezone] = useBookerStoreContext((state) => [state.setTimezone], shallow);
  const bookerState = useBookerStoreContext((state) => state.state);
  const { t } = useLocale();
  const [TimezoneSelect] = useMemo(
    () => (isPlatform ? [PlatformTimezoneSelect] : [WebTimezoneSelect]),
    [isPlatform]
  );

  useEffect(() => {
    if (event?.lockTimeZoneToggleOnBookingPage) {
      const lockedTimezone = event.lockedTimeZone || event.schedule?.timeZone;
      if (lockedTimezone) {
        setTimezone(lockedTimezone);
        setBookerStoreTimezone(lockedTimezone);
      }
    }
  }, [event, setBookerStoreTimezone, setTimezone]);

  useEffect(() => {
    if (!event?.lockTimeZoneToggleOnBookingPage && !timezone) {
      setTimezone(CURRENT_TIMEZONE);
      setBookerStoreTimezone(CURRENT_TIMEZONE);
    }
  }, [event?.lockTimeZoneToggleOnBookingPage, setBookerStoreTimezone, setTimezone, timezone]);

  const resolvedHelperText = helperText ?? t("timezone_search_hint");
  const resolvedLabelText = labelText ?? t("timezone_change_hint");
  const resolvedTimezone = timezone || CURRENT_TIMEZONE;
  const menuPortalTarget = isProminent && typeof document !== "undefined" ? document.body : undefined;

  return (
    <div>
      {showLabel && (
        <p className={classNames("text-subtle mb-2 text-sm font-medium", labelClassName)}>
          {resolvedLabelText}
        </p>
      )}
      {showHelperText && (
        <p className={classNames("text-muted mb-3 text-sm", helperClassName)}>{resolvedHelperText}</p>
      )}
      <EventMetaBlock
        className={classNames(
          "cursor-pointer [&_.current-timezone:before]:focus-within:opacity-100 [&_.current-timezone:before]:hover:opacity-100",
          className
        )}
        contentClassName={classNames(
          "relative",
          isProminent ? "w-full max-w-full" : "max-w-[90%]",
          contentClassName
        )}
        icon={showIcon ? "globe" : undefined}>
        {bookerState === "booking" ? (
          <>{resolvedTimezone}</>
        ) : (
          <span
            className={classNames(
              "current-timezone before:bg-subtle min-w-32 -mt-[2px] flex h-6 max-w-full items-center justify-start before:absolute before:inset-0 before:bottom-[-3px] before:left-[-30px] before:top-[-3px] before:w-[calc(100%+35px)] before:rounded-md before:py-3 before:opacity-0 before:transition-opacity",
              event?.lockTimeZoneToggleOnBookingPage ? "cursor-not-allowed" : ""
            )}
            data-testid="event-meta-current-timezone">
            <TimezoneSelect
              className={isProminent ? "w-full" : undefined}
              timeZones={timeZones}
              menuPosition={isProminent ? "fixed" : "absolute"}
              menuPortalTarget={menuPortalTarget}
              timezoneSelectCustomClassname={timezoneSelectClassName}
              placeholder={t("timezone_search_hint")}
              size={isProminent ? "md" : "sm"}
              grow={isProminent}
              classNames={{
                control: () =>
                  classNames(
                    "min-h-0! w-full focus-within:ring-0 shadow-none!",
                    isProminent
                      ? "h-11 px-4 border border-subtle bg-default rounded-md"
                      : "p-0 border-0 bg-transparent"
                  ),
                menu: () =>
                  classNames(
                    "mb-1",
                    isProminent ? "w-[320px] sm:w-[360px] max-w-[90vw]" : "w-64! max-w-[90vw]"
                  ),
                singleValue: () => "text-text py-1",
                indicatorsContainer: () => "ml-auto",
                container: () => "w-full max-w-full",
                input: () => classNames("text-emphasis h-6 w-full max-w-full", isProminent && "text-base"),
                valueContainer: () => "text-emphasis placeholder:text-muted flex w-full gap-1",
                menuList: () => classNames("max-h-[280px]", isProminent && "max-h-[320px]"),
              }}
              value={
                event?.lockTimeZoneToggleOnBookingPage
                  ? event.lockedTimeZone || CURRENT_TIMEZONE
                  : resolvedTimezone
              }
              onChange={({ value }) => {
                setTimezone(value);
                setBookerStoreTimezone(value);
              }}
              isDisabled={event?.lockTimeZoneToggleOnBookingPage}
            />
          </span>
        )}
      </EventMetaBlock>
    </div>
  );
};
