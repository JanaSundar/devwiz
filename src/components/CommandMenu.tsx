"use client";

import { Command } from "cmdk";
import { FileText, Home, Monitor, Moon, Search, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { categories, transforms } from "@/lib/registry";
import { getCategoryIcon } from "@/lib/toolCategoryIcon";
import { getToolHref } from "@/lib/toolRoutes";

const THEMES = [
  { id: "light", name: "Light Mode", icon: Sun },
  { id: "dark", name: "Dark Mode", icon: Moon },
  { id: "system", name: "System Preference", icon: Monitor },
] as const;

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      value={value}
      onValueChange={setValue}
      container={typeof document !== "undefined" ? document.body : undefined}
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-txt/15 backdrop-blur-sm animate-in fade-in duration-300 cursor-default"
      aria-describedby="cmdk-description"
    >
      <div
        className="absolute inset-0 cursor-default"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className="cmdk-palette relative z-10 w-full max-w-lg bg-bg-secondary border border-border overflow-hidden rounded-xl animate-in zoom-in-95 duration-300 shadow-xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
        <div id="cmdk-description" className="sr-only">
          Search commands
        </div>

        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="w-4 h-4 text-txt-muted shrink-0 mr-3" />
          <Command.Input
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-none outline-none text-txt placeholder:text-txt-muted text-sm font-medium min-w-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded border border-border text-txt-muted text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto py-2 scrollable-area">
          <Command.Empty className="py-12 text-center text-txt-muted text-sm">
            No results found
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="cmdk-group [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-txt-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            <Command.Item
              value="home"
              onSelect={() => {
                setOpen(false);
                router.push("/");
              }}
              className="cmdk-item relative flex items-center gap-3 px-4 py-2.5 cursor-pointer text-txt data-[selected=true]:bg-bg-tertiary data-[selected=true]:text-txt transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border shrink-0 [.cmdk-item[data-selected=true]_&]:border-border">
                <Home
                  size={16}
                  className="text-txt-sec [.cmdk-item[data-selected=true]_&]:text-txt"
                />
              </div>
              <span className="font-medium text-sm">Home</span>
            </Command.Item>
            <Command.Item
              value="readme generator"
              onSelect={() => {
                setOpen(false);
                router.push("/readme");
              }}
              className="cmdk-item relative flex items-center gap-3 px-4 py-2.5 cursor-pointer text-txt data-[selected=true]:bg-bg-tertiary data-[selected=true]:text-txt transition-colors"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border shrink-0 [.cmdk-item[data-selected=true]_&]:border-border">
                <FileText
                  size={16}
                  className="text-txt-sec [.cmdk-item[data-selected=true]_&]:text-txt"
                />
              </div>
              <span className="font-medium text-sm">README Generator</span>
            </Command.Item>
          </Command.Group>

          {categories
            .filter((cat) => transforms.some((t) => t.category === cat))
            .map((category) => (
              <Command.Group
                key={category}
                heading={category}
                className="cmdk-group [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-txt-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {transforms
                  .filter((t) => t.category === category)
                  .map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={tool.name.toLowerCase()}
                      onSelect={() => {
                        setOpen(false);
                        router.push(getToolHref(tool.id));
                      }}
                      className="cmdk-item relative flex items-center gap-3 px-4 py-2.5 cursor-pointer text-txt data-[selected=true]:bg-bg-tertiary data-[selected=true]:text-txt transition-colors"
                    >
                      {value === tool.name.toLowerCase() && (
                        <motion.div
                          layoutId="cmdk-active"
                          className="absolute inset-0 bg-bg-tertiary rounded-md -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.4,
                          }}
                        />
                      )}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border shrink-0 [.cmdk-item[data-selected=true]_&]:border-border">
                        {getCategoryIcon(tool.category, {
                          size: 16,
                          className:
                            "text-txt-sec [.cmdk-item[data-selected=true]_&]:text-txt",
                        })}
                      </div>
                      <span className="font-medium text-sm truncate">
                        {tool.name}
                      </span>
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}

          <Command.Group
            heading="Preferences"
            className="cmdk-group [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-txt-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            {THEMES.map((t) => (
              <Command.Item
                key={t.id}
                value={t.name.toLowerCase()}
                onSelect={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className="cmdk-item relative flex items-center gap-3 px-4 py-2.5 cursor-pointer text-txt data-[selected=true]:bg-bg-tertiary data-[selected=true]:text-txt transition-colors"
              >
                {value === t.name.toLowerCase() && (
                  <motion.div
                    layoutId="cmdk-active"
                    className="absolute inset-0 bg-bg-tertiary rounded-md -z-10"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                )}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border shrink-0 [.cmdk-item[data-selected=true]_&]:border-border">
                  <t.icon
                    size={16}
                    className="text-txt-sec [.cmdk-item[data-selected=true]_&]:text-txt"
                  />
                </div>
                <span className="font-medium text-sm">{t.name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-txt-muted text-[10px] font-medium">
          <span>Quick search</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border font-mono">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded border border-border font-mono">
                ↵
              </kbd>
              Open
            </span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}
