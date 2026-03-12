"use client";

import dynamic from "next/dynamic";

export default dynamic(() => import("./FlexGridPlaygroundClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-txt-muted text-sm">
      Loading playground…
    </div>
  ),
});
