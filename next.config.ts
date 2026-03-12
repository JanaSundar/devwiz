import path from "node:path";
import { withSerwist } from "@serwist/turbopack";

export default withSerwist({
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  serverExternalPackages: [
    "re2",
    "curlconverter",
    "tree-sitter",
    "tree-sitter-bash",
    "web-tree-sitter",
    "yamljs",
  ],
});
