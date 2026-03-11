"use client";

import {
  Bounds,
  OrbitControls,
  Stage,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  AlertTriangle,
  Box,
  FolderOpen,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import type { ComponentRef } from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import ToolHeader from "@/components/tooling/ToolHeader";

type LoadedModel = {
  name: string;
  url: string;
};

function normalizePath(input: string) {
  const clean = input.replace(/\\/g, "/");
  const parts = clean.split("/");
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (stack.length) {
        stack.pop();
      }
      continue;
    }
    stack.push(part);
  }

  return stack.join("/").toLowerCase();
}

async function fileToDataUri(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${file.type || "application/octet-stream"};base64,${base64}`;
}

async function buildInlineGltfUrl(modelFile: File, files: File[]) {
  const source = await modelFile.text();
  const json = JSON.parse(source) as {
    buffers?: Array<{ uri?: string }>;
    images?: Array<{ uri?: string }>;
  };

  const lookup = new Map<string, File>();
  for (const file of files) {
    const rel = normalizePath(file.webkitRelativePath || file.name);
    lookup.set(rel, file);
    lookup.set(normalizePath(file.name), file);
  }

  const modelPath = normalizePath(
    modelFile.webkitRelativePath || modelFile.name,
  );
  const modelDir = modelPath.includes("/")
    ? modelPath.slice(0, modelPath.lastIndexOf("/") + 1)
    : "";

  const missing = new Set<string>();
  const resolveUri = async (uri?: string) => {
    if (!uri || uri.startsWith("data:")) {
      return uri;
    }

    const decoded = decodeURIComponent(uri);
    const normalized = normalizePath(decoded);
    const normalizedFromModelDir = normalizePath(`${modelDir}${decoded}`);
    const basename = normalized.split("/").pop() || "";

    const candidates = [normalizedFromModelDir, normalized, basename];
    let file = candidates.map((key) => lookup.get(key)).find(Boolean);

    if (!file && normalized) {
      for (const [key, candidateFile] of lookup.entries()) {
        if (key.endsWith(`/${normalized}`) || key.endsWith(`/${basename}`)) {
          file = candidateFile;
          break;
        }
      }
    }

    if (!file) {
      missing.add(uri);
      return uri;
    }

    return fileToDataUri(file);
  };

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      buffer.uri = await resolveUri(buffer.uri);
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      image.uri = await resolveUri(image.uri);
    }
  }

  if (missing.size) {
    throw new Error(
      `Missing referenced assets: ${Array.from(missing).join(", ")}`,
    );
  }

  const serialized = JSON.stringify(json);
  return URL.createObjectURL(
    new Blob([serialized], { type: "model/gltf+json" }),
  );
}

function LoadingOverlay() {
  const { active, progress } = useProgress();

  if (!active) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <div className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-xs text-txt-sec">
        Loading model {Math.round(progress)}%
      </div>
    </div>
  );
}

function GltfModel({ url }: { url: string }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    return () => {
      useGLTF.clear(url);
    };
  }, [url]);

  return <primitive object={gltf.scene} />;
}

function Scene({
  modelUrl,
  resetSignal,
}: {
  modelUrl: string;
  resetSignal: number;
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls> | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(2.5, 2, 2.5);
    camera.near = 0.1;
    camera.far = 100;
    camera.updateProjectionMatrix();
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [camera, resetSignal]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <Stage
            intensity={0.6}
            environment="city"
            shadows
            adjustCamera={false}
          >
            <GltfModel url={modelUrl} />
          </Stage>
        </Bounds>
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.5}
        maxDistance={24}
      />
    </>
  );
}

export default function GltfViewerClient() {
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [modelError, setModelError] = useState("");
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (model?.url) {
        URL.revokeObjectURL(model.url);
      }
    };
  }, [model]);

  const onDrop = async (acceptedFiles: File[]) => {
    const modelFile = acceptedFiles.find((file) =>
      /\.(glb|gltf)$/i.test(file.name),
    );
    if (!modelFile) {
      setModelError("Drop at least one .glb or .gltf file.");
      return;
    }

    setModelError("");

    try {
      const modelUrl = /\.gltf$/i.test(modelFile.name)
        ? await buildInlineGltfUrl(modelFile, acceptedFiles)
        : URL.createObjectURL(modelFile);

      setModel((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return {
          name: modelFile.name,
          url: modelUrl,
        };
      });
      setResetSignal((value) => value + 1);
    } catch (error) {
      setModelError(
        error instanceof Error
          ? error.message
          : "Could not prepare model. Include .bin/textures with your .gltf.",
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
  });

  return (
    <div className="flex h-full flex-col anim-in" {...getRootProps()}>
      <input {...getInputProps()} />
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => {
          const selection = event.target.files;
          if (!selection?.length) return;
          void onDrop(Array.from(selection));
          event.currentTarget.value = "";
        }}
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
      />
      <ToolHeader title="GLTF/GLB 3D Model Viewer" badge="Utilities" />

      {!model ? (
        <section className="m-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-secondary/70 p-8 text-center">
          <div className="mb-4 inline-flex rounded-full border border-border bg-bg-primary p-4 text-accent">
            <Box size={24} />
          </div>
          <p className="text-lg font-medium text-txt">
            Drop a .glb or .gltf file
          </p>
          <p className="mt-2 text-sm text-txt-muted">
            Render and inspect your 3D model with studio lighting and orbit
            controls.
          </p>
          <p className="mt-1 text-xs text-txt-muted">
            For .gltf files, drop the model together with its .bin/textures.
          </p>
          <button
            type="button"
            onClick={open}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-4 py-2 text-xs text-txt tr-smooth hover:border-accent/40 hover:text-accent"
          >
            <Upload size={14} />
            Browse model file
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-bg-primary px-4 py-2 text-xs text-txt tr-smooth hover:border-accent/40 hover:text-accent"
          >
            <FolderOpen size={14} />
            Upload entire folder
          </button>
          {isDragActive && (
            <p className="mt-4 rounded-md bg-accent/10 px-3 py-1.5 text-xs text-accent">
              Drop to load model
            </p>
          )}
          {modelError && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-error/20 bg-error/10 px-3 py-1.5 text-xs text-error">
              <AlertTriangle size={12} />
              {modelError}
            </p>
          )}
        </section>
      ) : (
        <section className="relative m-4 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border bg-[#0a0b10]">
          <Canvas
            className="h-full w-full"
            camera={{ position: [2.5, 2, 2.5], fov: 45 }}
          >
            <Scene modelUrl={model.url} resetSignal={resetSignal} />
          </Canvas>

          <LoadingOverlay />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <div className="pointer-events-auto rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/90 backdrop-blur">
              {model.name}
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setResetSignal((value) => value + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white tr-smooth hover:border-white/30"
              >
                <RotateCcw size={13} />
                Reset Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  setModel((prev) => {
                    if (prev?.url) URL.revokeObjectURL(prev.url);
                    return null;
                  });
                  setModelError("");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white tr-smooth hover:border-white/30"
              >
                <X size={13} />
                Close/Upload New Model
              </button>
            </div>
          </div>

          {isDragActive && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/55">
              <div className="rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm text-white">
                Drop file to replace current model
              </div>
            </div>
          )}
          {modelError && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-error/20 bg-error/20 px-3 py-1.5 text-xs text-white">
                <AlertTriangle size={12} />
                {modelError}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
