import OgImageClient from "@/components/OgImageClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "OG Image Generator - DevWiz",
  description: "Generate social preview images with @vercel/og.",
};

export default function OgImagePage() {
  return (
    <ToolPageLayout>
      <OgImageClient />
    </ToolPageLayout>
  );
}
