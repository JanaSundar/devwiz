import BlurhashClient from "@/components/BlurhashClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "BlurHash Generator - DevWiz",
  description: "Generate BlurHash strings from uploaded images.",
};

export default function BlurhashPage() {
  return (
    <ToolPageLayout>
      <BlurhashClient />
    </ToolPageLayout>
  );
}
