import PasswordGeneratorClient from "@/components/PasswordGeneratorClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Password Generator - DevWiz",
  description: "Generate strong random passwords with configurable options.",
};

export default function PasswordGeneratorPage() {
  return (
    <ToolPageLayout>
      <PasswordGeneratorClient />
    </ToolPageLayout>
  );
}
