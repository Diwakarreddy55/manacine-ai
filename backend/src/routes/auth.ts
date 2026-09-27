import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../db";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const [existing] = await pool.query("SELECT id FROM users WHERE email=?", [data.email]);
    if ((existing as any[]).length) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(data.password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name,email,password_hash) VALUES (?,?,?)",
      [data.name, data.email, hash]
    );

    const userId = (result as any).insertId;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: userId, name: data.name, email: data.email } });
  } catch (e: any) {
    res.status(400).json({ message: e?.issues?.[0]?.message || "Invalid request" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.query("SELECT id,name,email,password_hash FROM users WHERE email=?", [email]);
  const user = (rows as any[])[0];
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;
