import DiffViewerClient from "@/components/DiffViewerClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Diff Viewer — DevWiz",
  description: "Compare text, code, or JSON with side-by-side or inline diffs.",
};

export default function DiffViewerPage() {
  return (
    <ToolPageLayout>
      <DiffViewerClient />
    </ToolPageLayout>
  );
}
