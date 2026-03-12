"use client";

import { faker } from "@faker-js/faker";
import { Check, Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { cn } from "@/lib/utils";

type PresetKind = "person" | "company" | "product" | "address" | "mixed";
type TileKind = PresetKind | `module:${string}`;

type DataCard = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string | number | boolean>;
};

const PRESET_OPTIONS: Array<{ value: PresetKind; label: string }> = [
  { value: "person", label: "Person" },
  { value: "company", label: "Company" },
  { value: "product", label: "Product" },
  { value: "address", label: "Address" },
  { value: "mixed", label: "Mixed Profile" },
];

function getFakerModuleOptions() {
  return Object.keys(faker)
    .filter((key) => {
      const moduleValue = (faker as unknown as Record<string, unknown>)[key] as
        | Record<string, unknown>
        | undefined;
      if (
        !moduleValue ||
        typeof moduleValue !== "object" ||
        Array.isArray(moduleValue)
      )
        return false;
      return Object.keys(moduleValue).some(
        (method) => typeof moduleValue[method] === "function",
      );
    })
    .sort((a, b) => a.localeCompare(b));
}

function createPresetCard(kind: PresetKind, index: number): DataCard {
  if (kind === "person") {
    const fullName = faker.person.fullName();
    return {
      id: faker.string.uuid(),
      title: fullName,
      subtitle: faker.person.jobTitle(),
      details: {
        type: "person",
        username: faker.internet.username({
          firstName: fullName.split(" ")[0],
        }),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        city: faker.location.city(),
        country: faker.location.country(),
        company: faker.company.name(),
        isActive: faker.datatype.boolean(),
        index: index + 1,
      },
    };
  }

  if (kind === "company") {
    const name = faker.company.name();
    return {
      id: faker.string.uuid(),
      title: name,
      subtitle: faker.company.catchPhrase(),
      details: {
        type: "company",
        website: faker.internet.url(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        industry: faker.commerce.department(),
        employees: faker.number.int({ min: 20, max: 10000 }),
        city: faker.location.city(),
        country: faker.location.country(),
        index: index + 1,
      },
    };
  }

  if (kind === "product") {
    const productName = faker.commerce.productName();
    return {
      id: faker.string.uuid(),
      title: productName,
      subtitle: faker.commerce.productDescription(),
      details: {
        type: "product",
        sku: faker.string.alphanumeric({ length: 10, casing: "upper" }),
        category: faker.commerce.department(),
        price: Number(faker.commerce.price({ min: 5, max: 2500 })),
        rating: Number(
          faker.number
            .float({ min: 2.5, max: 5, fractionDigits: 1 })
            .toFixed(1),
        ),
        color: faker.color.human(),
        inStock: faker.datatype.boolean(),
        supplier: faker.company.name(),
        index: index + 1,
      },
    };
  }

  if (kind === "address") {
    return {
      id: faker.string.uuid(),
      title: faker.location.streetAddress(),
      subtitle: `${faker.location.city()}, ${faker.location.state()}`,
      details: {
        type: "address",
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        zipCode: faker.location.zipCode(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        index: index + 1,
      },
    };
  }

  const fullName = faker.person.fullName();
  const company = faker.company.name();
  return {
    id: faker.string.uuid(),
    title: `${fullName} @ ${company}`,
    subtitle: `${faker.person.jobTitle()} in ${faker.location.city()}`,
    details: {
      type: "mixed-profile",
      fullName,
      email: faker.internet.email(),
      phone: faker.phone.number(),
      company,
      role: faker.person.jobTitle(),
      salary: faker.number.int({ min: 45000, max: 220000 }),
      productInterest: faker.commerce.productName(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      index: index + 1,
    },
  };
}

function coerceValue(value: unknown) {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value && typeof value === "object") {
    const text = JSON.stringify(value);
    return text.length > 160 ? `${text.slice(0, 157)}...` : text;
  }
  return String(value);
}

function createModuleCard(moduleName: string, index: number): DataCard {
  const moduleValue = (faker as unknown as Record<string, unknown>)[
    moduleName
  ] as Record<string, unknown> | undefined;
  const methods = moduleValue
    ? Object.keys(moduleValue)
        .filter((m) => typeof moduleValue[m] === "function")
        .sort()
    : [];

  const details: Record<string, string | number | boolean> = {
    type: moduleName,
    index: index + 1,
  };

  for (const method of methods) {
    if (Object.keys(details).length >= 12) break;
    const fn = moduleValue?.[method] as
      | ((...args: unknown[]) => unknown)
      | undefined;
    if (!fn) continue;
    try {
      details[method] = coerceValue(fn());
    } catch {
      // Skip methods requiring args.
    }
  }

  if (Object.keys(details).length <= 2) {
    details.note = "This module mostly needs method arguments.";
  }

  return {
    id: faker.string.uuid(),
    title: `${moduleName} sample`,
    subtitle: `Generated from Faker ${moduleName}`,
    details,
  };
}

const COUNT_PRESETS = [5, 10, 20, 50];

export default function FakerJsClient() {
  const moduleOptions = useMemo(() => getFakerModuleOptions(), []);
  const [kind, setKind] = useState<TileKind>("person");
  const [count, setCount] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cards = useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      if (kind.startsWith("module:")) {
        return createModuleCard(kind.slice(7), index);
      }
      return createPresetCard(kind as PresetKind, index);
    });
  }, [kind, count]);

  const copyCard = async (card: DataCard) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(card, null, 2));
      setCopiedId(card.id);
      setTimeout(
        () => setCopiedId((prev) => (prev === card.id ? null : prev)),
        1500,
      );
    } catch {}
  };

  return (
    <div className="flex flex-col h-full anim-in">
      <ToolHeader title="Fake Data Generator" badge="Utilities" />

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row">
        {/* Left: Config */}
        <section className="lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-secondary/30">
          <div className="p-4 md:p-5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-accent" />
              <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                Configuration
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as TileKind)}
                  className="mt-2 w-full px-3 py-2.5 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/40 tr-smooth"
                >
                  {PRESET_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {moduleOptions.map((moduleName) => (
                    <option key={moduleName} value={`module:${moduleName}`}>
                      {moduleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
                  Count
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COUNT_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-medium tr-smooth",
                        count === n
                          ? "bg-accent/15 text-accent border border-accent/30"
                          : "btn-glass hover:border-accent/30",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) =>
                    setCount(
                      Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                    )
                  }
                  className="mt-2 w-full px-3 py-2 text-sm rounded-xl bg-bg-primary border border-border text-txt focus:outline-none focus:border-accent/40 tr-smooth"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right: Generated cards */}
        <section className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
          {cards.length > 0 ? (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">
                  Generated ({cards.length} items)
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-border bg-bg-primary overflow-hidden hover:border-accent/20 tr-smooth group"
                  >
                    <div className="p-4 border-b border-border/50 bg-bg-secondary/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-txt truncate">
                            {card.title}
                          </p>
                          <p className="text-xs text-txt-muted mt-0.5 truncate">
                            {card.subtitle}
                          </p>
                        </div>
                        <button
                          onClick={() => copyCard(card)}
                          className={cn(
                            "shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] tr-smooth",
                            copiedId === card.id
                              ? "bg-success/15 text-success border border-success/20"
                              : "btn-glass hover:border-accent/30 opacity-0 group-hover:opacity-100 md:opacity-100",
                          )}
                        >
                          {copiedId === card.id ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          {copiedId === card.id ? "Copied" : "Copy JSON"}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(card.details).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex flex-col gap-0.5 rounded-lg bg-bg-secondary/50 px-3 py-2"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-txt-muted font-medium">
                              {key}
                            </p>
                            <p className="text-xs text-txt break-all font-mono">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center">
              <div className="text-center max-w-sm">
                <Sparkles
                  size={40}
                  className="mx-auto mb-4 text-txt-muted/40"
                />
                <p className="text-sm font-medium text-txt-muted mb-1">
                  Generate fake data
                </p>
                <p className="text-xs text-txt-muted/80">
                  Select a type and count, then view the generated cards
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
