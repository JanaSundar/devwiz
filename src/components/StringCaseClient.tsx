"use client";
import * as changeCase from "change-case";
import { Check, Copy, Type } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import ThemeToggle from "@/components/ThemeToggle";

const CASES = [
  { id: "camel", name: "Camel Case", fn: changeCase.camelCase },
  { id: "snake", name: "Snake Case", fn: changeCase.snakeCase },
  { id: "pascal", name: "Pascal Case", fn: changeCase.pascalCase },
  { id: "kebab", name: "Kebab Case", fn: changeCase.kebabCase },
  { id: "constant", name: "Constant Case", fn: changeCase.constantCase },
  { id: "dot", name: "Dot Case", fn: changeCase.dotCase },
  { id: "path", name: "Path Case", fn: changeCase.pathCase },
  { id: "sentence", name: "Sentence Case", fn: changeCase.sentenceCase },
  { id: "capital", name: "Capital Case", fn: changeCase.capitalCase },
  { id: "train", name: "Train Case", fn: changeCase.trainCase },
];

export default function StringCaseClient() {
  const [input, setInput] = useState(
    "This is an example sentence.\nunder_score_case\ndash-case",
  );
  const [selectedCase, setSelectedCase] = useState(CASES[0].id);
  const [copied, setCopied] = useState(false);

  const activeCase = CASES.find((c) => c.id === selectedCase) || CASES[0];

  // Process line by line so it acts nicely on multi-line text
  const process = useCallback((text: string, caseFn: (s: string) => string) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => caseFn(line))
      .join("\n");
  }, []);

  const output = useMemo(
    () => process(input, activeCase.fn),
    [input, activeCase, process],
  );

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border gap-3 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 pl-10 md:pl-0 min-w-0 flex-1">
          <h2 className="text-base md:text-lg font-semibold text-txt truncate">
            String Case Converter
          </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/15">
            Converters
          </span>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative group mr-2">
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="appearance-none outline-none w-[180px] bg-bg-secondary border border-border text-txt text-sm rounded-lg px-3 py-1.5 pr-8 cursor-pointer group-hover:border-accent/50 tr-smooth"
            >
              {CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Type
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted pointer-events-none"
            />
          </div>

          <button
            onClick={copy}
            disabled={!output}
            className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tr-smooth ${copied ? "bg-success/15 text-success border border-success/20" : output ? "btn-accent" : "btn-glass opacity-50 cursor-not-allowed"}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Content using CodeEditor */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-bg">
        {/* Input Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-border bg-bg-secondary shrink-0">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-semibold text-txt tracking-wide">
              STRING INPUT
            </span>
          </div>
          <div className="flex-1 min-h-[250px] lg:min-h-0 relative">
            <CodeEditor
              value={input}
              onChange={(e) => setInput(e || "")}
              language="markdown"
            />
          </div>
        </div>

        {/* Output Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-2 text-xs border-b border-border bg-bg-secondary shrink-0">
            <span className="w-2 h-2 rounded-full bg-success shrink-0" />
            <span className="font-semibold text-txt tracking-wide">RESULT</span>
            <span className="text-txt-muted">— {activeCase.name}</span>
          </div>
          <div className="flex-1 min-h-[250px] lg:min-h-0 relative">
            <CodeEditor value={output} language="markdown" readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
