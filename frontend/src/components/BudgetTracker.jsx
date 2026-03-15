"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Controller, useForm, useWatch } from "react-hook-form";
import AppSelect from "./ui/react-select";
import VirtualizedList from "./ui/virtualized-list";
import { BUDGET_CATEGORIES, BUDGET_PERIOD_OPTIONS } from "@/lib/constants";

export default function BudgetTracker({
  budgets,
  transactions,
  salaryAmount = 0,
  onAddBudget,
  onDeleteBudget,
}) {
  const [formError, setFormError] = useState("");
  const defaultValues = {
    category: "",
    customCategoryName: "",
    amount: "",
    period: "monthly",
  };

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  const expenseByCategory = useMemo(() => {
    const totals = new Map();
    for (const transaction of transactions) {
      if (transaction.type !== "expense") continue;
      const key = transaction.category || "Other";
      totals.set(key, (totals.get(key) || 0) + Number(transaction.amount || 0));
    }
    return totals;
  }, [transactions]);

  const budgetStatus = useMemo(
    () =>
      budgets.map((budget) => {
        const spent = expenseByCategory.get(budget.category) || 0;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        const remaining = budget.amount - spent;

        return {
          ...budget,
          spent,
          remaining,
          percentage,
          status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
        };
      }),
    [budgets, expenseByCategory],
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [],
  );

  const formatCurrency = (amount) => currencyFormatter.format(amount);
  const categoryValue = useWatch({ control, name: "category" });

  const onFormSubmit = async (values) => {
    setFormError("");

    try {
      await onAddBudget({
        ...values,
        customCategoryName: values.customCategoryName.trim(),
        amount: parseFloat(values.amount),
      });
      reset(defaultValues);
    } catch (error) {
      setFormError(error?.message || "Failed to create budget");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "over":
        return "bg-[#ff5f34]";
      case "warning":
        return "bg-[#fccc42]";
      case "good":
        return "bg-[#33c784]";
      default:
        return "bg-slate-300";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "over":
        return "text-[#c2412d]";
      case "warning":
        return "text-[#8a6a00]";
      case "good":
        return "text-[#1f6b44]";
      default:
        return "text-slate-500";
    }
  };

  const budgetRowEstimate = 220;
  const totalBudgeted = useMemo(
    () => budgets.reduce((sum, budget) => sum + budget.amount, 0),
    [budgets],
  );
  const remainingSalaryToAllocate = salaryAmount - totalBudgeted;
  const canCreateBudget = salaryAmount > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-4 sm:p-6 rounded-2xl"
      >
        <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 mb-4 sm:mb-6">
          Create Budget
        </h2>
        <div className="mb-4 rounded-xl bg-[#f7f1e6] px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-600">Monthly amount</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {salaryAmount > 0 ? formatCurrency(salaryAmount) : "Not set"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Left for budgeting</p>
              <p
                className={`mt-1 text-lg font-bold ${
                  remainingSalaryToAllocate >= 0 ? "text-[#1f6b44]" : "text-[#c2412d]"
                }`}
              >
                {salaryAmount > 0 ? formatCurrency(Math.abs(remainingSalaryToAllocate)) : "--"}
                {salaryAmount > 0 && remainingSalaryToAllocate < 0 ? " over" : ""}
              </p>
            </div>
          </div>
          {!canCreateBudget && (
            <p className="mt-1 text-xs text-[#c2412d]">
              Set your monthly amount from the header settings before creating budgets.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">
                Category *
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <AppSelect
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value !== "Other") {
                        setValue("customCategoryName", "", { shouldValidate: true });
                      }
                    }}
                    placeholder="Select category"
                    options={BUDGET_CATEGORIES.filter(
                      (category) => !budgets.some((budget) => budget.category === category),
                    )}
                  />
                )}
              />
              {errors.category && (
                <p className="mt-1 text-xs text-[#c2412d]">{errors.category.message}</p>
              )}
            </div>

            {categoryValue === "Other" && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  {...register("customCategoryName", {
                    validate: (value) =>
                      categoryValue !== "Other" ||
                      value.trim().length > 0 ||
                      "Category name is required for Other",
                  })}
                  className="h-11 w-full min-w-0 px-3 bg-white border border-black/10 rounded-[12px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20 transition placeholder:text-slate-400 text-sm"
                  placeholder="e.g. Pet Care"
                  maxLength={60}
                />
                {errors.customCategoryName && (
                  <p className="mt-1 text-xs text-[#c2412d]">
                    {errors.customCategoryName.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">
                Budget (â‚¹) *
              </label>
              <input
                type="number"
                {...register("amount", {
                  required: "Budget amount is required",
                  validate: (value) =>
                    (parseFloat(value) >= 0 && Number.isFinite(parseFloat(value))) ||
                    "Enter a valid amount",
                })}
                className="h-11 w-full min-w-0 px-3 bg-white border border-black/10 rounded-[12px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20 transition placeholder:text-slate-400 text-sm"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-[#c2412d]">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1 sm:mb-2">
                Period
              </label>
              <Controller
                name="period"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={BUDGET_PERIOD_OPTIONS.map((period) => ({
                      value: period,
                      label: period.charAt(0).toUpperCase() + period.slice(1),
                    }))}
                  />
                )}
              />
            </div>
          </div>
          {formError && <p className="text-xs text-[#c2412d]">{formError}</p>}

          <button
            type="submit"
            className="w-full md:w-auto px-4 sm:px-6 py-2 bg-[#ff5f34] text-white rounded-lg hover:bg-[#f2512b] transition-colors font-medium text-sm sm:text-base"
            disabled={isSubmitting || !canCreateBudget}
          >
            Add Budget
          </button>
        </form>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-black/10">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Budget Overview
          </h2>
        </div>

        <div className="theme-scrollbar divide-y divide-black/10">
          {budgetStatus.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-slate-600 text-sm">No budgets set yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Create your first budget to track spending
              </p>
            </div>
          ) : (
            <VirtualizedList
              items={budgetStatus}
              className="max-h-[500px] overflow-y-auto"
              estimateSize={() => budgetRowEstimate}
              renderItem={(budget) => (
                <div key={budget.id} className="p-3 sm:p-6 hover:bg-[#fff3c4] transition">
                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                        {budget.category}
                      </h3>
                      <p className="text-xs text-slate-600 capitalize mt-0.5 sm:mt-1">
                        {budget.period}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <span
                        className={`text-xs font-medium ${getStatusTextColor(budget.status)}`}
                      >
                        {budget.status === "over"
                          ? "Over"
                          : budget.status === "warning"
                            ? "Warn"
                            : "Good"}
                      </span>
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-1 text-slate-500 hover:text-[#c2412d] transition-colors shrink-0 border border-slate-300 rounded-[12px] cursor-pointer"
                        title="Delete budget"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">Spent</span>
                      <span className="font-medium text-xl text-[#c2412d]">
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>

                    <div className="w-full bg-black/10 rounded-full h-1.5 sm:h-2">
                      <div
                        className={`h-full rounded-full transition-all ${getStatusColor(budget.status)}`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">Budget</span>
                      <span className="font-medium text-xl text-[#5c3ea5]">
                        {formatCurrency(budget.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1 sm:pt-2 border-t border-black/10">
                      <span className="text-slate-600">Remaining</span>
                      <span
                        className={`font-medium ${
                          budget.remaining >= 0 ? "text-[#1f6b44]" : "text-[#c2412d]"
                        }`}
                      >
                        {formatCurrency(Math.abs(budget.remaining))}
                        {budget.remaining < 0 && " over"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>{budget.percentage.toFixed(1)}% used</span>
                      <span>
                        {budget.amount > 0 &&
                          `${(((budget.amount - budget.spent) / budget.amount) * 100).toFixed(1)}% left`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
