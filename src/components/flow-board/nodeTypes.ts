import type { NodeTypes } from "@xyflow/react";
import ApiErrorNode from "./ApiErrorNode";
import ApiRequestNode from "./ApiRequestNode";
import ApiResponseNode from "./ApiResponseNode";
import InputNode from "./InputNode";
import JsonStructureNode from "./JsonStructureNode";
import OutputNode from "./OutputNode";
import TransformNode from "./TransformNode";

export const workflowNodeTypes: NodeTypes = {
  workflowInput: InputNode,
  workflowTransform: TransformNode,
  workflowOutput: OutputNode,
  workflowApiRequest: ApiRequestNode,
  workflowApiResponse: ApiResponseNode,
  workflowApiError: ApiErrorNode,
  workflowJsonStructure: JsonStructureNode,
};
