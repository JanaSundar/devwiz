import LazyMermaidLabClient from "@/components/LazyMermaidLabClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Mermaid Studio",
  description:
    "Write Mermaid diagrams and preview instantly, then open in Flow Board.",
  toolId: "diagram-lab",
});

export default function DiagramLabPage() {
  return (
    <ToolPageLayout>
      <LazyMermaidLabClient />
    </ToolPageLayout>
  );
}
