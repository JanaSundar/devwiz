export interface PipelineTransform {
  id: string;
  name: string;
}

export const PIPELINE_TRANSFORMS: PipelineTransform[] = [
  { id: "json-to-yaml", name: "JSON → YAML" },
  { id: "yaml-to-json", name: "YAML → JSON" },
  { id: "json-to-typescript", name: "JSON → TypeScript" },
  { id: "json-to-toml", name: "JSON → TOML" },
  { id: "toml-to-json", name: "TOML → JSON" },
  { id: "yaml-to-toml", name: "YAML → TOML" },
  { id: "toml-to-yaml", name: "TOML → YAML" },
  { id: "xml-to-json", name: "XML → JSON" },
  { id: "json-to-schema", name: "JSON → JSON Schema" },
  { id: "js-to-json", name: "JS Object → JSON" },
];
