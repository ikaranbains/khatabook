"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingDown,
  PiggyBank,
  Target,
  Wallet,
  ChartBar,
} from "lucide-react";
import useIsMobile from "@/lib/useIsMobile";

const BudgetChart = dynamic(() => import("./BudgetChart"), {
  loading: () => <Skeleton className="h-64 sm:h-80 lg:h-96 w-full rounded-2xl" />,
  ssr: false,
});

export default function Dashboard({ transactions, budgets, salaryAmount = 0 }) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const useLightAnimations = isMobile || prefersReducedMotion;

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

  const stats = useMemo(() => {
    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const remainingSalary = salaryAmount - expenses;
    const unallocatedSalary = salaryAmount - totalBudgeted;
    const usageRate = salaryAmount > 0 ? (expenses / salaryAmount) * 100 : 0;

    return {
      expenses,
      totalBudgeted,
      remainingSalary,
      unallocatedSalary,
      usageRate,
    };
  }, [budgets, salaryAmount, transactions]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [transactions],
  );

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

        return {
          ...budget,
          spent,
          percentage,
          status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
        };
      }),
    [budgets, expenseByCategory],
  );

  const statCards = [
    {
      title: "Budget Allocated",
      value: formatCurrency(stats.totalBudgeted),
      caption:
        salaryAmount > 0
          ? `${Math.max(0, (stats.totalBudgeted / salaryAmount) * 100).toFixed(1)}% of funds`
          : `${budgets.length} budget${budgets.length !== 1 ? "s" : ""} set`,
      icon: Target,
      cardClass: "bg-[#fff3c4]",
      iconClass: "bg-[#fccc42] text-[#1f1a10]",
      valueClass: "text-[#8a6a00]",
    },
    {
      title: "Expenses Logged",
      value: formatCurrency(stats.expenses),
      caption:
        salaryAmount > 0
          ? `${stats.usageRate.toFixed(1)}% of funds used`
          : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`,
      icon: TrendingDown,
      cardClass: "bg-[#ffe1db]",
      iconClass: "bg-[#ff5f34] text-white",
      valueClass: "text-[#c2412d]",
    },
    {
      title: "Budget Headroom",
      value: formatCurrency(Math.abs(stats.remainingSalary)),
      caption: stats.remainingSalary >= 0 ? "Room left after expenses" : "Expenses exceeded plan",
      icon: PiggyBank,
      cardClass: "bg-[#efe5ff]",
      iconClass: "bg-[#be94f5] text-white",
      valueClass: stats.remainingSalary >= 0 ? "text-[#5c3ea5]" : "text-[#c2412d]",
    },
  ];

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: useLightAnimations ? 0.1 : 0.3 }}
    >
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900">
          Dashboard
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Track your balance, expenses, and budget coverage in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: useLightAnimations ? 0 : index * 0.05,
              duration: useLightAnimations ? 0.1 : 0.2,
            }}
          >
            <Card className={`h-full ${stat.cardClass}`}>
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${stat.iconClass}`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">{stat.title}</p>
                  <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${stat.valueClass}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-600">{stat.caption}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <BudgetChart transactions={transactions} budgets={budgets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: useLightAnimations ? 0 : 0.15, duration: useLightAnimations ? 0.1 : 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Recent Transactions
                </h3>
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <ChartBar className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-2 sm:mb-3 opacity-70" />
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    No transactions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-[#f7f1e6] hover:bg-[#fff3c4] transition-colors duration-150 gap-2"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0 bg-[#ff5f34]" />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-md font-medium text-slate-900 truncate">
                            {transaction.name[0].toUpperCase() + transaction.name.slice(1) ||
                              "Unnamed transaction"}
                          </p>
                          <p className="text-xs text-slate-600 truncate">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm sm:text-[16px] font-semibold text-[#c2412d]">
                          -{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: useLightAnimations ? 0 : 0.2, duration: useLightAnimations ? 0.1 : 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Budget Status
                </h3>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
              </div>
            </CardHeader>
            <CardContent>
              {budgetStatus.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Target className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-2 sm:mb-3 opacity-70" />
                  <p className="text-sm sm:text-base text-slate-600 font-medium">
                    No budgets set yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {budgetStatus.map((budget) => (
                    <div key={budget.id} className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {budget.category}
                        </span>
                        <span className="text-xs text-slate-600 shrink-0">
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={Math.min(budget.percentage, 100)} className="h-1.5 sm:h-2" />
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{formatCurrency(budget.spent)} spent</span>
                        <span className="hidden sm:inline">{formatCurrency(budget.amount)} budget</span>
                        <span className="sm:hidden">{formatCurrency(budget.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
