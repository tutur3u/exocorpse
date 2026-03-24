type CofiSupabaseClient = {
  from: (...args: any[]) => any;
};

export async function getCofiAdminSummary(supabase: CofiSupabaseClient) {
  const [
    { count: sampleCount, error: sampleError },
    { count: embeddingCount, error: embeddingError },
  ] = await Promise.all([
    supabase.from("cofi_samples").select("*", { count: "exact", head: true }),
    supabase
      .from("cofi_sample_embeddings")
      .select("*", { count: "exact", head: true }),
  ]);

  if (sampleError && sampleError.code !== "42P01") {
    throw sampleError;
  }

  if (embeddingError && embeddingError.code !== "42P01") {
    throw embeddingError;
  }

  return {
    sampleCount: sampleCount ?? 0,
    embeddingCount: embeddingCount ?? 0,
    hasGoogleApiKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    hasAdminPassword: Boolean(process.env.COFI_ADMIN_SYNC_PASSWORD),
  };
}
