import { describe, it, expect, beforeEach } from "vitest";
import { useIncognitoStore } from "@/stores/incognitoStore";

describe("useIncognitoStore", () => {
  beforeEach(() => {
    useIncognitoStore.setState({ enabled: false });
  });

  it("starts with incognito mode disabled", () => {
    expect(useIncognitoStore.getState().enabled).toBe(false);
  });

  it("enables incognito mode when toggled from disabled", () => {
    useIncognitoStore.getState().toggle();
    expect(useIncognitoStore.getState().enabled).toBe(true);
  });

  it("disables incognito mode when toggled from enabled", () => {
    useIncognitoStore.setState({ enabled: true });
    useIncognitoStore.getState().toggle();
    expect(useIncognitoStore.getState().enabled).toBe(false);
  });

  it("toggles back and forth correctly (double toggle)", () => {
    useIncognitoStore.getState().toggle(); // false → true
    useIncognitoStore.getState().toggle(); // true → false
    expect(useIncognitoStore.getState().enabled).toBe(false);
  });
});
