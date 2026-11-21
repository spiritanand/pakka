import type { ReactNode } from "react";

export function ByRole({ work, pay }: { work: ReactNode; pay: ReactNode }) {
  return (
    <>
      <span className="paying:hidden">{work}</span>
      <span className="hidden paying:inline">{pay}</span>
    </>
  );
}
