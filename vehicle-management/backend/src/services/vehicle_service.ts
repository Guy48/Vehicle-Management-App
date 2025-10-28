// backend/src/services/vehicle_service.ts
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import type { Vehicle } from "../types/vehicle.type.js";

// ESM-safe __dirname shim relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "../../data/vehicles.json");
const seedPath = path.join(__dirname, "../../data/vehicles.seed.json");

// Config
export const MAINTENANCE_PERCENT = Number(process.env.MAINTENANCE_PERCENT ?? 5);
export const MIN_MAINTENANCE = Number(process.env.MIN_MAINTENANCE ?? 0);

export function readVehicles(): Vehicle[] {
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(raw) as Vehicle[];
  } catch (err) {
    console.error("Failed to read vehicles.json:", err);
    return [];
  }
}

export function writeVehicles(vehicles: Vehicle[]) {
  fs.writeFileSync(dataPath, JSON.stringify(vehicles, null, 2), "utf8");
}

export function resetFromSeed() {
  fs.copyFileSync(seedPath, dataPath);
}

export function maintenanceCap(total: number) {
  // strict floor behaviour: small fleets can have 0 in maintenance (unchanged logic)
  const allowed = Math.floor((total * MAINTENANCE_PERCENT) / 100);
  return Math.max(MIN_MAINTENANCE, allowed);
}

// VALIDATORS
// 1) id: exactly 8 alphanumeric chars (letters or digits)
export function isValidId(id: string) {
  return /^[A-Za-z0-9]{8}$/.test(id);
}

// 2) license: only uppercase letters, digits and hyphen
export function isValidLicense(license: string) {
  return /^[A-Z0-9-]+$/.test(license);
}

// generate id helper (same behaviour as before)
export function genId(): string {
  return nanoid(8);
}
