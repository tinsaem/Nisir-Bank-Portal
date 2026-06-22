import "dotenv/config";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Client } = pg;

const SHARED_PASSWORD = "Nisir@2019!";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

function padEmployeeNumber(number) {
  return String(number).padStart(3, "0");
}

async function main() {
  await client.connect();

  const passwordHash = await bcrypt.hash(SHARED_PASSWORD, 12);

  for (let i = 1; i <= 105; i++) {
    const employeeId = `EMP-${padEmployeeNumber(i)}`;

    await client.query(
      `
      insert into "EmployeeAccount" (
        id,
        "employeeId",
        "passwordHash",
        role,
        "mustResetPassword",
        "createdAt",
        "updatedAt"
      )
      values ($1, $2, $3, 'EMPLOYEE', false, now(), now())
      on conflict ("employeeId")
      do update set
        "passwordHash" = excluded."passwordHash",
        "mustResetPassword" = excluded."mustResetPassword",
        "updatedAt" = now()
      `,
      [randomUUID(), employeeId, passwordHash]
    );
  }

  console.log(`Seeded 105 EmployeeAccount records: EMP-001 to EMP-105, shared password "${SHARED_PASSWORD}".`);
}

main()
  .catch((error) => {
    console.error("Failed to seed employee accounts:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
