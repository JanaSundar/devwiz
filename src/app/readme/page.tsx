import LazyReadmeClient from "@/components/readme/LazyReadmeClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export default function ReadmePage() {
  return (
    <ToolPageLayout>
      <LazyReadmeClient />
    </ToolPageLayout>
  );
}
