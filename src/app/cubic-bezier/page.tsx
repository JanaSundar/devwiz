import CubicBezierClient from "@/components/CubicBezierClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Cubic-Bezier Visualizer",
  description:
    "Interactive cubic-bezier graph, preview, and copyable CSS/motion values.",
  toolId: "cubic-bezier",
});

export default function CubicBezierPage() {
  return (
    <ToolPageLayout>
      <CubicBezierClient />
    </ToolPageLayout>
  );
}
