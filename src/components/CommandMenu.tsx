"use client";

import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { transforms } from "@/lib/registry";
import { getCategoryIcon } from "@/lib/toolCategoryIcon";
import { getToolHref } from "@/lib/toolRoutes";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="w-full max-w-2xl bg-bg-secondary border border-border shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200"
        aria-describedby="cmdk-description"
      >
        <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
        <div id="cmdk-description" className="sr-only">
          Search commands
        </div>
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="w-5 h-5 text-txt-muted mr-3 shrink-0" />
          <Command.Input
            placeholder="Search for tools, converters, AI..."
            className="flex-1 bg-transparent border-none outline-none text-txt placeholder:text-txt-muted text-base"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-txt-muted bg-bg-primary border border-border rounded">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="py-12 text-center text-sm text-txt-muted">
            No results found.
          </Command.Empty>

          {/* Group by category */}
          {Array.from(new Set(transforms.map((t) => t.category))).map(
            (category) => (
              <Command.Group
                key={category}
                heading={category}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-txt-muted [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {transforms
                  .filter((t) => t.category === category)
                  .map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={`${tool.name} ${tool.category} ${tool.id}`}
                      onSelect={() => {
                        setOpen(false);
                        router.push(getToolHref(tool.id));
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-accent/20 aria-selected:text-txt-primary data-[selected=true]:bg-accent/20 data-[selected=true]:text-txt-primary text-sm text-txt tr-smooth"
                    >
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-bg-primary border border-border shrink-0">
                        {getCategoryIcon(tool.category, {
                          size: 14,
                          className: "text-accent",
                        })}
                      </div>
                      <span className="flex-1 font-medium">{tool.name}</span>
                      <span className="hidden sm:inline-block text-xs text-txt-muted">
                        {tool.id}
                      </span>
                    </Command.Item>
                  ))}
              </Command.Group>
            ),
          )}
        </Command.List>
      </Command.Dialog>
    </div>
  );
}
