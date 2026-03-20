/* ============================================================
   AutoRepHero — Vercel Serverless Function for tRPC
   Uses @trpc/server/adapters/fetch — no Express dependency,
   works natively in Vercel's Node.js serverless runtime.
   ============================================================ */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/routers";
import { createContext } from "../server/trpc";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Build a standard Request object from the Vercel request
  const url = `https://${req.headers.host || "localhost"}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = JSON.stringify(req.body);
    headers.set("content-type", "application/json");
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => {
      // Build a minimal Express-compatible context for our createContext function
      const cookieHeader = req.headers.cookie || "";
      const expressLike = {
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url,
      } as any;
      const responseLike = {
        setHeader: (k: string, v: string) => res.setHeader(k, v),
        getHeader: (k: string) => res.getHeader(k),
      } as any;
      return createContext({ req: expressLike, res: responseLike });
    },
  });

  // Copy response headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Forward Set-Cookie header (important for JWT auth)
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }

  res.status(response.status);

  const text = await response.text();
  res.send(text);
}
