import IdStudioClient from "@/components/IdStudioClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "ID Studio - DevWiz",
  description: "Generate UUID, NanoID, and ULID values quickly.",
};

export default function IdStudioPage() {
  return (
    <ToolPageLayout>
      <IdStudioClient />
    </ToolPageLayout>
  );
}
