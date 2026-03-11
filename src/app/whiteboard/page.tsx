import ExcalidrawClient from "@/components/ExcalidrawClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Whiteboard",
  description: "An infinite canvas whiteboard powered by Excalidraw.",
  toolId: "tldraw",
});

export default function WhiteboardPage() {
  return (
    <ToolPageLayout>
      <ExcalidrawClient />
    </ToolPageLayout>
  );
}
