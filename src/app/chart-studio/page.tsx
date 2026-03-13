import LazyGraphLabClient from "@/components/LazyGraphLabClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Chart Studio",
  description: "Render JSON data with modern Recharts chart options.",
  toolId: "graph-lab",
});

export default function GraphLabPage() {
  return (
    <ToolPageLayout>
      <LazyGraphLabClient />
    </ToolPageLayout>
  );
}
