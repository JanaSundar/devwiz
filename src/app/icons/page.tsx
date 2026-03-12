import LazyIconSearchClient from "@/components/LazyIconSearchClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Icon Search",
  toolId: "icon-search",
});

export default function IconsPage() {
  return (
    <ToolPageLayout>
      <LazyIconSearchClient />
    </ToolPageLayout>
  );
}
