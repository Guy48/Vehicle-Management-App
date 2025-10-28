interface Vehicle {
  id: string;
  licensePlate: string;
  status: "Available" | "InUse" | "Maintenance";
}

let vehicles: Vehicle[] = [];

function reset() {
  vehicles = [];
}

function createVehicle(
  id: string,
  licensePlate: string,
  status: Vehicle["status"] = "Available"
): Vehicle {
  if (id.length !== 8) throw new Error("Invalid id length");
  if (!/^[A-Z0-9]{5,8}$/.test(licensePlate)) throw new Error("Invalid license plate");
  if (vehicles.find(v => v.id === id)) throw new Error("Duplicate id");
  if (vehicles.find(v => v.licensePlate === licensePlate))
    throw new Error("Duplicate license plate");

  if (status === "Maintenance") {
    const maintenanceCount = vehicles.filter(v => v.status === "Maintenance").length;
    if (maintenanceCount >= 2) throw new Error("Too many vehicles in maintenance");
  }

  const newVehicle = { id, licensePlate, status };
  vehicles.push(newVehicle);
  return newVehicle;
}

function deleteVehicle(id: string): boolean {
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) return false;
  if (vehicles[index].status === "InUse" || vehicles[index].status === "Maintenance")
    throw new Error("Cannot delete vehicle that is in use or under maintenance");
  vehicles.splice(index, 1);
  return true;
}

function updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
  const vehicle = vehicles.find(v => v.id === id);
  if (!vehicle) throw new Error("Vehicle not found");

  if (updates.id && updates.id !== id) {
    if (vehicles.find(v => v.id === updates.id)) throw new Error("Duplicate id");
    if (updates.id.length !== 8) throw new Error("Invalid id length");
  }

  if (updates.licensePlate && updates.licensePlate !== vehicle.licensePlate) {
    if (!/^[A-Z0-9]{5,8}$/.test(updates.licensePlate))
      throw new Error("Invalid license plate");
    if (vehicles.find(v => v.licensePlate === updates.licensePlate))
      throw new Error("Duplicate license plate");
  }

  if (updates.status === "Maintenance") {
    const maintenanceCount = vehicles.filter(v => v.status === "Maintenance").length;
    if (maintenanceCount >= 2) throw new Error("Too many vehicles in maintenance");
  }

  Object.assign(vehicle, updates);
  return vehicle;
}

describe("Vehicle System — Complex Scenarios and Edge Cases", () => {
  beforeEach(() => reset());

  test("fails when creating with invalid license format or invalid id length", () => {
    expect(() => createVehicle("ABC", "A12")).toThrow("Invalid id length");
    expect(() => createVehicle("ABCDEFGH", "abcd12")).toThrow("Invalid license plate");
  });

  test("prevents creating more than 2 vehicles in maintenance", () => {
    createVehicle("A1111111", "CAR001", "Maintenance");
    createVehicle("A2222222", "CAR002", "Maintenance");
    expect(() =>
      createVehicle("A3333333", "CAR003", "Maintenance")
    ).toThrow("Too many vehicles in maintenance");
  });

  test("cannot delete a car that is in use or maintenance", () => {
    createVehicle("U1111111", "USE100", "InUse");
    createVehicle("M1111111", "MAINT1", "Maintenance");
    expect(() =>
      deleteVehicle("U1111111")
    ).toThrow("Cannot delete vehicle that is in use or under maintenance");
    expect(() =>
      deleteVehicle("M1111111")
    ).toThrow("Cannot delete vehicle that is in use or under maintenance");
  });

  test("edit licensePlate to an invalid one fails", () => {
    createVehicle("V1111111", "AAA111");
    expect(() =>
      updateVehicle("V1111111", { licensePlate: "bad!!" })
    ).toThrow("Invalid license plate");
  });

  test("rename vehicle id to one that already exists fails", () => {
    createVehicle("X1111111", "CAR111");
    createVehicle("X2222222", "CAR222");
    expect(() =>
      updateVehicle("X1111111", { id: "X2222222" })
    ).toThrow("Duplicate id");
  });

  test("perform sequence: create → update → delete → reuse", () => {
    const car = createVehicle("SEQ11111", "SEQ111");
    updateVehicle("SEQ11111", { status: "InUse" });
    expect(() =>
      deleteVehicle("SEQ11111")
    ).toThrow("Cannot delete vehicle that is in use or under maintenance");
    updateVehicle("SEQ11111", { status: "Available" });
    expect(deleteVehicle("SEQ11111")).toBe(true);
    expect(createVehicle("SEQ11111", "SEQ111")).toBeTruthy(); // reuse both id and plate
  });

  test("simulate messy operations and ensure consistency", () => {
    createVehicle("AAAAAAA1", "AAA11");
    createVehicle("BBBBBBB2", "BBB22");
    expect(() =>
      updateVehicle("BBBBBBB2", { licensePlate: "AAA11" })
    ).toThrow("Duplicate license plate");
    updateVehicle("AAAAAAA1", { status: "Maintenance" });
    createVehicle("CCCCCCC3", "CCC33", "Maintenance");
    expect(() =>
      createVehicle("DDDDDDD4", "DDD44", "Maintenance")
    ).toThrow("Too many vehicles in maintenance");
    expect(deleteVehicle("BBBBBBB2")).toBe(true);
    const newB = createVehicle("BBBBBBB2", "BBB22");
    expect(newB.id).toBe("BBBBBBB2");
  });

  test("system handles empty state gracefully", () => {
    expect(deleteVehicle("NOTFOUND")).toBe(false);
    expect(() =>
      updateVehicle("MISSING1", { status: "Available" })
    ).toThrow("Vehicle not found");
  });
});
