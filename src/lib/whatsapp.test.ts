import { describe, expect, it } from "vitest";
import {
  buildTelLink,
  buildWhatsAppLink,
  normalizePakPhone,
  propertyWhatsAppMessage,
} from "./whatsapp";

describe("normalizePakPhone", () => {
  it("passes through a well-formed +92 number", () => {
    expect(normalizePakPhone("+923001234567")).toBe("+923001234567");
  });

  it("converts a local 03xx number", () => {
    expect(normalizePakPhone("03001234567")).toBe("+923001234567");
  });

  it("converts an 0092-prefixed number", () => {
    expect(normalizePakPhone("00923001234567")).toBe("+923001234567");
  });

  it("converts a bare 92-prefixed number", () => {
    expect(normalizePakPhone("923001234567")).toBe("+923001234567");
  });

  it("strips spaces and dashes", () => {
    expect(normalizePakPhone("0300-123 4567")).toBe("+923001234567");
  });
});

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with an encoded message", () => {
    const link = buildWhatsAppLink("0300 1234567", "Hello there");
    expect(link).toBe("https://wa.me/923001234567?text=Hello+there");
  });

  it("builds a wa.me link with no message", () => {
    const link = buildWhatsAppLink("0300 1234567");
    expect(link).toBe("https://wa.me/923001234567");
  });
});

describe("buildTelLink", () => {
  it("builds a tel: link from a local number", () => {
    expect(buildTelLink("03001234567")).toBe("tel:+923001234567");
  });
});

describe("propertyWhatsAppMessage", () => {
  it("includes the ref code and title", () => {
    const message = propertyWhatsAppMessage("EB-1042", "5 Marla House in DHA Phase 6");
    expect(message).toContain("EB-1042");
    expect(message).toContain("5 Marla House in DHA Phase 6");
  });
});
