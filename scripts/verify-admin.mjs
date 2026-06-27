import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const res = await client.query(
  `SELECT "employeeId", role, "passwordHash" FROM "EmployeeAccount" WHERE "employeeId" = 'ADMIN'`
);

if (res.rows.length === 0) {
  console.log("ERROR: No ADMIN account found in database.");
} else {
  const { employeeId, role, passwordHash } = res.rows[0];
  const matches = await bcrypt.compare("Admin@Nisir2026!", passwordHash);
  console.log("Account found:", employeeId, "| Role:", role);
  console.log("Password match:", matches);
}

await client.end();
