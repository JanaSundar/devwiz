"use client";
import { indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  placeholder as cmPlaceholder,
  EditorView,
  keymap,
} from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
}

const langs: Record<string, () => ReturnType<typeof json>> = {
  json: () => json(),
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  yaml: () => yaml(),
  xml: () => xml(),
  css: () => css(),
  markdown: () => markdown(),
  html: () => html(),
  toml: () => yaml(),
};

export default function CodeEditor({
  value,
  onChange,
  language = "json",
  placeholder = "",
  readOnly = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    if (!ref.current) return;
    const lang = langs[language] || langs.json;
    const exts = [
      basicSetup,
      oneDark,
      lang(),
      keymap.of([indentWithTab]),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": { overflow: "auto" },
      }),
    ];
    if (placeholder) exts.push(cmPlaceholder(placeholder));
    if (readOnly) exts.push(EditorState.readOnly.of(true));
    if (onChange)
      exts.push(
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cbRef.current?.(u.state.doc.toString());
        }),
      );

    const view = new EditorView({
      state: EditorState.create({ doc: value, extensions: exts }),
      parent: ref.current,
    });
    viewRef.current = view;
    return () => view.destroy();
  }, [language, readOnly]);

  useEffect(() => {
    const v = viewRef.current;
    if (!v) return;
    const cur = v.state.doc.toString();
    if (cur !== value)
      v.dispatch({ changes: { from: 0, to: cur.length, insert: value } });
  }, [value]);

  return <div ref={ref} className="h-full w-full overflow-hidden" />;
}
