export interface TransformConfig {
  id: string;
  name: string;
  category: string;
  inputLabel: string;
  outputLabel: string;
  inputLang: string;
  outputLang: string;
  placeholder: string;
}

export const transforms: TransformConfig[] = [
  // --- Utilities ---
  {
    id: "icon-search",
    name: "Icon Search",
    category: "Utilities",
    inputLabel: "Search",
    outputLabel: "Icons",
    inputLang: "markdown",
    outputLang: "html",
    placeholder: "Search 200k+ icons from Iconify",
  },
  {
    id: "tldraw",
    name: "Whiteboard",
    category: "Utilities",
    inputLabel: "Canvas",
    outputLabel: "Board",
    inputLang: "canvas",
    outputLang: "canvas",
    placeholder: "Infinite canvas powered by tldraw",
  },
  {
    id: "diff-viewer",
    name: "Diff Viewer",
    category: "Utilities",
    inputLabel: "Text",
    outputLabel: "Diff",
    inputLang: "markdown",
    outputLang: "diff",
    placeholder: "Compare two pieces of code, text, or JSON.",
  },
  {
    id: "og-image",
    name: "OG Image Generator",
    category: "Utilities",
    inputLabel: "Metadata",
    outputLabel: "OG Image",
    inputLang: "markdown",
    outputLang: "html",
    placeholder: "Generate social preview images with @vercel/og",
  },
  {
    id: "metascraper",
    name: "Metascraper",
    category: "Utilities",
    inputLabel: "URL",
    outputLabel: "Metadata JSON",
    inputLang: "markdown",
    outputLang: "json",
    placeholder: "Extract title, description, and image metadata from a URL",
  },
  {
    id: "id-studio",
    name: "UUID / NanoID / ULID Studio",
    category: "Utilities",
    inputLabel: "Options",
    outputLabel: "Generated IDs",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "Generate and validate IDs quickly",
  },
  {
    id: "faker-js",
    name: "Fake Data Generator",
    category: "Utilities",
    inputLabel: "Config",
    outputLabel: "Generated Tiles",
    inputLang: "markdown",
    outputLang: "json",
    placeholder: "Generate fake data as cards and copy any card as JSON.",
  },
  {
    id: "curl-converter",
    name: "cURL Converter",
    category: "Utilities",
    inputLabel: "cURL",
    outputLabel: "Generated Code",
    inputLang: "shell",
    outputLang: "javascript",
    placeholder:
      "curl 'https://api.example.com/users' -H 'Authorization: Bearer TOKEN'",
  },
  {
    id: "blurhash",
    name: "BlurHash Generator",
    category: "Utilities",
    inputLabel: "Image",
    outputLabel: "BlurHash",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "Upload an image and generate a compact BlurHash string.",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    category: "Utilities",
    inputLabel: "Text",
    outputLabel: "Hash / Verify",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder:
      "Generate MD5, SHA variants, and bcrypt hash/verify in one place.",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    category: "Utilities",
    inputLabel: "Options",
    outputLabel: "Generated Passwords",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "Generate strong random passwords with custom rules.",
  },
  {
    id: "jwt-debugger",
    name: "JWT Debugger",
    category: "Utilities",
    inputLabel: "JWT Token",
    outputLabel: "Decoded Info",
    inputLang: "markdown",
    outputLang: "json",
    placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    category: "Utilities",
    inputLabel: "Time",
    outputLabel: "Converted",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "1700000000",
  },
  {
    id: "cron",
    name: "Cron Expression Helper",
    category: "Utilities",
    inputLabel: "Cron",
    outputLabel: "Explanation",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "*/5 * * * *",
  },
  {
    id: "gltf-viewer",
    name: "GLTF/GLB 3D Model Viewer",
    category: "Utilities",
    inputLabel: "Model",
    outputLabel: "3D Preview",
    inputLang: "markdown",
    outputLang: "html",
    placeholder: "Upload a .glb or .gltf model to preview with orbit controls.",
  },
  {
    id: "cubic-bezier",
    name: "Cubic-Bezier Visualizer",
    category: "Utilities",
    inputLabel: "Control Points",
    outputLabel: "CSS/Motion",
    inputLang: "markdown",
    outputLang: "css",
    placeholder: "Adjust bezier handles and copy CSS or Motion timing values.",
  },

  // --- AI Tools ---
  {
    id: "ai-regex-explainer",
    name: "Regex Explainer (AI)",
    category: "AI Tools",
    inputLabel: "Regex / Prompt",
    outputLabel: "Explanation / Generated Regex",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
  },
  {
    id: "ai-code-commenter",
    name: "Code Commenter (AI)",
    category: "AI Tools",
    inputLabel: "Code",
    outputLabel: "Commented Code",
    inputLang: "javascript",
    outputLang: "javascript",
    placeholder:
      "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}",
  },
  {
    id: "ai-mock-data",
    name: "Mock Data Generator (AI)",
    category: "AI Tools",
    inputLabel: "Schema / Prompt",
    outputLabel: "JSON Data",
    inputLang: "json",
    outputLang: "json",
    placeholder:
      '{\n  "users": [\n    { "name": "String", "age": "Number", "email": "String" }\n  ]\n}',
  },
  {
    id: "ai-commit-msg",
    name: "Commit Message (AI)",
    category: "AI Tools",
    inputLabel: "Git Diff",
    outputLabel: "Commit Msg",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: '+ function hello() { console.log("world") }',
  },
  {
    id: "ai-error-explainer",
    name: "Error Explainer (AI)",
    category: "AI Tools",
    inputLabel: "Stack Trace",
    outputLabel: "Explanation / Fix",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder:
      'TypeError: Cannot read properties of undefined (reading "map")\n    at RenderList (app.js:10:42)',
  },

  // --- Converters ---
  {
    id: "svg-to-jsx",
    name: "SVG to JSX",
    category: "Converters",
    inputLabel: "SVG",
    outputLabel: "React JSX",
    inputLang: "xml",
    outputLang: "typescript",
    placeholder:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">\n  <circle cx="12" cy="12" r="10" />\n  <line x1="12" y1="8" x2="12" y2="12" />\n  <line x1="12" y1="16" x2="12.01" y2="16" />\n</svg>',
  },
  {
    id: "svg-viewer",
    name: "SVG Viewer",
    category: "Converters",
    inputLabel: "SVG",
    outputLabel: "Preview",
    inputLang: "xml",
    outputLang: "html",
    placeholder:
      '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" fill="none">\n  <rect width="220" height="220" rx="36" fill="#1e4d2b"/>\n  <path d="M51 119L90 157L170 78" stroke="#f5f2e0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>\n  <circle cx="170" cy="78" r="18" fill="#6db87a"/>\n</svg>',
  },
  {
    id: "color-converter",
    name: "Color Converter",
    category: "Converters",
    inputLabel: "Color",
    outputLabel: "Formats",
    inputLang: "css",
    outputLang: "css",
    placeholder: "#ff5c5c\nhsl(0, 100%, 68%)",
  },
  {
    id: "string-case",
    name: "String Case Converter",
    category: "Converters",
    inputLabel: "Text",
    outputLabel: "Converted",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder: "camelCase\nsnake_case\nPascalCase",
  },

  // --- Others ---
  {
    id: "json-to-typescript",
    name: "JSON to TypeScript",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "TypeScript",
    inputLang: "json",
    outputLang: "typescript",
    placeholder:
      '{\n  "id": 1,\n  "name": "John",\n  "email": "john@example.com",\n  "active": true,\n  "tags": ["admin", "user"]\n}',
  },
  {
    id: "url-codec",
    name: "URL Encode / Decode",
    category: "Encoding",
    inputLabel: "Text",
    outputLabel: "Encoded/Decoded",
    inputLang: "markdown",
    outputLang: "markdown",
    placeholder:
      "Hello World! How are you?\nhttps://example.com/path?query=value&foo=bar",
  },
  {
    id: "json-to-tree",
    name: "JSON to Tree View",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "Tree View",
    inputLang: "json",
    outputLang: "json",
    placeholder:
      '{\n  "name": "DevWiz",\n  "version": "1.0.0",\n  "features": ["json-to-tree", "svg-viewer"],\n  "config": { "theme": "light", "autosave": true }\n}',
  },
  {
    id: "json-to-graph",
    name: "JSON to Graph",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "Graph View",
    inputLang: "json",
    outputLang: "json",
    placeholder:
      '{\n  "name": "DevWiz",\n  "version": "1.0.0",\n  "features": ["json-to-tree", "json-to-graph", "svg-viewer"],\n  "config": { "theme": "light", "autosave": true }\n}',
  },
  {
    id: "css-to-tailwind",
    name: "CSS to Tailwind",
    category: "CSS",
    inputLabel: "CSS",
    outputLabel: "Tailwind Classes",
    inputLang: "css",
    outputLang: "html",
    placeholder:
      ".card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 16px;\n  border-radius: 8px;\n  background-color: #1a1a2e;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n}",
  },
  {
    id: "json-to-yaml",
    name: "JSON to YAML",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "YAML",
    inputLang: "json",
    outputLang: "yaml",
    placeholder:
      '{\n  "name": "DevWiz",\n  "version": "1.0.0",\n  "features": ["transform", "readme"]\n}',
  },
  {
    id: "yaml-to-json",
    name: "YAML to JSON",
    category: "YAML",
    inputLabel: "YAML",
    outputLabel: "JSON",
    inputLang: "yaml",
    outputLang: "json",
    placeholder:
      "name: DevWiz\nversion: 1.0.0\nfeatures:\n  - transform\n  - readme",
  },
  {
    id: "js-to-json",
    name: "JS Object to JSON",
    category: "JavaScript",
    inputLabel: "JS Object",
    outputLabel: "JSON",
    inputLang: "javascript",
    outputLang: "json",
    placeholder:
      "{\n  name: 'DevWiz',\n  version: '1.0.0',\n  features: ['transform', 'readme'],\n  config: { theme: 'dark' }\n}",
  },
  {
    id: "css-to-js",
    name: "CSS to JS Objects",
    category: "CSS",
    inputLabel: "CSS",
    outputLabel: "JS Object",
    inputLang: "css",
    outputLang: "javascript",
    placeholder:
      ".container {\n  display: flex;\n  align-items: center;\n  background-color: #1a1a2e;\n  border-radius: 8px;\n  padding: 16px;\n}",
  },
  {
    id: "markdown-to-html",
    name: "Markdown to HTML",
    category: "Markdown",
    inputLabel: "Markdown",
    outputLabel: "HTML",
    inputLang: "markdown",
    outputLang: "html",
    placeholder:
      '# Hello World\n\nThis is a **bold** paragraph with `inline code`.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log("hello");\n```',
  },
  {
    id: "xml-to-json",
    name: "XML to JSON",
    category: "XML",
    inputLabel: "XML",
    outputLabel: "JSON",
    inputLang: "xml",
    outputLang: "json",
    placeholder:
      '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <user id="1">\n    <name>John</name>\n    <email>john@example.com</email>\n  </user>\n</root>',
  },
  {
    id: "json-to-schema",
    name: "JSON to JSON Schema",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "JSON Schema",
    inputLang: "json",
    outputLang: "json",
    placeholder:
      '{\n  "id": 1,\n  "name": "Product",\n  "price": 29.99,\n  "inStock": true,\n  "tags": ["electronics"]\n}',
  },
  {
    id: "json-to-toml",
    name: "JSON to TOML",
    category: "JSON",
    inputLabel: "JSON",
    outputLabel: "TOML",
    inputLang: "json",
    outputLang: "toml",
    placeholder:
      '{\n  "package": {\n    "name": "devwiz",\n    "version": "1.0.0"\n  },\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}',
  },
  {
    id: "toml-to-json",
    name: "TOML to JSON",
    category: "TOML",
    inputLabel: "TOML",
    outputLabel: "JSON",
    inputLang: "toml",
    outputLang: "json",
    placeholder:
      '[package]\nname = "devwiz"\nversion = "1.0.0"\n\n[dependencies]\nreact = "^18.0.0"',
  },
  {
    id: "yaml-to-toml",
    name: "YAML to TOML",
    category: "YAML",
    inputLabel: "YAML",
    outputLabel: "TOML",
    inputLang: "yaml",
    outputLang: "toml",
    placeholder:
      "server:\n  host: localhost\n  port: 3000\ndatabase:\n  name: mydb\n  user: admin",
  },
  {
    id: "toml-to-yaml",
    name: "TOML to YAML",
    category: "TOML",
    inputLabel: "TOML",
    outputLabel: "YAML",
    inputLang: "toml",
    outputLang: "yaml",
    placeholder:
      '[server]\nhost = "localhost"\nport = 3000\n\n[database]\nname = "mydb"\nuser = "admin"',
  },
];

export const categories = [
  "Utilities",
  "AI Tools",
  "Converters",
  ...new Set(
    transforms
      .map((t) => t.category)
      .filter((c) => !["Utilities", "AI Tools", "Converters"].includes(c)),
  ),
];

export function getTransformById(id: string) {
  return transforms.find((t) => t.id === id);
}
