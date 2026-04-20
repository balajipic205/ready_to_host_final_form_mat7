import imageCompression from "browser-image-compression";

// Sniff actual MIME from magic bytes (defense-in-depth vs extension spoofing)
export async function detectMime(file: File): Promise<string | null> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const b = new Uint8Array(buf);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  return null;
}

export function randomFilename(ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}.${ext}`;
}

// Crop helper: produces a 400x400 JPEG blob from source image + crop rect
export async function cropToBlob(
  imageSrc: string,
  cropPx: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, 400, 400);
  return await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
  );
}

// Compress to ~400-950KB target
export async function compressPhoto(blob: Blob): Promise<File> {
  const file = new File([blob], "crop.jpg", { type: "image/jpeg" });
  const out = await imageCompression(file, {
    maxSizeMB: 0.9,
    maxWidthOrHeight: 900,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.88,
  });
  return out;
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export async function getImageDimensions(file: File): Promise<{ w: number; h: number }> {
  const url = await fileToDataUrl(file);
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
    i.onerror = rej;
    i.src = url;
  });
}
