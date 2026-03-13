import type { NodeTypes } from "@xyflow/react";
import CompactJsonNode from "./CompactJsonNode";
import EditableDiagramNode from "./EditableDiagramNode";

export const diagramNodeTypes: NodeTypes = {
  default: EditableDiagramNode,
  input: EditableDiagramNode,
  compactJson: CompactJsonNode,
};
