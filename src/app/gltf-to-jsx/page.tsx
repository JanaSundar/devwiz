import GltfToJsxClient from "@/components/GltfToJsxClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "GLTF to JSX - DevWiz",
  description: "Generate React Three Fiber JSX from GLTF/GLB models.",
};

export default function GltfToJsxPage() {
  return (
    <ToolPageLayout>
      <GltfToJsxClient />
    </ToolPageLayout>
  );
}
