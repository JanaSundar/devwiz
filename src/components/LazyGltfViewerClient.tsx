"use client";

import dynamic from "next/dynamic";

export default dynamic(() => import("./GltfViewerClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-txt-muted text-sm">
      Loading 3D viewer…
    </div>
  ),
});
