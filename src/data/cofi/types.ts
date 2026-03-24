export type CofiImageAsset = {
  remoteUrl: string;
  localPath: string;
  filename: string;
  extension: string;
  contentType: string | null;
  bytes: number;
};

export type CofiSample = {
  id: string;
  index: number;
  artistName: string;
  artistSlug: string;
  boothType: string;
  boothLocation: string;
  joiningDate: string;
  originalImageUrl: string;
  thumbnailUrl: string;
  image: {
    original: CofiImageAsset;
    thumbnail: CofiImageAsset;
  };
};

export type CofiDataset = {
  fetchedAt: string;
  source: {
    endpoint: string;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  stats: {
    totalSamples: number;
    uniqueSampleIds: number;
    uniqueArtists: number;
    uniqueBooths: number;
    boothTypeCounts: Record<string, number>;
    joiningDateCounts: Record<string, number>;
    artistsWithMultipleSamples: number;
    duplicateRecords: number;
    totalStoredAssets: number;
    uniqueOriginalImages: number;
    uniqueThumbnailImages: number;
  };
  samples: CofiSample[];
};
