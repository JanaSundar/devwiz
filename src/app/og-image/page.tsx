import OgImageClient from "@/components/OgImageClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "OG Image Generator",
  description: "Generate social preview images with @vercel/og.",
  toolId: "og-image",
});

export default function OgImagePage() {
  return (
    <ToolPageLayout>
      <OgImageClient />
    </ToolPageLayout>
  );
}
