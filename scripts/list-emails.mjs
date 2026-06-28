import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(
  `SELECT "sequenceNumber", "senderName", "senderEmail", subject, tag,
          "actionType", "isPhishing", "phishingLevel", body
   FROM "InternalEmail"
   ORDER BY "sequenceNumber"`
);

console.log(`Total emails: ${res.rows.length}\n`);
console.log("=".repeat(80));
for (const r of res.rows) {
  console.log(`\nEMAIL #${r.sequenceNumber}${r.isPhishing ? "  *** PHISHING (" + r.phishingLevel + ") ***" : ""}`);
  console.log(`Subject : ${r.subject}`);
  console.log(`From    : ${r.senderName} <${r.senderEmail}>`);
  console.log(`Tag     : ${r.tag}  |  Action: ${r.actionType}`);
  console.log("-".repeat(80));
  console.log(r.body);
  console.log("=".repeat(80));
}

await client.end();
