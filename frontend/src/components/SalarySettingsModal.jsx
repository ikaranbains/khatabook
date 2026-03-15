"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function SalarySettingsModal({
  open,
  onOpenChange,
  salaryAmount,
  onSave,
  isSaving,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SalarySettingsForm
          salaryAmount={salaryAmount}
          onOpenChange={onOpenChange}
          onSave={onSave}
          isSaving={isSaving}
        />
      ) : null}
    </AlertDialog>
  );
}

function SalarySettingsForm({ salaryAmount, onOpenChange, onSave, isSaving }) {
  const [value, setValue] = useState(String(salaryAmount || ""));
  const [error, setError] = useState("");

  const handleSave = async () => {
    const nextValue = value.trim() === "" ? 0 : Number(value);

    if (!Number.isFinite(nextValue) || nextValue < 0) {
      setError("Amount must be 0 or greater.");
      return;
    }

    setError("");
    await onSave({ salaryAmount: nextValue });
    onOpenChange(false);
  };

  return (
    <AlertDialogContent className="max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border-2 border-black/10 bg-[#f7f1e6] p-0 shadow-[0_8px_0_rgba(21,21,19,0.08),0_22px_40px_rgba(21,21,19,0.15)] sm:max-w-md">
      <AlertDialogHeader className="border-b border-black/10 px-4 py-4 sm:px-6 sm:py-5 text-left">
        <AlertDialogTitle className="font-display text-lg sm:text-xl text-slate-900">
          Money Settings
        </AlertDialogTitle>
        <AlertDialogDescription className="text-xs sm:text-sm text-slate-600">
          Set the fixed monthly amount that budgets and transactions should deduct from.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
        <label htmlFor="salaryAmount" className="block text-sm font-medium text-slate-900">
          Monthly Amount
        </label>
        <input
          id="salaryAmount"
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. 50000"
          className="h-11 w-full rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
        />
        <p className="text-xs text-slate-600">
          Leave it empty or set `0` if you want to clear the amount.
        </p>
        {error && <p className="text-xs text-[#c2412d]">{error}</p>}
      </div>

      <AlertDialogFooter className="px-4 py-3 sm:px-6 sm:py-4">
        <AlertDialogCancel
          disabled={isSaving}
          className="w-full border-black/10 bg-white text-slate-700 hover:bg-[#f1eee6] sm:w-auto"
        >
          Cancel
        </AlertDialogCancel>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#151513] text-white hover:bg-[#2b2b27] sm:w-auto"
        >
          {isSaving ? "Saving..." : "Save Amount"}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
