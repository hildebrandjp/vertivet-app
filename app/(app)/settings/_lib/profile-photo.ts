import { DEMO_PHOTO_LIMIT } from "./settings-form";

/** Browser-session demo photos fit in a single cookie. */
export async function prepareDemoPhoto(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare the photo.");

    for (const size of [80, 64, 48]) {
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(bitmap.width, bitmap.height);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, size, size);
      context.drawImage(
        bitmap,
        (bitmap.width - side) / 2,
        (bitmap.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      );
      const photo = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.72),
      );
      if (photo && photo.size <= DEMO_PHOTO_LIMIT) {
        return new File([photo], "avatar.jpg", { type: "image/jpeg" });
      }
    }
    throw new Error("Could not prepare the photo.");
  } finally {
    bitmap.close();
  }
}
