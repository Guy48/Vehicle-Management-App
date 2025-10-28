// backend/src/routes/vehicle_route.ts
import { Router } from "express";
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, resetFromSeedHandler, } from "../controllers/vehicle_controller.js";
const router = Router();
router.get("/vehicles", getAllVehicles);
router.get("/vehicles/:id", getVehicleById);
router.post("/vehicles", createVehicle);
router.patch("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);
// dev-only reset
router.post("/__reset_from_seed", resetFromSeedHandler);
export default router;
