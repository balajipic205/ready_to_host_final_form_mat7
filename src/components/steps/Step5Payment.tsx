import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step5Schema, type Step5 } from "@/lib/validation";
import { Field } from "@/routes/login";
import { clean } from "@/lib/sanitize";
import { NextBar } from "./Step1Form";
import { detectMime, randomFilename } from "@/lib/image";
import { supabase, SUPABASE_URL } from "@/lib/supabase";
import { useAuth } from "@/store/auth";
import { PRICE_PER_MEMBER, PAYMENT_POCS } from "@/lib/contacts";
import { Phone, Upload, AlertTriangle } from "lucide-react";

type Saved = Step5 & { payment_screenshot_url?: string; payment_screenshot_path?: string };

export function Step5Payment({
  teamSize,
  defaultValues,
  onNext,
  onBack,
}: {
  teamSize: number;
  defaultValues?: Partial<Saved>;
  onNext: (v: Saved) => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const total = teamSize * PRICE_PER_MEMBER;
  const [ssUrl, setSsUrl] = useState<string | undefined>(defaultValues?.payment_screenshot_url);
  const [ssPath, setSsPath] = useState<string | undefined>(defaultValues?.payment_screenshot_path);
  const [ssBlobUrl, setSsBlobUrl] = useState<string | undefined>(defaultValues?.payment_screenshot_url);
  const [ssError, setSsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [qrError, setQrError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step5>({
    resolver: zodResolver(step5Schema),
    defaultValues,
  });

  // refresh signed url for already uploaded screenshot on mount
  useEffect(() => {
    (async () => {
      if (defaultValues?.payment_screenshot_path && !defaultValues.payment_screenshot_url) {
        const { data } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(defaultValues.payment_screenshot_path, 60 * 60 * 4);
        if (data?.signedUrl) {
          setSsUrl(data.signedUrl);
          setSsBlobUrl(data.signedUrl);
        }
      }
    })();
    // eslint-disable-next-line
  }, []);

  const handleFile = async (f: File) => {
    setSsError(null);
    if (f.size > 2 * 1024 * 1024) {
      setSsError(`File too large (${(f.size / 1024 / 1024).toFixed(2)} MB). Max 2 MB allowed.`);
      return;
    }
    const mime = await detectMime(f);
    if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "application/pdf") {
      setSsError("JPG, PNG or PDF only.");
      return;
    }
    setUploading(true);
    try {
      if (!user) throw new Error("Not authenticated");
      const ext = mime === "application/pdf" ? "pdf" : "jpg";
      const path = `${user.id}/${randomFilename(ext)}`;
      const { error: upErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(path, f, { contentType: mime, upsert: true });
      if (upErr) throw upErr;
      const { data } = await supabase.storage
        .from("payment-screenshots")
        .createSignedUrl(path, 60 * 60 * 4);
      setSsPath(path);
      setSsUrl(data?.signedUrl);
      setSsBlobUrl(data?.signedUrl);
    } catch (e: any) {
      setSsError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = handleSubmit((v) => {
    if (!ssPath) {
      setSsError("Please upload your payment screenshot.");
      return;
    }
    onNext({
      ...v,
      payment_transaction_id: clean(v.payment_transaction_id),
      payment_mobile_number: clean(v.payment_mobile_number),
      payment_account_holder_name: clean(v.payment_account_holder_name),
      payment_screenshot_url: ssUrl,
      payment_screenshot_path: ssPath,
    });
  });

  const qrSrc = `${SUPABASE_URL}/storage/v1/object/public/payment-qr/qr.png`;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Amount + QR */}
      <div className="panel rounded-xl p-5 corner-frame">
        <div className="font-mono-ui text-xs uppercase tracking-wider text-primary">
          Payment summary
        </div>
        <div className="mt-2 text-2xl font-display font-bold">
          ₹{PRICE_PER_MEMBER} <span className="text-muted-foreground text-base">×</span>{" "}
          {teamSize} members ={" "}
          <span className="text-amber text-glow-amber">₹{total.toLocaleString("en-IN")}</span>
        </div>

        <div className="mt-5 flex flex-col items-center">
          {qrError ? (
            <div className="w-56 h-56 rounded-md border border-dashed border-amber/60 bg-surface-2 flex items-center justify-center text-center p-3 text-xs font-mono-ui text-amber">
              QR not yet uploaded by organizers.<br />Contact a treasurer below for payment details.
            </div>
          ) : (
            <img
              src={qrSrc}
              alt="Payment QR"
              className="w-56 h-56 rounded-md border border-border bg-white object-contain"
              onError={() => setQrError(true)}
            />
          )}
          <p className="mt-3 text-sm text-muted-foreground text-center max-w-md">
            Scan this QR code to pay the registration fee. After payment, take a clear
            screenshot showing the <span className="text-foreground">Transaction ID</span>.
          </p>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {PAYMENT_POCS.map((p) => (
            <a
              key={p.phone}
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 hover:border-primary/60"
            >
              <Phone className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs font-mono-ui text-muted-foreground">
                  {p.phone} · Treasurer
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Field
          label="UPI Transaction ID (UTR number)"
          error={errors.payment_transaction_id?.message}
          hint="12-digit UPI reference number — visible on the payment confirmation"
        >
          <input
            className="input"
            inputMode="numeric"
            maxLength={12}
            placeholder="123456789012"
            {...register("payment_transaction_id")}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mobile number used for payment" error={errors.payment_mobile_number?.message}>
            <input
              className="input"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              {...register("payment_mobile_number")}
            />
          </Field>
          <Field label="GPay account holder name" error={errors.payment_account_holder_name?.message}>
            <input
              className="input"
              placeholder="e.g. Aravind Kumar"
              {...register("payment_account_holder_name")}
            />
          </Field>
        </div>

        <div>
          <span className="block text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-1">
            Payment screenshot (JPG / PNG / PDF, max 2 MB)
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-surface-2 px-4 py-2 hover:bg-primary/10 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : ssPath ? "Replace screenshot" : "Upload screenshot"}
          </button>
          {ssBlobUrl && (
            <div className="mt-3">
              <img
                src={ssBlobUrl}
                alt="Payment screenshot preview"
                className="max-h-64 rounded-md border border-border"
              />
            </div>
          )}
          {ssError && (
            <div className="mt-2 text-sm text-destructive font-mono-ui">{ssError}</div>
          )}
          <div className="mt-2 inline-flex items-start gap-1.5 text-xs text-amber font-mono-ui">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
            NOTE: upload a screenshot with the Transaction ID clearly visible. Blurred or cropped screenshots will be rejected.
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1 accent-primary" {...register("payment_amount_confirmed")} />
          <span>
            I confirm that I have paid <span className="text-amber font-semibold">₹{total.toLocaleString("en-IN")}</span> to
            the above QR code and all details entered are accurate. I understand that
            incorrect or missing payment details may delay or result in rejection of my
            team's registration.
          </span>
        </label>
        {errors.payment_amount_confirmed?.message && (
          <div className="text-xs text-destructive font-mono-ui">
            {errors.payment_amount_confirmed.message}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2.5 hover:bg-surface-2 min-h-[44px]"
        >
          Back
        </button>
        <div className="flex-1">
          <NextBar />
        </div>
      </div>
    </form>
  );
}
