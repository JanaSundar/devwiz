import LazyReactFlowClient from "@/components/LazyReactFlowClient";
import ToolPageLayout from "@/components/tooling/ToolPageLayout";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "Flow Board",
  description: "Node-based flow diagram whiteboard powered by React Flow.",
  toolId: "react-flow",
});

export default function FlowBoardPage() {
  return (
    <ToolPageLayout>
      <LazyReactFlowClient />
    </ToolPageLayout>
  );
}
