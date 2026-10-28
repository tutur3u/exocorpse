// Test-only Node preload. The built app uses fixture HTTP without external I/O.
const token = "drive-http-fixture-token";
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" ? input : (input.url ?? input.href),
  );
  if (url.origin === "https://drive-http-fixture.test") {
    if (new Headers(init?.headers).get("authorization") !== `Bearer ${token}`) {
      return Response.json({}, { status: 401 });
    }
    if (url.pathname.endsWith("/summary")) return Response.json({});
    if (url.pathname.endsWith("/storage")) {
      const path = url.searchParams.get("filePath") ?? "";
      return Response.json({
        data: {
          expiresIn: 60,
          signedUrl: `https://nzamlzqfdwaaxdefwraj.supabase.co/storage/v1/object/sign/fixture/file?${new URLSearchParams({ path })}`,
        },
      });
    }
  }
  if (url.origin === "https://nzamlzqfdwaaxdefwraj.supabase.co") {
    const path = url.searchParams.get("path") ?? "";
    const contentType = path.endsWith(".png")
      ? "image/png"
      : path.endsWith(".pdf")
        ? "application/pdf"
        : path.endsWith(".mp4")
          ? "video/mp4"
          : "text/html";
    let count = 0;
    const body = path.endsWith(".mp4")
      ? new ReadableStream({
          pull(controller) {
            if (count++ === 6) controller.close();
            else controller.enqueue(new Uint8Array(1024 * 1024).fill(42));
          },
        })
      : "fixture file bytes";
    return new Response(body, { headers: { "Content-Type": contentType } });
  }
  throw new Error("The built Drive test blocks non-fixture upstream requests.");
};
