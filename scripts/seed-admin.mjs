import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { randomUUID } from "crypto";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const ADMIN_ID = "ADMIN";
const ADMIN_PASSWORD = "Admin@Nisir2026!";

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

await client.query(
  `insert into "EmployeeAccount" (id, "employeeId", "passwordHash", role, "mustResetPassword", "createdAt", "updatedAt")
   values ($1, $2, $3, 'ADMIN', false, now(), now())
   on conflict ("employeeId") do update set
     "passwordHash" = excluded."passwordHash",
     role = 'ADMIN',
     "mustResetPassword" = false,
     "updatedAt" = now()`,
  [randomUUID(), ADMIN_ID, passwordHash]
);

console.log("Admin account created.");
console.log("  Employee ID: " + ADMIN_ID);
console.log("  Password:    " + ADMIN_PASSWORD);
console.log("  Role:        ADMIN");
console.log("  Redirects to: /admin_dashboard");

await client.end();
