import { useState, useRef } from "react";
import type { Member } from "@/lib/validation";
import type { PhotoState } from "@/store/registration";
import { detectMime, getImageDimensions, randomFilename } from "@/lib/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { PhotoCropper } from "@/components/PhotoCropper";
import { NextBar } from "./Step1Form";
import { Camera, Upload, RotateCw, Check } from "lucide-react";

export function Step4Photos({
  members,
  initial,
  onNext,
  onBack,
}: {
  members: Member[];
  initial?: PhotoState[];
  onNext: (photos: PhotoState[]) => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoState[]>(
    initial && initial.length === members.length ? initial : Array(members.length).fill({}),
  );
  const [active, setActive] = useState(0);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showFinalGrid, setShowFinalGrid] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const allUploaded = photos.every((p) => p.url);

  const handleFile = async (f: File) => {
    setError(null);
    if (f.size > 5 * 1024 * 1024) {
      setError("Source file too large. Max 5 MB before crop. Final photo must stay under 1 MB.");
      return;
    }
    const mime = await detectMime(f);
    if (mime !== "image/jpeg" && mime !== "image/png") {
      setError("Invalid file. JPG or PNG only.");
      return;
    }
    const dims = await getImageDimensions(f);
    if (dims.w < 200 || dims.h < 200) {
      setError("Image too small. Minimum 200×200 pixels.");
      return;
    }
    setPendingFile(f);
  };

  const handleConfirmCrop = async (compressed: File, sizeKb: number) => {
    setPendingFile(null);
    setUploading(true);
    setError(null);
    try {
      if (!user) throw new Error("Not authenticated");
      const path = `${user.id}/${randomFilename("jpg")}`;
      const { error: upErr } = await supabase.storage
        .from("member-photos")
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage
        .from("member-photos")
        .createSignedUrl(path, 60 * 60 * 4);
      const next = [...photos];
      next[active] = { url: signed?.signedUrl, storagePath: path, sizeKb };
      setPhotos(next);
      // auto-advance to next member or to final grid
      if (active < members.length - 1) {
        setActive(active + 1);
      } else {
        setShowFinalGrid(true);
      }
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const totalKb = photos.reduce((s, p) => s + (p.sizeKb || 0), 0);

  if (showFinalGrid) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-display text-lg">Confirm photo-to-member mapping</h3>
          <p className="text-sm text-muted-foreground mt-1">
            These photos will be used throughout the hackathon, including on your ID cards.
            Verify each face matches the member name below it.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.map((m, i) => (
            <div key={i} className="panel rounded-lg overflow-hidden corner-frame">
              <div className="aspect-square bg-surface-2">
                {photos[i]?.url ? (
                  <img src={photos[i].url} alt={m.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                    No photo
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="text-xs font-mono-ui text-muted-foreground">M{i + 1}</div>
                <div className="text-sm font-medium truncate">{m.full_name}</div>
                <button
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setShowFinalGrid(false);
                  }}
                  className="mt-1 text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <RotateCw className="h-3 w-3" /> Re-upload
                </button>
              </div>
            </div>
          ))}
        </div>
          <div className="text-xs font-mono-ui text-muted-foreground">
           Target per photo: 400-950 KB · Hard limit: 1 MB · Total for your team: ~{(totalKb / 1024).toFixed(2)} MB
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-border px-4 py-2.5 hover:bg-surface-2 min-h-[44px]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => onNext(photos)}
            disabled={!allUploaded}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-display font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 min-h-[44px]"
          >
            <Check className="h-4 w-4" /> Confirm & continue
          </button>
        </div>
      </div>
    );
  }

  const m = members[active];
  const photo = photos[active];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Upload one passport-style photo per member. Crop, then upload the next member.
      </p>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {members.map((mm, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`flex-shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-mono-ui ${
              i === active
                ? "border-primary bg-primary/15"
                : photos[i]?.url
                  ? "border-success/60 bg-success/10 text-success"
                  : "border-border"
            }`}
          >
            M{i + 1} {photos[i]?.url && "✓"}
          </button>
        ))}
      </div>

      <div className="panel rounded-xl p-5 corner-frame text-center">
        <div className="font-mono-ui text-xs text-muted-foreground">
          Member {active + 1} of {members.length}
        </div>
        <div className="font-display text-xl mt-1">{m.full_name}</div>

        <div className="mx-auto mt-4 w-40 h-40 sm:w-48 sm:h-48 rounded-md overflow-hidden border border-border bg-surface-2 flex items-center justify-center">
          {photo?.url ? (
            <img src={photo.url} alt={m.full_name} className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        {photo?.sizeKb && (
          <div className="mt-2 text-xs font-mono-ui text-muted-foreground">
            Uploaded: {photo.sizeKb} KB
            {photo.sizeKb > 1024 && (
              <span className="text-amber"> · over 1 MB limit</span>
            )}
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="mt-4 flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {photo?.url ? "Re-upload" : "Upload photo"}
          </button>
          {photo?.url && active < members.length - 1 && (
            <button
              type="button"
              onClick={() => setActive(active + 1)}
              className="rounded-md border border-border px-4 py-2 hover:bg-surface-2"
            >
              Skip → next
            </button>
          )}
          {photo?.url && active === members.length - 1 && (
            <button
              type="button"
              onClick={() => setShowFinalGrid(true)}
              className="rounded-md border border-amber/60 bg-amber/10 px-4 py-2 text-amber"
            >
              Review all
            </button>
          )}
        </div>

        {error && <div className="mt-3 text-sm text-destructive font-mono-ui">{error}</div>}
        {uploading && (
          <div className="mt-3 text-sm font-mono-ui text-primary">Uploading...</div>
        )}
      </div>

      <div className="text-xs font-mono-ui text-muted-foreground space-y-1">
        <div>Format: JPG / PNG · Max 5 MB pre-crop · Min 200×200 pixels</div>
        <div>Target size: <span className="text-foreground">400-950 KB</span> after crop · Photos under 1 MB are accepted · Photos are private to you and the organizers.</div>
        <div>Total uploaded for your team: {(totalKb / 1024).toFixed(2)} MB</div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2.5 hover:bg-surface-2 min-h-[44px]"
        >
          Back
        </button>
        {allUploaded && (
          <button
            type="button"
            onClick={() => setShowFinalGrid(true)}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-display font-semibold text-primary-foreground hover:opacity-90 min-h-[44px]"
          >
            Review all photos
          </button>
        )}
      </div>

      {pendingFile && (
        <PhotoCropper
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleConfirmCrop}
        />
      )}
    </div>
  );
}
