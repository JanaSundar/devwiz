import HashGeneratorClient from "@/components/HashGeneratorClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "Hash Generator - DevWiz",
  description: "Generate MD5/SHA hashes and bcrypt hash/verify in one tool.",
};

export default function HashGeneratorPage() {
  return (
    <ToolPageLayout>
      <HashGeneratorClient />
    </ToolPageLayout>
  );
}
