"use client";

import { faker } from "@faker-js/faker";
import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import ToolHeader from "@/components/tooling/ToolHeader";
import { ToolPanel } from "@/components/tooling/ToolPanels";

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

export default function FakerJsClient() {
  const moduleOptions = useMemo(() => getFakerModuleOptions(), []);
  const [kind, setKind] = useState<TileKind>("person");
  const [count, setCount] = useState(10);
  const [showConfigMobile, setShowConfigMobile] = useState(false);
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

      <div className="flex-1 min-h-0 p-4 flex flex-col gap-4 overflow-hidden">
        <div className="md:hidden">
          <button
            onClick={() => setShowConfigMobile((prev) => !prev)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg-secondary text-xs font-semibold text-txt"
          >
            {showConfigMobile ? "Hide Config" : "Show Config"}
          </button>
        </div>

        <div
          className={`flex flex-col min-w-0 ${showConfigMobile ? "flex" : "hidden"} md:flex`}
        >
          <ToolPanel
            title="CONFIG"
            statusClassName="bg-accent"
            frameClassName="p-4"
          >
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider flex-1 min-w-55">
                Tile Type
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as TileKind)}
                  className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt"
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
              </label>

              <label className="text-xs font-semibold text-txt-muted uppercase tracking-wider flex-1 min-w-55">
                Tile Count
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(event) =>
                    setCount(
                      Math.max(
                        1,
                        Math.min(100, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  className="mt-2 w-full px-3 py-2 text-sm rounded-lg bg-bg-primary border border-border text-txt"
                />
              </label>
            </div>
          </ToolPanel>
        </div>

        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <ToolPanel
            title="GENERATED TILES"
            statusClassName="bg-success"
            frameClassName="overflow-y-auto p-3 min-h-0"
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-border bg-bg-primary p-3 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-txt truncate">
                        {card.title}
                      </p>
                      <p className="text-xs text-txt-muted mt-0.5 truncate">
                        {card.subtitle}
                      </p>
                    </div>
                    <button
                      onClick={() => copyCard(card)}
                      className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] tr-smooth ${copiedId === card.id ? "bg-success/15 text-success border border-success/20" : "btn-glass"}`}
                    >
                      {copiedId === card.id ? (
                        <Check size={11} />
                      ) : (
                        <Copy size={11} />
                      )}
                      {copiedId === card.id ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(card.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-border bg-bg-secondary px-2.5 py-2"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-txt-muted">
                          {key}
                        </p>
                        <p className="text-xs text-txt mt-1 break-all">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ToolPanel>
        </div>
      </div>
    </div>
  );
}
