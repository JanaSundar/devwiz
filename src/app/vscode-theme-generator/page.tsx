import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import VscodeThemeGeneratorClient from "@/components/VscodeThemeGeneratorClient";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "VSCode Theme Generator",
  description:
    "Create and customize VSCode color themes. Export workbench and syntax colors as theme JSON.",
  toolId: "vscode-theme-generator",
});

export default function VscodeThemeGeneratorPage() {
  return (
    <ToolPageLayout>
      <VscodeThemeGeneratorClient />
    </ToolPageLayout>
  );
}
