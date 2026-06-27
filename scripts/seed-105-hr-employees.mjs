import "dotenv/config";
import { randomUUID } from "crypto";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

function padEmployeeNumber(number) {
  return String(number).padStart(3, "0");
}

async function main() {
  await client.connect();

  for (let i = 1; i <= 105; i++) {
    const number = padEmployeeNumber(i);

    const employeeId = `EMP-${number}`;
    const fullName = `Employee ${number}`;
    const email = `emp${number}@nisirbank.local`;

    await client.query(
      `
      insert into "HrEmployee" (
        id,
        "employeeId",
        "fullName",
        email,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      values ($1, $2, $3, $4, $5, now(), now())
      on conflict ("employeeId")
      do update set
        "fullName" = excluded."fullName",
        email = excluded.email,
        "isActive" = excluded."isActive",
        "updatedAt" = now()
      `,
      [randomUUID(), employeeId, fullName, email, true]
    );
  }

  console.log("Seeded 105 HR employees: EMP-001 to EMP-105.");
}

main()
  .catch((error) => {
    console.error("Failed to seed HR employees:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });