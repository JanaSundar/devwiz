import { describe, expect, it } from "vitest";
import { apiError, parseJsonBody, requirePost } from "./api";

describe("apiError", () => {
  it("returns JSON with error message and status", async () => {
    const res = apiError("Something went wrong", 400);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Something went wrong" });
  });

  it("defaults to 500 status", async () => {
    const res = apiError("Server error");
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Server error" });
  });
});

describe("requirePost", () => {
  it("returns null for POST requests", () => {
    const req = new Request("http://localhost/api", { method: "POST" });
    expect(requirePost(req)).toBeNull();
  });

  it("returns 405 for GET requests", async () => {
    const req = new Request("http://localhost/api", { method: "GET" });
    const res = requirePost(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(405);
    const json = await res!.json();
    expect(json.error).toContain("GET");
  });

  it("returns 405 for PUT requests", async () => {
    const req = new Request("http://localhost/api", { method: "PUT" });
    const res = requirePost(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(405);
  });
});

describe("parseJsonBody", () => {
  it("parses valid JSON body", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify({ foo: "bar", count: 42 }),
    });
    const result = await parseJsonBody<{ foo: string; count: number }>(req);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ foo: "bar", count: 42 });
  });

  it("returns error for empty body", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: "",
    });
    const result = await parseJsonBody(req);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
    const json = await result.error!.json();
    expect(json.error).toBe("Request body is required");
  });

  it("returns error for whitespace-only body", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: "   \n\t  ",
    });
    const result = await parseJsonBody(req);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
  });

  it("returns error for invalid JSON", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: "{ invalid json }",
    });
    const result = await parseJsonBody(req);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
    const json = await result.error!.json();
    expect(json.error).toBe("Invalid JSON in request body");
  });

  it("returns error for malformed JSON (unclosed string)", async () => {
    const req = new Request("http://localhost/api", {
      method: "POST",
      body: '{"key": "unclosed',
    });
    const result = await parseJsonBody(req);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(400);
  });
});
