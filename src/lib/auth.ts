import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getMigrations } from "better-auth/db/migration";
import { headers } from "next/headers";
import { SqliteDialect } from "kysely";
import { db } from "./db";

export const authOptions = {
  database: { dialect: new SqliteDialect({ database: db }), type: "sqlite" as const },
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      pan: { type: "string", required: false },
      gstin: { type: "string", required: false },
    },
  },
  disabledPaths: [
    "/sign-up/email",
    "/update-user",
    "/change-password",
    "/change-email",
    "/delete-user",
    "/revoke-sessions",
    "/revoke-other-sessions",
  ],
  plugins: [nextCookies()],
} satisfies Parameters<typeof betterAuth>[0];

export const auth = betterAuth(authOptions);

const g = globalThis as unknown as { __pakkaMigrated?: Promise<void> };
export function ensureMigrated() {
  g.__pakkaMigrated ??= getMigrations(authOptions)
    .then((m) => m.runMigrations())
    .catch((e) => {
      g.__pakkaMigrated = undefined;
      throw e;
    });
  return g.__pakkaMigrated;
}

export async function currentUser() {
  await ensureMigrated();
  const s = await auth.api.getSession({ headers: await headers() });
  return s?.user ?? null;
}
