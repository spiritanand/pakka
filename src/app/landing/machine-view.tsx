import { landingMarkdown } from "@/lib/agent-content";
import { ViewToggle } from "./view-toggle";

export async function MachineView() {
  return <ViewToggle markdown={await landingMarkdown()} />;
}
