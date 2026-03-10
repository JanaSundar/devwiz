import FakerJsClient from "@/components/FakerJsClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Fake Data Generator - DevWiz",
  description:
    "Generate fake person, company, product, address, and module-based data tiles.",
};

export default function FakerJsPage() {
  return (
    <ToolPageLayout>
      <FakerJsClient />
    </ToolPageLayout>
  );
}
