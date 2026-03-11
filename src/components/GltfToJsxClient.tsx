"use client";

import {
  Check,
  ClipboardCopy,
  FileCode2,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import CodeEditor from "@/components/CodeEditor";
import ToolHeader from "@/components/tooling/ToolHeader";

type OutputMode = "typescript" | "javascript";

type ConversionSettings = {
  mode: OutputMode;
  includeShadows: boolean;
  transform: boolean;
};

function buildMockCode(fileName: string, settings: ConversionSettings) {
  const componentName =
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch: string) => ch.toUpperCase())
      .replace(/^[a-z]/, (match) => match.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "") || "ImportedModel";

  const imports =
    settings.mode === "typescript"
      ? [
          'import type { JSX } from "react";',
          'import type { GroupProps } from "@react-three/fiber";',
          'import { useGLTF } from "@react-three/drei";',
        ]
      : ['import { useGLTF } from "@react-three/drei";'];

  const typeLine =
    settings.mode === "typescript"
      ? `export function ${componentName}(props: GroupProps): JSX.Element {`
      : `export function ${componentName}(props) {`;

  const transformNote = settings.transform
    ? "// transformed: true (Draco + mesh optimization enabled)"
    : "// transformed: false";

  const shadowProps = settings.includeShadows
    ? " castShadow receiveShadow"
    : "";

  return `${imports.join("\n")}

const MODEL_URL = "/models/${fileName}";
${transformNote}

${typeLine}
  const { nodes, materials } = useGLTF(MODEL_URL);

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Main?.geometry}
        material={materials.Main}
        rotation={[0, Math.PI / 2, 0]}${shadowProps}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
`;
}

export default function GltfToJsxClient() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    mode: "typescript",
    includeShadows: true,
    transform: false,
  });

  const codeOutput = useMemo(() => {
    if (!uploadedFile) {
      return "// Upload a .glb or .gltf file to generate React Three Fiber JSX.";
    }
    return buildMockCode(uploadedFile.name, settings);
  }, [uploadedFile, settings]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    multiple: false,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "application/octet-stream": [".glb", ".gltf"],
    },
    onDrop: (acceptedFiles) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) return;

      setUploadedFile(nextFile);
      setIsLoading(true);
    },
  });

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

  const copyCode = async () => {
    if (!codeOutput.trim()) return;
    try {
      await navigator.clipboard.writeText(codeOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="flex h-full flex-col anim-in">
      <ToolHeader title="GLTF to JSX" badge="Converters" />

      <div
        className="flex flex-1 min-h-0 flex-col gap-4 p-4 lg:flex-row"
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        <section className="flex min-h-64 flex-1 flex-col rounded-2xl border border-border bg-bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-txt-muted">
            Upload
          </p>
          <div
            className={`mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center tr-smooth ${isDragActive ? "border-accent bg-accent/10" : "border-border bg-bg-primary"}`}
          >
            <UploadCloud size={26} className="text-accent" />
            <p className="mt-4 text-sm font-medium text-txt">
              Drop .glb or .gltf
            </p>
            <p className="mt-2 text-xs text-txt-muted">
              {uploadedFile
                ? `Loaded: ${uploadedFile.name}`
                : "The converter API will process your model server-side."}
            </p>
            <button
              type="button"
              onClick={open}
              className="mt-5 rounded-md border border-border bg-bg-secondary px-3 py-2 text-xs text-txt tr-smooth hover:border-accent/40 hover:text-accent"
            >
              Choose File
            </button>
          </div>
        </section>

        <section className="flex min-h-64 flex-1.2 flex-col rounded-2xl border border-border bg-bg-secondary">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <ToggleButton
              active={settings.mode === "typescript"}
              onClick={() =>
                setSettings((prev) => ({ ...prev, mode: "typescript" }))
              }
              label="TypeScript"
            />
            <ToggleButton
              active={settings.mode === "javascript"}
              onClick={() =>
                setSettings((prev) => ({ ...prev, mode: "javascript" }))
              }
              label="JavaScript"
            />
            <ToggleButton
              active={settings.includeShadows}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  includeShadows: !prev.includeShadows,
                }))
              }
              label="Include Shadows"
            />
            <ToggleButton
              active={settings.transform}
              onClick={() =>
                setSettings((prev) => ({ ...prev, transform: !prev.transform }))
              }
              label="Transform (compress)"
            />
          </div>

          <div className="relative flex min-h-0 flex-1">
            <button
              type="button"
              onClick={copyCode}
              disabled={isLoading}
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-border bg-bg-primary/90 px-2.5 py-1.5 text-xs text-txt tr-smooth hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? <Check size={12} /> : <ClipboardCopy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>

            {isLoading ? (
              <div className="flex w-full items-center justify-center gap-2 text-sm text-txt-muted">
                <LoaderCircle size={16} className="animate-spin" />
                Generating JSX component...
              </div>
            ) : (
              <CodeEditor
                value={codeOutput}
                readOnly
                language={
                  settings.mode === "typescript" ? "typescript" : "javascript"
                }
                placeholder="Generated code will appear here"
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs tr-smooth ${active ? "border-accent/30 bg-accent/10 text-accent" : "border-border bg-bg-primary text-txt-muted hover:text-txt"}`}
    >
      <FileCode2 size={12} />
      {label}
    </button>
  );
}
