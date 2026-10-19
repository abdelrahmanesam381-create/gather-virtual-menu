import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.APP_URL || "http://localhost:3000")
    .origin;
  if (origin !== expected)
    throw new AppError(403, "This request must come from the application.");
}
export async function jsonBody(request: Request) {
  const text = await request.text();
  if (text.length > 65536)
    throw new AppError(413, "This request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError(400, "Send valid JSON.");
  }
}
export async function endpoint(work: () => Promise<unknown>) {
  try {
    return NextResponse.json(
      { data: await work() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (e instanceof ZodError)
      return NextResponse.json(
        { error: e.issues[0]?.message || "Check your input." },
        { status: 400 },
      );
    if (e instanceof AppError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return NextResponse.json(
        { error: "That email or address is already in use." },
        { status: 409 },
      );
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")
      return NextResponse.json(
        { error: "This record no longer exists. Refresh and try again." },
        { status: 404 },
      );
    console.error(
      "Request failed:",
      e instanceof Error ? e.name : "Unknown error",
    );
    return NextResponse.json(
      { error: "The service is unavailable. Please try again shortly." },
      { status: 503 },
    );
  }
}
