"use client";

import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AppSelect from "@/components/ui/react-select";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { Plus, IndianRupee, Receipt } from "lucide-react";

export default function TransactionForm({ onSubmit, salaryAmount = 0, remainingSalary = 0 }) {
  const defaultValues = {
    type: "expense",
    name: "",
    description: "",
    amount: "",
    category: "",
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  const canCreateTransaction = salaryAmount > 0;

  const onFormSubmit = async (values) => {
    const parsedAmount = parseFloat(values.amount);

    await onSubmit({
      ...values,
      type: "expense",
      name: values.name.trim(),
      description: values.description?.trim() || "",
      amount: parsedAmount,
    });

    reset(defaultValues);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="sr-only">Add Transaction</h2>
      <Card className="sm:sticky sm:top-28">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 sm:p-2.5 bg-[#151513] rounded-xl shadow-[0_4px_0_rgba(21,21,19,0.2)]">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg text-slate-900">Add Expense</CardTitle>
              <p className="text-xs text-slate-600 font-normal">
                Every transaction deducts from your main balance
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!canCreateTransaction && (
            <div className="mb-4 rounded-xl bg-[#ffe1db] px-4 py-3">
              <p className="text-xs text-[#c2412d]">
                Set your monthly amount from the budget tab before adding transactions.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-slate-900">
                Name *
              </Label>
              <input
                id="name"
                {...register("name", {
                  required: "Name is required",
                  validate: (value) => value.trim().length > 0 || "Name is required",
                })}
                placeholder="e.g., Uber Ride"
                className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
              />
              {errors.name && <p className="text-xs text-[#c2412d]">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-900"
                >
                  <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                  Amount *
                </Label>
                <input
                  id="amount"
                  type="number"
                  {...register("amount", {
                    required: "Amount is required",
                    validate: (value) =>
                      (parseFloat(value) > 0 && Number.isFinite(parseFloat(value))) ||
                      "Amount must be greater than 0",
                  })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
                />
                {errors.amount && <p className="text-xs text-[#c2412d]">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-slate-900">
                  Category *
                </Label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <AppSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select category"
                      options={TRANSACTION_CATEGORIES.expense}
                    />
                  )}
                />
                {errors.category && <p className="text-xs text-[#c2412d]">{errors.category.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs sm:text-sm font-medium text-slate-900"
              >
                Description
              </Label>
              <input
                id="description"
                {...register("description")}
                placeholder="Optional subtext"
                className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#ff5f34] hover:bg-[#f2512b] text-white font-medium transition-colors duration-150 text-sm cursor-pointer"
              disabled={isSubmitting || !canCreateTransaction}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
