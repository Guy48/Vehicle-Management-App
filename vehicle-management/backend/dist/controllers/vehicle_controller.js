import { readVehicles, writeVehicles, resetFromSeed, maintenanceCap, isValidId, isValidLicense, genId, } from "../services/vehicle_service.js";
/**
 * Controller functions. Each function uses the exact business logic from the
 * original app.ts but delegates IO/utility to the service layer.
 */
export function getAllVehicles(req, res) {
    const vehicles = readVehicles();
    res.json(vehicles);
}
export function getVehicleById(req, res) {
    const vehicles = readVehicles();
    const v = vehicles.find((x) => x.id === req.params.id);
    if (!v)
        return res.status(404).json({ error: "Vehicle not found" });
    return res.json(v);
}
export function createVehicle(req, res) {
    const rawId = req.body?.id;
    const providedId = typeof rawId === "string" ? rawId.trim() : rawId;
    const rawLicense = typeof req.body?.licensePlate === "string" ? req.body.licensePlate.trim() : req.body?.licensePlate;
    if (!rawLicense) {
        return res.status(400).json({ error: "licensePlate is required" });
    }
    const licensePlate = rawLicense.toUpperCase();
    // validate license format
    if (!isValidLicense(licensePlate)) {
        return res.status(400).json({
            error: "Invalid licensePlate format. Use only uppercase letters, digits and hyphen (e.g. ABC-123 or ABC123).",
        });
    }
    const vehicles = readVehicles();
    if (vehicles.some((v) => v.licensePlate === licensePlate)) {
        return res.status(400).json({ error: "licensePlate must be unique" });
    }
    let idToUse;
    if (providedId !== undefined && providedId !== null && String(providedId).length > 0) {
        // validate id format (exactly 8 alnum)
        if (typeof providedId !== "string" || !isValidId(providedId)) {
            return res.status(400).json({
                error: "Invalid id provided. Id must be exactly 8 letters or digits (e.g. A1B2C3D4).",
            });
        }
        if (vehicles.some((v) => v.id === providedId)) {
            return res.status(400).json({ error: "id must be unique" });
        }
        idToUse = providedId;
    }
    else {
        idToUse = genId();
    }
    const newVehicle = {
        id: idToUse,
        licensePlate,
        status: "Available",
        createdAt: new Date().toISOString(),
    };
    vehicles.push(newVehicle);
    writeVehicles(vehicles);
    return res.status(201).json(newVehicle);
}
export function updateVehicle(req, res) {
    const vehicles = readVehicles();
    const idx = vehicles.findIndex((v) => v.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: "Vehicle not found" });
    const target = { ...vehicles[idx] }; // copy so we can change id safely
    const { id: newIdRaw, licensePlate: newPlateRaw, status } = req.body ?? {};
    // licensePlate update => must be unique && valid format
    if (newPlateRaw && typeof newPlateRaw === "string" && newPlateRaw !== target.licensePlate) {
        const newPlate = newPlateRaw.trim().toUpperCase();
        if (!isValidLicense(newPlate)) {
            return res.status(400).json({
                error: "Invalid licensePlate format. Use only uppercase letters, digits and hyphen.",
            });
        }
        if (vehicles.some((v) => v.licensePlate === newPlate && v.id !== target.id)) {
            return res.status(400).json({ error: "licensePlate must be unique" });
        }
        target.licensePlate = newPlate;
    }
    // id update => must be valid & unique (exactly 8 alnum)
    if (newIdRaw !== undefined && newIdRaw !== null) {
        if (typeof newIdRaw !== "string" || newIdRaw.trim().length === 0) {
            return res.status(400).json({ error: "id cannot be empty" });
        }
        const newId = newIdRaw.trim();
        if (!isValidId(newId)) {
            return res.status(400).json({ error: "Invalid id format. Id must be exactly 8 letters or digits." });
        }
        if (vehicles.some((v) => v.id === newId && v.id !== target.id)) {
            return res.status(400).json({ error: "id must be unique" });
        }
        target.id = newId;
    }
    // status transition rules
    if (status && status !== target.status) {
        // If moving from Maintenance, allow only to Available
        if (target.status === "Maintenance" && status !== "Available") {
            return res.status(400).json({ error: "Vehicles in Maintenance can only move to Available" });
        }
        // If setting to Maintenance, enforce cap
        if (status === "Maintenance") {
            const total = vehicles.length;
            const currentMaintenanceCount = vehicles.filter((v) => v.status === "Maintenance").length;
            const maxAllowed = maintenanceCap(total);
            // if target isn't currently Maintenance we plan to add +1
            const adding = target.status === "Maintenance" ? 0 : 1;
            if (currentMaintenanceCount + adding > maxAllowed) {
                return res.status(400).json({
                    error: `Maintenance quota reached: ${currentMaintenanceCount} of ${total} vehicles currently in Maintenance (max allowed: ${maxAllowed})`,
                });
            }
        }
        target.status = status;
    }
    // replace the entry — careful: if id changed we must update the array accordingly
    vehicles.splice(idx, 1, target);
    writeVehicles(vehicles);
    return res.json(target);
}
export function deleteVehicle(req, res) {
    const vehicles = readVehicles();
    const idx = vehicles.findIndex((v) => v.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: "Vehicle not found" });
    const target = vehicles[idx];
    if (target.status === "InUse" || target.status === "Maintenance") {
        return res.status(400).json({ error: "Cannot delete vehicle while InUse or Maintenance" });
    }
    vehicles.splice(idx, 1);
    writeVehicles(vehicles);
    return res.status(204).send();
}
export function resetFromSeedHandler(req, res) {
    try {
        resetFromSeed();
        return res.status(204).send();
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to reset data" });
    }
}
