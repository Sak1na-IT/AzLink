/*
 * Şəkli yükləməzdən əvvəl brauzerdə kiçildir: uzun tərəf ən çox
 * 1400px, JPEG keyfiyyəti 82%. Telefonla çəkilmiş 5–10 MB-lıq şəkil
 * təxminən 200–400 KB-a düşür: səhifələr tez açılır, baza böyümür.
 */
export const compressImage = (
  file: File,
  maxSide = 1400,
  quality = 0.82
): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("CANVAS_UNAVAILABLE"));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_UNREADABLE"));
    };

    image.src = url;
  });
