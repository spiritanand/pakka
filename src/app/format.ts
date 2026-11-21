const TZ = "Asia/Kolkata";
const dayFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

const part = (f: Intl.DateTimeFormat, t: number, type: Intl.DateTimeFormatPartTypes) =>
  f.formatToParts(t).find((p) => p.type === type)?.value ?? "";

export const firstName = (name: string) => name.split(" (")[0];
export const inr = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
export const day = (t: number) => `${part(dayFmt, t, "day")} ${part(dayFmt, t, "month")}`;
export const when = (t: number) =>
  `${day(t)}, ${part(timeFmt, t, "hour")}:${part(timeFmt, t, "minute")} ${part(timeFmt, t, "dayPeriod").toLowerCase()}`;

export const safeNext = (v: unknown) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/dashboard";
};
