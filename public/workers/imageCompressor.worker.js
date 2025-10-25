/**
 * Web Worker for image compression
 * Runs in background thread to prevent UI lag
 */

self.onmessage = async (e) => {
  const { dataUrl, options } = e.data;

  try {
    // Create image from data URL
    const img = await createImageBitmap(
      await fetch(dataUrl).then((r) => r.blob()),
    );

    // Calculate new dimensions
    let { width, height } = img;
    const aspectRatio = width / height;

    if (width > options.maxWidth) {
      width = options.maxWidth;
      height = width / aspectRatio;
    }

    if (height > options.maxHeight) {
      height = options.maxHeight;
      width = height * aspectRatio;
    }

    // Use OffscreenCanvas for better performance
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", {
      alpha: options.outputFormat === "image/png",
      desynchronized: true,
    });

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // High-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob with compression
    const blob = await canvas.convertToBlob({
      type: options.outputFormat,
      quality: options.quality,
    });

    // Convert blob to data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      self.postMessage({
        success: true,
        dataUrl: reader.result,
        size: blob.size,
      });
    };
    reader.onerror = () => {
      self.postMessage({
        success: false,
        error: "Failed to convert blob to data URL",
      });
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message || "Compression failed",
    });
  }
};
