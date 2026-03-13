# Flow Board

Flow Board is a visual workspace that allows developers to represent data, API interactions, and transformations as connected nodes. It is a node-based visual environment for exploring data structures and building developer workflows, supporting both diagram visualization and data transformation pipelines.

## Modes

Flow Board has two main modes:

### 1. Diagram Mode

Diagram Mode is used for visualizing data structures and relationships. Developers can paste JSON or load API responses and convert them into node-based diagrams.

**Example**

JSON input:

```json
{
  "user": {
    "id": 1,
    "name": "John",
    "posts": []
  }
}
```

Generated flow diagram:

```
user
 ├ id
 ├ name
 └ posts
```

**Features in Diagram Mode**

- **JSON → Flow visualization** – Convert any JSON into a visual node graph
- **Expanded mode** – Each JSON property becomes a separate node (e.g., `env: "prod"`, `debug: true`)
- **Compact mode** – Full JSON displayed inside a single node
- **Display toggle** – Expanded/Compact toggle appears in the header when the diagram has JSON-derived content
- **Automatic layout** – Nested JSON structures are laid out automatically
- **Editable nodes** – Node labels can be edited inline

Diagram Mode helps developers quickly understand API responses and complex JSON structures.

---

### 2. Workflow Mode

Workflow Mode allows developers to create data transformation pipelines using DevWiz tools as nodes.

**Example pipeline**

```
JSON Input
    ↓
JSON → YAML
    ↓
YAML → TOML
    ↓
Output
```

Nodes represent operations such as:

- **Inputs** – JSON, XML, text
- **Data transforms** – Converters and processors
- **API requests** – HTTP calls with response handling
- **Output previews** – View or export results

Workflow Mode lets developers build visual pipelines instead of manually switching between tools.

---

## Node Types

### Input Nodes

Input nodes provide data into the flow.

- **JSON Input** – Paste or edit JSON
- **XML Input** – XML data
- **API Request Input** – Trigger API calls
- **Text Input** – Raw text

---

### API Request Nodes

Flow Board integrates with the DevWiz API Playground. Users can send API requests directly into Flow Board.

**Example flow**

```
API Request
GET /users/1
    ↓
Response Node
Status: 200, Time: 120ms
    ↓
JSON Response Node
```

**Features**

- Request body, headers, and params
- Response visualization
- Error nodes for failed requests
- JSONPath extraction from responses

---

### Transform Nodes

Transform nodes use existing DevWiz converters.

**Examples**

- JSON → TypeScript
- JSON → YAML
- YAML → JSON
- XML → JSON
- CSS → Tailwind
- Tailwind → CSS
- JSON → JSON Schema

Each transform node receives input data and outputs processed data to the next node.

---

### Output Nodes

Output nodes allow users to view or export the final result.

- **Preview Output** – View data in the sidebar
- **Copy to Clipboard** – Copy result to clipboard
- **Download File** – Export as file
- **Load as Flow Diagram** – Convert generated data into a visual diagram (switches to Diagram mode)

---

## Pipeline Templates

Flow Board includes predefined templates for common workflows.

**API Response → TypeScript Types**

```
API Request
    ↓
JSON Response
    ↓
JSON → TypeScript
    ↓
Download Types
```

**JSON Conversion Pipeline**

```
JSON Input
    ↓
JSON → YAML
    ↓
YAML → TOML
    ↓
Preview / Download
```

These templates help users start quickly.

---

## Integrations

### API Playground

The API Playground includes a **Send to Flow Board** option that sends request results directly into Flow Board for visualization and processing. When enabled, responses can open in Diagram mode as a flow diagram or in Workflow mode for further processing.

### JSON Tools

JSON outputs from DevWiz tools can be loaded into Flow Board for visual exploration via **Load as Flow Diagram** in the output sidebar.

### Converters

All transform tools in DevWiz can be used as nodes inside Workflow Mode.

---

## Exporting and Sharing

Users can export Flow Board pipelines.

**Example export format**

```json
{
  "pipeline": [
    "json-input",
    "json-to-typescript",
    "download"
  ]
}
```

Pipelines can be:

- Exported
- Shared
- Reloaded later

---

## Purpose

Flow Board transforms DevWiz from a simple collection of utilities into a visual developer workflow lab. Instead of using tools individually, developers can connect them into interactive pipelines and visual diagrams, making debugging, transformation, and exploration easier.
