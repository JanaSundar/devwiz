declare module "jsoncrack-react" {
  import * as React from "react";

  export interface JSONCrackProps {
    json: string | object | unknown[];
    theme?: "dark" | "light";
    showControls?: boolean;
    showGrid?: boolean;
    centerOnLayout?: boolean;
    maxRenderableNodes?: number;
    renderNodeLimitExceeded?: (
      nodeCount: number,
      maxRenderableNodes: number,
    ) => React.ReactNode;
  }

  export const JSONCrack: React.ComponentType<JSONCrackProps>;
}
