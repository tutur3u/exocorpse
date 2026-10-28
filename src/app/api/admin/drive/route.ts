import { driveFileResponse } from "@/lib/drive-file-response";
import { storagePath } from "@/lib/admin-input";
import { verifyAuth } from "@/lib/auth/utils";
import { adminErrorResponse } from "@/lib/admin-input";
import {
  createExocorpseDriveFolder,
  createExocorpseDriveUpload,
  deleteExocorpseDriveEntry,
  getExocorpseDriveAnalytics,
  getExocorpseDriveListing,
  renameExocorpseDriveEntry,
} from "@/lib/tuturuuu-admin-integrations";

export async function GET(request: Request) {
  try {
    await verifyAuth();
    const params = new URL(request.url).searchParams;
    const filePath = params.get("filePath");
    if (filePath) {
      storagePath(filePath);
      if (params.get("content") === "1")
        return await driveFileResponse(
          request,
          filePath,
          params.get("download") === "1",
        );
      // Keep signed storage URLs off the preview surface. The same-origin file
      // response enforces download disposition, nosniff and storage-host checks.
      return Response.json(
        {
          data: {
            signedUrl: `/api/admin/drive?${new URLSearchParams({ filePath, content: "1" })}`,
          },
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    const payload = params.has("analytics")
      ? await getExocorpseDriveAnalytics()
      : await getExocorpseDriveListing(params);
    return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (
      input.action === "create-folder" &&
      typeof input.path === "string" &&
      typeof input.name === "string"
    ) {
      return Response.json(
        await createExocorpseDriveFolder(input.path, input.name),
      );
    }
    if (
      input.action === "upload-url" &&
      typeof input.contentType === "string" &&
      typeof input.directory === "string" &&
      typeof input.filename === "string" &&
      typeof input.size === "number"
    ) {
      return Response.json(
        await createExocorpseDriveUpload({
          contentType: input.contentType,
          directory: input.directory,
          filename: input.filename,
          size: input.size,
        }),
      );
    }
    return Response.json({ error: "Invalid Drive action." }, { status: 400 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await verifyAuth();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (
      (input.kind === "file" || input.kind === "folder") &&
      typeof input.newName === "string" &&
      typeof input.path === "string"
    ) {
      return Response.json(
        await renameExocorpseDriveEntry({
          kind: input.kind,
          newName: input.newName,
          path: input.path,
        }),
      );
    }
    return Response.json({ error: "Invalid rename action." }, { status: 400 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAuth();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (
      (input.kind === "file" || input.kind === "folder") &&
      typeof input.path === "string"
    ) {
      return Response.json(
        await deleteExocorpseDriveEntry({ kind: input.kind, path: input.path }),
      );
    }
    return Response.json({ error: "Invalid delete action." }, { status: 400 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
