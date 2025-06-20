import { randomBytes } from "crypto";

export function uuid() {
  return randomBytes(16).toString("hex");
}
