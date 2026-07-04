import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { getUploadFilePath } from "@/lib/cms/storage";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp"
};

type UploadRouteParams = {
  params: Promise<{
    fileName: string;
  }>;
};

export async function GET(_request: Request, { params }: UploadRouteParams) {
  const { fileName } = await params;
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
  const extension = safeName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[extension];

  if (!safeName || !contentType) {
    return NextResponse.json({ message: "Файл не найден." }, { status: 404 });
  }

  try {
    const file = await fs.readFile(getUploadFilePath(safeName));

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType
      }
    });
  } catch {
    return NextResponse.json({ message: "Файл не найден." }, { status: 404 });
  }
}

