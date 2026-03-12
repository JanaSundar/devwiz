import { describe, expect, it } from "vitest";
import { cn, safeParseJson } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toBe(
      "base visible",
    );
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("safeParseJson", () => {
  it("parses valid JSON from Response", async () => {
    const res = new Response(JSON.stringify({ data: "test" }));
    const parsed = await safeParseJson<{ data: string }>(res);
    expect(parsed).toEqual({ data: "test" });
  });

  it("returns empty object for empty body", async () => {
    const res = new Response("");
    const parsed = await safeParseJson(res);
    expect(parsed).toEqual({});
  });

  it("returns error object for invalid JSON", async () => {
    const res = new Response("{ invalid }");
    const parsed = await safeParseJson(res);
    expect(parsed).toHaveProperty("error", "Invalid response from server");
  });
});
