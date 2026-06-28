import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(
  `SELECT "sequenceNumber", "isPhishing", length(body) as chars, body
   FROM "InternalEmail"
   ORDER BY "sequenceNumber"`
);

for (const r of res.rows) {
  const tag = r.isphishing ? " [PHISHING]" : "";
  console.log(`\n=== EMAIL #${r.sequencenumber}${tag} (${r.chars} chars) ===`);
  console.log(r.body);
}

await client.end();
