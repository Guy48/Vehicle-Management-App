// frontend/src/api/vehicles.ts
export type Vehicle = {
  id: string
  licensePlate: string
  status: 'Available' | 'InUse' | 'Maintenance'
  createdAt: string
}

const BASE = "http://localhost:4000"

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${BASE}/vehicles`)
  console.log("here::")
  console.log(res)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Failed to load vehicles (${res.status}): ${txt}`)
  }
  return res.json()
}
