const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const firstName = (name: string) => name.split(" (")[0];
export const inr = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");
export const day = (t: number) => {
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const when = (t: number) => {
  const d = new Date(t);
  const h = d.getHours();
  return `${day(t)}, ${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};
