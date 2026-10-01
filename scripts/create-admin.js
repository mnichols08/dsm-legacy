require("dotenv/config");

const bcrypt = require("bcryptjs");
const { getPool } = require("../lib/database");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || "admin";

  if (!email || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Set ADMIN_EMAIL to a valid email address.");
  }
  if (!password || password.length < 12 || password.length > 200) {
    throw new Error(
      "Set ADMIN_PASSWORD to a value between 12 and 200 characters.",
    );
  }
  if (!new Set(["admin", "moderator"]).has(role)) {
    throw new Error("ADMIN_ROLE must be admin or moderator.");
  }

  const pool = getPool();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO admin_users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      [email, passwordHash, role],
    );
    console.log(`Created ${role} account ${email}.`);
  } finally {
    await pool.end();
  }
}

createAdmin().catch((error) => {
  console.error("Unable to create moderator account:", error.message);
  process.exitCode = 1;
});
