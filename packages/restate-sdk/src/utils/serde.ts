import { Buffer } from "node:buffer";
import { TerminalError } from "../types/errors.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function serializeJson(item: any): Uint8Array {
  if (item === undefined) {
    return Buffer.alloc(0);
  }
  try {
    const str = JSON.stringify(item);
    return Buffer.from(str);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TerminalError(`Failed to serialize JSON: ${e}`);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function deserializeJson(buf: Uint8Array): any {
  if (buf.length === 0) {
    return undefined;
  }
  const b = Buffer.from(buf);
  const str = b.toString("utf8");
  try {
    return JSON.parse(str);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TerminalError(`Failed to parse JSON: ${e}`);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function serializeNoop(item: any): Uint8Array {
  if (!(item instanceof Uint8Array)) {
    throw new TerminalError(`Return value must be an instance of a Uint8Array`);
  }
  return item;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function deserializeNoop(buf: Uint8Array): any {
  return buf;
}
