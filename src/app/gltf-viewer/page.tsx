import LazyGltfViewerClient from "@/components/LazyGltfViewerClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";

export const metadata = {
  title: "GLTF Viewer - DevWiz",
  description: "Upload and inspect GLTF/GLB models in an interactive 3D scene.",
};

export default function GltfViewerPage() {
  return (
    <ToolPageLayout>
      <LazyGltfViewerClient />
    </ToolPageLayout>
  );
}
