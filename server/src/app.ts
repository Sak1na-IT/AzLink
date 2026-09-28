import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma";
import authRoutes from "./modules/auth/auth.routes";
import providersRoutes from "./modules/providers/providers.routes";
import areasRoutes from "./modules/areas/areas.routes";
import businessRoutes from "./modules/business/business.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import savedRoutes from "./modules/saved/saved.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verilənlər bazası xətası" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/providers", providersRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/saved", savedRoutes);

export default app;