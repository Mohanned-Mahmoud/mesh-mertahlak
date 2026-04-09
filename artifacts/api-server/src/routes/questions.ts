import { Router, type IRouter } from "express";
import { db, questionsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/questions/random", async (req, res): Promise<void> => {
  const [question] = await db
    .select()
    .from(questionsTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!question) {
    res.status(404).json({ error: "No questions found" });
    return;
  }

  res.json(question);
});

router.get("/questions", async (_req, res): Promise<void> => {
  const questions = await db.select().from(questionsTable);
  res.json(questions);
});

export default router;
