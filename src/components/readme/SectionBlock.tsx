"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import BadgePicker from "./BadgePicker";
import type { ReadmeSection } from "./sections";

interface Props {
  section: ReadmeSection;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function SectionBlock({
  section,
  onUpdate,
  onDelete,
  onToggle,
  onRename,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);
  const [renaming, setRenaming] = useState(false);
  const [renameTo, setRenameTo] = useState(section.title);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const rnRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      taRef.current.style.height = "auto";
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  }, [editing]);

  useEffect(() => {
    if (renaming && rnRef.current) {
      rnRef.current.focus();
      rnRef.current.select();
    }
  }, [renaming]);

  const save = () => {
    onUpdate(section.id, editContent);
    setEditing(false);
  };
  const cancel = () => {
    setEditContent(section.content);
    setEditing(false);
  };
  const saveRename = () => {
    if (renameTo.trim()) onRename(section.id, renameTo.trim());
    setRenaming(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-bg-secondary border border-border rounded-xl tr-smooth ${isDragging ? "opacity-50 ring-2 ring-accent/30" : ""} ${!section.enabled ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-txt-muted hover:text-txt-sec hover:bg-glass-hover tr-smooth"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>

        {renaming ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              ref={rnRef}
              value={renameTo}
              onChange={(e) => setRenameTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="flex-1 px-2 py-0.5 text-xs rounded bg-bg-primary border border-border text-txt focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
            <button onClick={saveRename} className="p-0.5 text-success">
              <Check size={12} />
            </button>
            <button
              onClick={() => setRenaming(false)}
              className="p-0.5 text-txt-muted"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <span
            className="text-xs font-medium text-txt flex-1 cursor-pointer hover:text-accent-light tr-smooth flex items-center gap-1"
            onDoubleClick={() => {
              setRenameTo(section.title);
              setRenaming(true);
            }}
          >
            {section.title}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenameTo(section.title);
                setRenaming(true);
              }}
              className="p-0.5 rounded text-txt-muted/0 group-hover:text-txt-muted hover:!text-accent tr-smooth"
              title="Rename section"
            >
              <Pencil size={10} />
            </button>
          </span>
        )}

        <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 group-hover:opacity-100 tr-smooth">
          <button
            onClick={() => onToggle(section.id)}
            className="p-1 rounded-md text-txt-muted hover:text-txt-sec hover:bg-glass-hover tr-smooth"
            title={section.enabled ? "Disable" : "Enable"}
          >
            {section.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            onClick={() => {
              if (!editing) {
                setEditContent(section.content);
                setEditing(true);
              } else cancel();
            }}
            className={`p-1 rounded-md tr-smooth ${editing ? "text-accent-light bg-accent/10" : "text-txt-muted hover:text-txt-sec hover:bg-glass-hover"}`}
          >
            {editing ? <X size={12} /> : <Pencil size={12} />}
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1 rounded-md text-txt-muted hover:text-error hover:bg-error/10 tr-smooth"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="p-3 anim-in space-y-3">
          <textarea
            ref={taRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            className="w-full min-h-[100px] p-3 text-xs font-mono leading-relaxed rounded-lg bg-bg-primary border border-border text-txt placeholder:text-txt-muted focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none"
          />
          {section.type === "badges" && (
            <BadgePicker
              onInsert={(badge) => {
                const newContent = editContent.trim()
                  ? `${editContent.trim()}\n${badge}`
                  : badge;
                setEditContent(newContent);
                onUpdate(section.id, newContent);
              }}
            />
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={cancel}
              className="px-3 py-1.5 text-xs rounded-lg btn-glass"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-3 py-1.5 text-xs rounded-lg btn-accent"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!editing && section.enabled && (
        <div className="px-3 py-2">
          <p className="text-[10px] text-txt-muted font-mono leading-relaxed truncate">
            {section.content
              .split("\n")
              .filter((l) => l.trim() && !l.startsWith("#"))
              .slice(0, 2)
              .join(" · ") || "(empty)"}
          </p>
        </div>
      )}
    </div>
  );
}
