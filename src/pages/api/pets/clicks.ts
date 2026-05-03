import type { APIRoute } from "astro";
import { getDb } from "../../../db";
import { petClicks } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";

export const prerender = false;

const VALID_PETS = ["cal", "weez"] as const;
const VALID_ACTIONS = ["click", "treat"] as const;

export const GET: APIRoute = async () => {
  const db = getDb();
  const rows = await db.select().from(petClicks);
  return Response.json(rows, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { petName, action = "click" } = body;
  if (!VALID_PETS.includes(petName) || !VALID_ACTIONS.includes(action)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const column = action === "treat" ? petClicks.treats : petClicks.clicks;
  const db = getDb();
  const [row] = await db
    .update(petClicks)
    .set({ [action === "treat" ? "treats" : "clicks"]: sql`${column} + 1` })
    .where(eq(petClicks.petName, petName))
    .returning();

  return Response.json(row);
};
