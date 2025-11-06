import { startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const PH_TIMEZONE = "Asia/Manila";

export function getPhilippineDayRange() {
  const now = new Date();

  const phTime = toZonedTime(now, PH_TIMEZONE);

  const startOfDayPH = startOfDay(phTime);
  const endOfDayPH = endOfDay(phTime);

  const startOfDayUTC = fromZonedTime(startOfDayPH, PH_TIMEZONE);
  const endOfDayUTC = fromZonedTime(endOfDayPH, PH_TIMEZONE);

  return { startOfDay: startOfDayUTC, endOfDay: endOfDayUTC };
}
