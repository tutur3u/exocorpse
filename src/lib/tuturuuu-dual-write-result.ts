export type DualWriteResult =
  | {
      applied: true;
      manifestDigest: string;
      reason: string;
    }
  | {
      applied: false;
      reason: string;
      skipped: string;
    };

type DualWriteOperation = (reason: string) => Promise<DualWriteResult>;

export async function runDualWriteSafely(
  reason: string,
  operation: DualWriteOperation,
): Promise<DualWriteResult> {
  try {
    return await operation(reason);
  } catch (error) {
    const skipped =
      error instanceof Error
        ? error.message
        : "Exocorpse CMS dual-write failed unexpectedly.";

    console.error("Exocorpse CMS dual-write failed after local mutation", {
      error,
      reason,
    });

    return {
      applied: false,
      reason,
      skipped,
    };
  }
}
