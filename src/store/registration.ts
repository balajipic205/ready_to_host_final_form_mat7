import { create } from "zustand";
import type { Step1, Step2, Step3, Step5 } from "@/lib/validation";

export type PhotoState = {
  url?: string; // public/signed url for preview
  storagePath?: string; // raw path in bucket
  sizeKb?: number;
};

export type RegState = {
  step1?: Step1;
  step2?: Step2;
  step3?: Step3;
  step4?: { photos: PhotoState[] }; // index = member_order - 1
  step5?: Step5 & { payment_screenshot_url?: string; payment_screenshot_path?: string };
  lastCompletedStep: number; // 0..6
  setStep1: (v: Step1) => void;
  setStep2: (v: Step2) => void;
  setStep3: (v: Step3) => void;
  setStep4: (v: { photos: PhotoState[] }) => void;
  setStep5: (v: RegState["step5"]) => void;
  setLastCompleted: (n: number) => void;
  hydrate: (data: Partial<RegState>) => void;
  reset: () => void;
};

export const useReg = create<RegState>((set) => ({
  lastCompletedStep: 0,
  setStep1: (v) => set({ step1: v }),
  setStep2: (v) => set({ step2: v }),
  setStep3: (v) => set({ step3: v }),
  setStep4: (v) => set({ step4: v }),
  setStep5: (v) => set({ step5: v }),
  setLastCompleted: (n) => set((s) => ({ lastCompletedStep: Math.max(s.lastCompletedStep, n) })),
  hydrate: (data) => set((s) => ({ ...s, ...data })),
  reset: () =>
    set({
      step1: undefined,
      step2: undefined,
      step3: undefined,
      step4: undefined,
      step5: undefined,
      lastCompletedStep: 0,
    }),
}));
