import StorageAnalytics from "@/components/admin/StorageAnalytics";
import {
  getAllArtPiecesAdmin,
  getAllGamePiecesAdmin,
  getAllWritingPiecesAdmin,
} from "@/lib/actions/portfolio";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  // Fetch initial data
  const [artPieces, writingPieces, gamePieces] = await Promise.all([
    getAllArtPiecesAdmin(),
    getAllWritingPiecesAdmin(),
    getAllGamePiecesAdmin(),
  ]);

  return (
    <div className="min-h-screen space-y-4 bg-gray-50 dark:bg-gray-900">
      <StorageAnalytics />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your art, writing, and game portfolio pieces
          </p>
        </div>

        <PortfolioClient
          initialArtPieces={artPieces}
          initialWritingPieces={writingPieces}
          initialGamePieces={gamePieces}
        />
      </div>
    </div>
  );
}
