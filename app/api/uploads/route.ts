import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  const filename = `${timestamp}-${safeName}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
