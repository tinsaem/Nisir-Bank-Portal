import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Assign departments based on the research design grouping:
//   EMP-001 to EMP-035 → Retail Banking     (Teller profile)
//   EMP-036 to EMP-070 → Customer Relations  (Customer Service profile)
//   EMP-071 to EMP-105 → Branch Operations   (Branch Officer profile)
const res = await client.query(`
  UPDATE "HrEmployee"
  SET department = CASE
    WHEN CAST(SPLIT_PART("employeeId", '-', 2) AS INTEGER) <= 35  THEN 'Retail Banking'
    WHEN CAST(SPLIT_PART("employeeId", '-', 2) AS INTEGER) <= 70  THEN 'Customer Relations'
    ELSE 'Branch Operations'
  END,
  "updatedAt" = NOW()
  WHERE "employeeId" LIKE 'EMP-%'
  RETURNING "employeeId", department
`);

console.log(`Updated ${res.rowCount} employee records.\n`);

// Summary
const counts = { "Retail Banking": 0, "Customer Relations": 0, "Branch Operations": 0 };
for (const r of res.rows) counts[r.department]++;
for (const [dept, count] of Object.entries(counts)) {
  console.log(`  ${dept}: ${count} employees`);
}

await client.end();
console.log("\nDepartments assigned successfully.");
