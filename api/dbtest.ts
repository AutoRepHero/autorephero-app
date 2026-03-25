import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT 1 as ok`;
    res.status(200).json({ db: "connected", result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
