import FlexGridPlaygroundClient from "@/components/FlexGridPlaygroundClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Flex & Grid Playground",
  description:
    "Experiment with CSS Flexbox and Grid — edit CSS and see the layout update live.",
  toolId: "flex-grid-playground",
});

export default function FlexGridPlaygroundPage() {
  return (
    <ToolPageLayout>
      <FlexGridPlaygroundClient />
    </ToolPageLayout>
  );
}
