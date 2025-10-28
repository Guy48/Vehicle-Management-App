// backend/src/app.ts
import express from "express";
import cors from "cors";
import vehicleRoutes from "./routes/vehicle_route.js";
const app = express();
app.use(cors());
app.use(express.json());
// mount the vehicle routes
app.use("/", vehicleRoutes);
export default app;
