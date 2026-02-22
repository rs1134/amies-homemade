import express from "express";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let razorpayInstance: Razorpay | null = null;

  const getRazorpay = () => {
    if (!razorpayInstance) {
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables");
      }

      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    }
    return razorpayInstance;
  };

  // API Route to create Razorpay Order
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency, receipt } = req.body;
      
      const razorpay = getRazorpay();
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency: currency || "INR",
        receipt: receipt || `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Order Creation Error:", error);
      res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
    }
  });

  // API Route to verify payment (optional but recommended)
  app.post("/api/verify-payment", (req, res) => {
    // In a real app, you would verify the signature here
    // For this demo, we'll just return success
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
