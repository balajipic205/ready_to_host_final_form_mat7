import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { compressPhoto, cropToBlob, fileToDataUrl } from "@/lib/image";
import { X, Check } from "lucide-react";

export function PhotoCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (compressed: File, sizeKb: number) => void;
}) {
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPx, setAreaPx] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fileToDataUrl(file).then(setSrc);
  }, [file]);

  const onCropComplete = useCallback((_: Area, px: Area) => {
    setAreaPx(px);
  }, []);

  const confirm = async () => {
    if (!areaPx || !src) return;
    setBusy(true);
    setErr(null);
    try {
      const blob = await cropToBlob(src, areaPx);
      const compressed = await compressPhoto(blob);
      const kb = Math.round(compressed.size / 1024);
      if (kb > 1024) {
        setErr(`Photo is ${kb} KB — exceeds the 1 MB limit. Try cropping tighter or use a smaller source image.`);
        setBusy(false);
        return;
      }
      onConfirm(compressed, kb);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur p-4">
      <div className="w-full max-w-lg panel rounded-2xl p-4 corner-frame">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Crop photo (1:1, 400×400)</h3>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative w-full aspect-square bg-surface-2 rounded-md overflow-hidden">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div className="mt-3">
          <label className="block text-xs font-mono-ui text-muted-foreground mb-1">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        {err && (
          <div className="mt-3 text-xs text-destructive font-mono-ui">{err}</div>
        )}
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy || !areaPx}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> {busy ? "Compressing..." : "Confirm crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
