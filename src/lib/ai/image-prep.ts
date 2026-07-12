/** Client-side image prep for flyer extraction (max long edge). */
export async function fileToDownscaledBlob(
  file: File,
  maxEdge = 1568
): Promise<{ blob: Blob; mime: string; previewUrl: string }> {
  const previewUrl = URL.createObjectURL(file);
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { blob: file, mime: file.type || "image/jpeg", previewUrl };
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
        mime,
        0.85
      );
    });
    return { blob, mime, previewUrl };
  } catch {
    return { blob: file, mime: file.type || "image/jpeg", previewUrl };
  }
}
