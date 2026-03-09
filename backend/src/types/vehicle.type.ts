// backend/src/types/vehicle.type.ts
export type Vehicle = {
  id: string;
  licensePlate: string;
  status: "Available" | "InUse" | "Maintenance";
  createdAt: string;
};
