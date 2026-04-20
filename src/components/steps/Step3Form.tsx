import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step3Schema, type Step3 } from "@/lib/validation";
import { Field } from "@/routes/login";
import { clean } from "@/lib/sanitize";
import { NextBar } from "./Step1Form";

export function Step3Form({
  isSvce,
  defaultValues,
  onNext,
  onBack,
}: {
  isSvce: boolean;
  defaultValues?: Partial<Step3>;
  onNext: (v: Step3) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3>({
    resolver: zodResolver(step3Schema),
    defaultValues,
  });

  const submit = handleSubmit((v) =>
    onNext({
      mentor_name: clean(v.mentor_name),
      mentor_department: clean(v.mentor_department),
      mentor_designation: clean(v.mentor_designation),
      mentor_phone: clean(v.mentor_phone),
      mentor_email: clean(v.mentor_email).toLowerCase(),
    }),
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono-ui text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Team status: {isSvce ? "SVCE" : "Non-SVCE"}
      </div>
      <Field label="Mentor name" error={errors.mentor_name?.message}>
        <input className="input" placeholder="Enter mentor full name" {...register("mentor_name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mentor department" error={errors.mentor_department?.message}>
          <input className="input" placeholder="ECE / CSE / IT" {...register("mentor_department")} />
        </Field>
        <Field label="Mentor designation" error={errors.mentor_designation?.message}>
          <input className="input" placeholder="Professor / Assistant Professor" {...register("mentor_designation")} />
        </Field>
        <Field label="Mentor phone" error={errors.mentor_phone?.message}>
          <input
            className="input"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            {...register("mentor_phone")}
          />
        </Field>
        <Field label="Mentor email" error={errors.mentor_email?.message}>
          <input type="email" className="input" placeholder={isSvce ? "mentor@svce.ac.in" : "mentor@gmail.com"} {...register("mentor_email")} />
        </Field>
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
