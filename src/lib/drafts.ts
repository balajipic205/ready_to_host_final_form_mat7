import { supabase } from "@/lib/supabase";
import type { RegState } from "@/store/registration";

export type DraftPayload = {
  step1?: RegState["step1"];
  step2?: RegState["step2"];
  step3?: RegState["step3"];
  step4?: RegState["step4"];
  step5?: RegState["step5"];
  last_completed_step: number;
};

export async function saveDraft(userId: string, payload: DraftPayload) {
  const { error } = await supabase
    .from("draft_registrations")
    .upsert(
      {
        user_id: userId,
        step1: payload.step1 ?? null,
        step2: payload.step2 ?? null,
        step3: payload.step3 ?? null,
        step4: payload.step4 ?? null,
        step5: payload.step5 ?? null,
        last_completed_step: payload.last_completed_step,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function loadDraft(userId: string) {
  const { data, error } = await supabase
    .from("draft_registrations")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
