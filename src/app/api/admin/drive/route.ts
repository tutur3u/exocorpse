import {
  createExocorpseDriveFolder,
  createExocorpseDriveUpload,
  deleteExocorpseDriveEntry,
  getExocorpseDriveAnalytics,
  getExocorpseDriveListing,
  getExocorpseDriveReadUrl,
  renameExocorpseDriveEntry,
} from "@/lib/tuturuuu-admin-integrations";

function errorResponse(error: unknown) {
  const status =
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  return Response.json(
    { error: error instanceof Error ? error.message : "Drive request failed" },
    { status },
  );
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const filePath = params.get("filePath");
    const payload = filePath
      ? await getExocorpseDriveReadUrl(filePath)
      : params.has("analytics")
        ? await getExocorpseDriveAnalytics()
        : await getExocorpseDriveListing(params);
    return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      body.action === "create-folder" &&
      typeof body.path === "string" &&
      typeof body.name === "string"
    ) {
      return Response.json(
        await createExocorpseDriveFolder(body.path, body.name),
      );
    }
    if (
      body.action === "upload-url" &&
      typeof body.contentType === "string" &&
      typeof body.directory === "string" &&
      typeof body.filename === "string" &&
      typeof body.size === "number"
    ) {
      return Response.json(
        await createExocorpseDriveUpload({
          contentType: body.contentType,
          directory: body.directory,
          filename: body.filename,
          size: body.size,
        }),
      );
    }
    return Response.json({ error: "Invalid Drive action." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      (body.kind === "file" || body.kind === "folder") &&
      typeof body.newName === "string" &&
      typeof body.path === "string"
    ) {
      return Response.json(
        await renameExocorpseDriveEntry({
          kind: body.kind,
          newName: body.newName,
          path: body.path,
        }),
      );
    }
    return Response.json({ error: "Invalid rename action." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      (body.kind === "file" || body.kind === "folder") &&
      typeof body.path === "string"
    ) {
      return Response.json(
        await deleteExocorpseDriveEntry({ kind: body.kind, path: body.path }),
      );
    }
    return Response.json({ error: "Invalid delete action." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
