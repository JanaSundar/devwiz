import CurlConverterClient from "@/components/CurlConverterClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "cURL Converter - DevWiz",
  description:
    "Convert curl commands to Fetch, Axios, Python requests, and Node HTTP code.",
};

export default function CurlConverterPage() {
  return (
    <ToolPageLayout>
      <CurlConverterClient />
    </ToolPageLayout>
  );
}
