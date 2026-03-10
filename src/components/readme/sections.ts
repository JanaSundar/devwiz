export interface ReadmeSection {
  id: string;
  type: string;
  title: string;
  content: string;
  enabled: boolean;
}

export const defaultSections: ReadmeSection[] = [
  {
    id: "title",
    type: "title",
    title: "Project Title",
    content:
      "# My Awesome Project\n\nA brief description of what this project does and who it's for.",
    enabled: true,
  },
  {
    id: "badges",
    type: "badges",
    title: "Badges",
    content:
      "![License](https://img.shields.io/badge/license-MIT-blue.svg)\n![Version](https://img.shields.io/badge/version-1.0.0-green.svg)\n![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)",
    enabled: true,
  },
  {
    id: "toc",
    type: "toc",
    title: "Table of Contents",
    content:
      "## Table of Contents\n\n- [Installation](#installation)\n- [Usage](#usage)\n- [API Reference](#api-reference)\n- [Contributing](#contributing)\n- [License](#license)",
    enabled: true,
  },
  {
    id: "installation",
    type: "installation",
    title: "Installation",
    content:
      "## Installation\n\nInstall the project with npm:\n\n```bash\nnpm install my-project\ncd my-project\n```",
    enabled: true,
  },
  {
    id: "usage",
    type: "usage",
    title: "Usage / Examples",
    content:
      "## Usage\n\n```javascript\nimport myProject from 'my-project';\n\nmyProject.start();\n```",
    enabled: true,
  },
  {
    id: "api",
    type: "api",
    title: "API Reference",
    content:
      "## API Reference\n\n#### Get all items\n\n```http\nGET /api/items\n```\n\n| Parameter | Type     | Description                |\n| :-------- | :------- | :------------------------- |\n| `api_key` | `string` | **Required**. Your API key |",
    enabled: true,
  },
  {
    id: "features",
    type: "features",
    title: "Features",
    content:
      "## Features\n\n- Light/dark mode toggle\n- Live previews\n- Fullscreen mode\n- Cross platform",
    enabled: false,
  },
  {
    id: "env",
    type: "env",
    title: "Environment Variables",
    content:
      "## Environment Variables\n\nTo run this project, add the following to your `.env` file:\n\n`API_KEY`\n\n`ANOTHER_API_KEY`",
    enabled: false,
  },
  {
    id: "contributing",
    type: "contributing",
    title: "Contributing",
    content:
      "## Contributing\n\nContributions are always welcome!\n\nSee `CONTRIBUTING.md` for ways to get started.",
    enabled: true,
  },
  {
    id: "license",
    type: "license",
    title: "License",
    content: "## License\n\n[MIT](https://choosealicense.com/licenses/mit/)",
    enabled: true,
  },
  {
    id: "acknowledgements",
    type: "acknowledgements",
    title: "Acknowledgements",
    content:
      "## Acknowledgements\n\n- [Awesome README](https://github.com/matiassingers/awesome-readme)",
    enabled: false,
  },
];

let c = 0;
export function createCustomSection(): ReadmeSection {
  c++;
  return {
    id: `custom-${Date.now()}-${c}`,
    type: "custom",
    title: `Custom Section ${c}`,
    content: `## Custom Section ${c}\n\nAdd your content here.`,
    enabled: true,
  };
}
