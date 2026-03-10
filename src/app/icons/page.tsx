import IconSearchClient from "@/components/IconSearchClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = { title: "Icon Search — DevWiz" };

export default function IconsPage() {
  return (
    <ToolPageLayout>
      <IconSearchClient />
    </ToolPageLayout>
  );
}
