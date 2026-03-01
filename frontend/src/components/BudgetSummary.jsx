'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function BudgetSummary({ budgets, transactions }) {
  const stats = useMemo(() => {
    const expenseByCategory = new Map();
    for (const transaction of transactions) {
      if (transaction.type !== 'expense') continue;
      const key = transaction.category || 'Other';
      expenseByCategory.set(key, (expenseByCategory.get(key) || 0) + Number(transaction.amount || 0));
    }

    const budgetStatus = budgets.map((budget) => {
      const spent = expenseByCategory.get(budget.category) || 0;

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;

      return {
        ...budget,
        spent,
        remaining,
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good',
      };
    });

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const averageUsage = budgets.length > 0
      ? budgetStatus.reduce((sum, b) => sum + b.percentage, 0) / budgets.length
      : 0;

    const overBudgetCount = budgetStatus.filter((b) => b.status === 'over').length;
    const warningCount = budgetStatus.filter((b) => b.status === 'warning').length;
    const goodCount = budgetStatus.filter((b) => b.status === 'good').length;

    return {
      totalBudgeted,
      totalSpent,
      totalRemaining,
      averageUsage,
      overBudgetCount,
      warningCount,
      goodCount,
      budgetStatus,
    };
  }, [budgets, transactions]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [],
  );

  const formatCurrency = (amount) => currencyFormatter.format(amount);

  const topOverBudgets = useMemo(
    () =>
      stats.budgetStatus
        .filter((b) => b.status === 'over')
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3),
    [stats.budgetStatus],
  );

  const topWarningBudgets = useMemo(
    () =>
      stats.budgetStatus
        .filter((b) => b.status === 'warning')
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3),
    [stats.budgetStatus],
  );

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="sr-only">Budget Summary</h2>
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-[#fff3c4]">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">Total Budgeted</p>
              <p className="text-lg sm:text-xl font-bold text-[#5c3ea5]">
                {formatCurrency(stats.totalBudgeted)}
              </p>
              <p className="text-xs text-slate-500">
                {budgets.length} budget{budgets.length !== 1 ? 's' : ''} set
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffe1db]">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">Total Spent</p>
              <p className="text-lg sm:text-xl font-bold text-[#c2412d]">
                {formatCurrency(stats.totalSpent)}
              </p>
              <p className="text-xs text-slate-500">
                {((stats.totalSpent / stats.totalBudgeted) * 100 || 0).toFixed(1)}% of budget
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#dcf6e6]">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">Remaining</p>
              <p
                className={`text-lg sm:text-xl font-bold ${stats.totalRemaining >= 0 ? 'text-[#1f6b44]' : 'text-[#c2412d]'}`}
              >
                {formatCurrency(Math.abs(stats.totalRemaining))}
              </p>
              <p className="text-xs text-slate-500">
                {stats.totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#efe5ff]">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">Avg Usage</p>
              <p className="text-lg sm:text-xl font-bold text-[#5c3ea5]">
                {stats.averageUsage.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">
                Across all budgets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-[#dcf6e6] hover:bg-[#c8efd9] transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#1f6b44] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">Good</p>
                <p className="text-2xl font-bold text-[#1f6b44]">{stats.goodCount}</p>
                <p className="text-xs text-slate-500">Under 80% of budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#fff3c4] hover:bg-[#ffe9a4] transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#8a6a00] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">Warning</p>
                <p className="text-2xl font-bold text-[#8a6a00]">{stats.warningCount}</p>
                <p className="text-xs text-slate-500">80-100% of budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffe1db] hover:bg-[#ffd1c7] transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#c2412d] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">Over</p>
                <p className="text-2xl font-bold text-[#c2412d]">{stats.overBudgetCount}</p>
                <p className="text-xs text-slate-500">Exceeded budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Alerts */}
      {(topOverBudgets.length > 0 || topWarningBudgets.length > 0) && (
        <Card className="bg-white">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#8a6a00]" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Budget Alerts</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {topOverBudgets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#c2412d]">Over Budget</h4>
                  <div className="space-y-1.5">
                    {topOverBudgets.map((budget) => (
                      <div key={budget.id} className="flex items-center justify-between gap-2 text-xs sm:text-sm p-2 bg-[#ffe1db] rounded-lg border border-black/10">
                        <span className="text-slate-700 truncate">{budget.category}</span>
                        <span className="text-[#c2412d] font-medium whitespace-nowrap">
                          +{formatCurrency(Math.abs(budget.remaining))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {topWarningBudgets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#8a6a00]">Approaching Limit</h4>
                  <div className="space-y-1.5">
                    {topWarningBudgets.map((budget) => (
                      <div key={budget.id} className="flex items-center justify-between gap-2 text-xs sm:text-sm p-2 bg-[#fff3c4] rounded-lg border border-black/10">
                        <span className="text-slate-700 truncate">{budget.category}</span>
                        <span className="text-[#8a6a00] font-medium whitespace-nowrap">
                          {budget.percentage.toFixed(1)}% used
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
