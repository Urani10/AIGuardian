import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import type { ScanResult } from "../types/scan.js";

export type Provider =
  | "gemini"
  | "openai"
  | "grok"
  | "openrouter"
  | "huggingface";
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  suspended: boolean;
  verified: boolean;
  createdAt: string;
  apiKeys: Partial<
    Record<Provider, { masked: string; secret: string; updatedAt: string }>
  >;
  preferences: {
    theme: "light" | "dark";
    language: string;
    emailNotifications: boolean;
    twoFactor: boolean;
  };
  activity: string[];
}
export interface Db {
  users: User[];
  scans: (ScanResult & { userId: string; raw?: string })[];
  notifications: {
    id: string;
    userId: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    read: boolean;
    createdAt: string;
  }[];
}
const file = path.join(process.cwd(), env.DATA_DIR, "scanshield.json");
const initial: Db = { users: [], scans: [], notifications: [] };
export async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Db;
  } catch {
    return initial;
  }
}
export async function writeDb(db: Db) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(db, null, 2));
}
export function maskKey(key: string) {
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}
