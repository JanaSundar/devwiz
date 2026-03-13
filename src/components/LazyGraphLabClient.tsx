"use client";

import dynamic from "next/dynamic";

export default dynamic(() => import("./GraphLabClient"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-txt-muted">
      Loading graph lab...
    </div>
  ),
});
