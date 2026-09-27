import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { auth, AuthRequest } from "../middleware/auth";
import { generateStory } from "../services/aiProvider";

const router = Router();
router.use(auth);

const createSchema = z.object({
  title: z.string().min(1).max(255),
  prompt: z.string().min(10),
  duration_minutes: z.number().int().min(1).max(20),
  language: z.string().default("te")
});

router.get("/", async (req: AuthRequest, res) => {
  const [rows] = await pool.query(
    "SELECT id,title,prompt,language,duration_minutes,status,progress,final_video_url,created_at FROM projects WHERE user_id=? ORDER BY id DESC",
    [req.userId]
  );
  res.json(rows);
});

router.get("/:id", async (req: AuthRequest, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM projects WHERE id=? AND user_id=?",
    [req.params.id, req.userId]
  );
  const project = (rows as any[])[0];
  if (!project) return res.status(404).json({ message: "Project not found" });

  const [characters] = await pool.query("SELECT * FROM characters WHERE project_id=? ORDER BY id", [project.id]);
  const [scenes] = await pool.query("SELECT * FROM scenes WHERE project_id=? ORDER BY scene_number", [project.id]);
  res.json({ ...project, characters, scenes });
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const data = createSchema.parse(req.body);
    const [result] = await pool.query(
      "INSERT INTO projects (user_id,title,prompt,duration_minutes,language,status,progress) VALUES (?,?,?,?,?,'queued',0)",
      [req.userId, data.title, data.prompt, data.duration_minutes, data.language]
    );
    const projectId = (result as any).insertId;

    await pool.query(
      "INSERT INTO generation_jobs (project_id,job_type,status) VALUES (?,'story','queued')",
      [projectId]
    );

    res.status(201).json({ id: projectId, status: "queued" });
  } catch (e: any) {
    res.status(400).json({ message: e?.issues?.[0]?.message || "Invalid request" });
  }
});

router.post("/:id/generate", async (req: AuthRequest, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM projects WHERE id=? AND user_id=?",
    [req.params.id, req.userId]
  );
  const project = (rows as any[])[0];
  if (!project) return res.status(404).json({ message: "Project not found" });

  await pool.query("UPDATE projects SET status='generating',progress=5 WHERE id=?", [project.id]);

  // Starter implementation. Move this work to BullMQ/GPU workers before high-volume production.
  try {
    const story = await generateStory(project.prompt, project.duration_minutes);

    await pool.query(
      "UPDATE projects SET title=?,status='generating',progress=25 WHERE id=?",
      [story.title, project.id]
    );

    for (const c of story.characters) {
      await pool.query(
        "INSERT INTO characters (project_id,name,role_name,gender,age,appearance,personality) VALUES (?,?,?,?,?,?,?)",
        [project.id,c.name,c.role_name,c.gender,c.age,c.appearance,c.personality]
      );
    }

    for (const s of story.scenes) {
      await pool.query(
        "INSERT INTO scenes (project_id,scene_number,title,description,dialogue,duration_seconds,status) VALUES (?,?,?,?,?,?,?)",
        [project.id,s.scene_number,s.title,s.description,s.dialogue,s.duration_seconds,"pending"]
      );
    }

    await pool.query("UPDATE projects SET progress=40 WHERE id=?", [project.id]);
    res.json({ message: "Story and scenes generated", projectId: project.id });
  } catch {
    await pool.query("UPDATE projects SET status='failed' WHERE id=?", [project.id]);
    res.status(500).json({ message: "Generation failed" });
  }
});

export default router;
