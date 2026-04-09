import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const seedPath = path.join(process.cwd(), "seed", "questions.ar.json");
const raw = await fs.readFile(seedPath, "utf8");
const questions = JSON.parse(raw);

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query("begin");
  await client.query("truncate table questions restart identity");

  const sql = "insert into questions (id, question, answer) values ($1, $2, $3)";
  for (const row of questions) {
    await client.query(sql, [row.id, row.question, row.correct_answer]);
  }

  await client.query(
    "select setval(pg_get_serial_sequence('questions','id'), (select coalesce(max(id), 1) from questions), true)",
  );
  await client.query("commit");

  const countRes = await client.query("select count(*)::int as total_rows from questions");
  const nonAsciiRes = await client.query(
    "select count(*)::int as non_ascii_rows from questions where question ~ '[^\\x00-\\x7F]' or answer ~ '[^\\x00-\\x7F]'",
  );

  console.log({
    inserted_rows: countRes.rows[0].total_rows,
    non_ascii_rows: nonAsciiRes.rows[0].non_ascii_rows,
  });
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  await client.end();
}
