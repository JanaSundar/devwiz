import { withSerwist } from "@serwist/turbopack";

export default withSerwist({
  serverExternalPackages: [
    "re2",
    "curlconverter",
    "tree-sitter",
    "tree-sitter-bash",
    "web-tree-sitter",
    "yamljs",
  ],
  turbopack: {},
});
