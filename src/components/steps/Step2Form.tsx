import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step2Schema, type Step2, DEPARTMENTS } from "@/lib/validation";
import { Field } from "@/routes/login";
import { clean } from "@/lib/sanitize";
import { Crown } from "lucide-react";
import { NextBar } from "./Step1Form";
import { useEffect } from "react";

export function Step2Form({
  teamSize,
  isSvce,
  defaultValues,
  onNext,
  onBack,
}: {
  teamSize: number;
  isSvce: boolean;
  defaultValues?: Partial<Step2>;
  onNext: (v: Step2) => void;
  onBack: () => void;
}) {
  const blank = {
    full_name: "",
    department: "" as any,
    department_other: "",
    year_of_study: "" as any,
    registration_number: "",
    phone_number: "",
    whatsapp_number: "",
    college_email: "",
    personal_email: "",
  };
  const initial =
    defaultValues?.members && defaultValues.members.length === teamSize
      ? defaultValues.members
      : Array.from({ length: teamSize }, () => ({ ...blank }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { members: initial },
  });

  const { fields } = useFieldArray({ control, name: "members" });

  // adjust array if teamSize changes
  useEffect(() => {
    const cur = watch("members");
    if (cur.length !== teamSize) {
      const next = Array.from({ length: teamSize }, (_, i) => cur[i] || { ...blank });
      setValue("members", next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSize]);

  const submit = handleSubmit((v) => {
    onNext({
      members: v.members.map((m) => ({
        ...m,
        full_name: clean(m.full_name),
        department: m.department === "Other" ? clean(m.department_other || "Other") : m.department,
        department_other: "",
        registration_number: clean((m.registration_number || "").toUpperCase()),
        phone_number: clean(m.phone_number),
        whatsapp_number: clean(m.whatsapp_number),
        college_email: clean(m.college_email).toLowerCase(),
        personal_email: clean(m.personal_email).toLowerCase(),
      })),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      {fields.map((f, idx) => {
        const memberErrs = errors.members?.[idx];
        const dept = watch(`members.${idx}.department`);
        return (
          <div key={f.id} className="panel rounded-xl p-4 sm:p-5 corner-frame">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {idx === 0 && <Crown className="h-4 w-4 text-amber" />}
                <span className="font-display font-semibold">
                  {idx === 0 ? "Team Leader" : `Member ${idx + 1}`}
                </span>
              </div>
              <span className="font-mono-ui text-[10px] text-muted-foreground">
                #{idx + 1}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" error={memberErrs?.full_name?.message}>
                <input className="input" placeholder="Enter full name" {...register(`members.${idx}.full_name`)} />
              </Field>
              <Field label="Department" error={memberErrs?.department?.message}>
                <select className="input" defaultValue="" {...register(`members.${idx}.department`)}>
                  <option value="" disabled>Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>
              {dept === "Other" && (
                <Field label="Please specify" error={memberErrs?.department_other?.message}>
                  <input className="input" placeholder="Enter department name" {...register(`members.${idx}.department_other`)} />
                </Field>
              )}
              <Field label="Year of study" error={memberErrs?.year_of_study?.message}>
                <select className="input" defaultValue="" {...register(`members.${idx}.year_of_study`)}>
                  <option value="" disabled>Select year</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th">4th</option>
                </select>
              </Field>
              <Field label="Registration number (optional)" error={memberErrs?.registration_number?.message}>
                <input
                  className="input uppercase"
                  style={{ textTransform: "uppercase" }}
                  placeholder="For example: 23BEC001"
                  {...register(`members.${idx}.registration_number`)}
                />
              </Field>
              <Field label="Phone number" error={memberErrs?.phone_number?.message}>
                <input
                  className="input"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  {...register(`members.${idx}.phone_number`)}
                />
              </Field>
              <Field label="WhatsApp number" error={memberErrs?.whatsapp_number?.message}>
                <input
                  className="input"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  {...register(`members.${idx}.whatsapp_number`)}
                />
              </Field>
              <Field
                label="College email"
                error={memberErrs?.college_email?.message}
                hint={isSvce ? "must end with @svce.ac.in" : undefined}
              >
                <input
                  type="email"
                  className="input"
                  placeholder={isSvce ? "name@svce.ac.in" : "name@college.edu"}
                  {...register(`members.${idx}.college_email`, {
                    validate: (v) =>
                      !isSvce || v.toLowerCase().endsWith("@svce.ac.in") || "Must be an @svce.ac.in email",
                  })}
                />
              </Field>
              <Field label="Personal email" error={memberErrs?.personal_email?.message}>
                <input
                  type="email"
                  className="input"
                  placeholder="xxxx@gmail.com"
                  {...register(`members.${idx}.personal_email`)}
                />
              </Field>
            </div>
          </div>
        );
      })}

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
