import { describe, it, expect } from "vitest";
import { OPERATOR_PROFILES } from "../components/OperatorProfiles";

describe("Operator Profiles", () => {
  it("should have all 4 required operator personas", () => {
    expect(OPERATOR_PROFILES.length).toBe(4);
    const ids = OPERATOR_PROFILES.map((p) => p.id);
    expect(ids).toContain("gov-analyst");
    expect(ids).toContain("comms-officer");
    expect(ids).toContain("corporate-pr");
    expect(ids).toContain("content-creator");
  });

  it("should have valid default outputs and detail levels", () => {
    for (const profile of OPERATOR_PROFILES) {
      expect(profile.defaultOutputs.length).toBeGreaterThan(0);
      expect(["concise", "standard", "detailed"]).toContain(profile.defaultDetailLevel);
    }
  });
});
