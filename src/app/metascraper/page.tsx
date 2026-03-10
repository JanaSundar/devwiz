import MetascraperClient from "@/components/MetascraperClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Metascraper - DevWiz",
  description: "Extract metadata from a web page URL with Metascraper.",
};

export default function MetascraperPage() {
  return (
    <ToolPageLayout>
      <MetascraperClient />
    </ToolPageLayout>
  );
}
