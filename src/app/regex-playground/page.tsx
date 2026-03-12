import RegexPlaygroundClient from "@/components/RegexPlaygroundClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Regex Playground - DevWiz",
  description: "Build, test, and debug JavaScript regular expressions.",
};

export default function RegexPlaygroundPage() {
  return (
    <ToolPageLayout>
      <RegexPlaygroundClient />
    </ToolPageLayout>
  );
}
