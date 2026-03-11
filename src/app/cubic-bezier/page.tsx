import CubicBezierClient from "@/components/CubicBezierClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Cubic-Bezier Visualizer - DevWiz",
  description:
    "Interactive cubic-bezier graph, preview, and copyable CSS/motion values.",
};

export default function CubicBezierPage() {
  return (
    <ToolPageLayout>
      <CubicBezierClient />
    </ToolPageLayout>
  );
}
