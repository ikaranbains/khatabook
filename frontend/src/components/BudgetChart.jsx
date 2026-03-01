'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { MONTH_LABELS } from '@/lib/constants';
import useIsMobile from '@/lib/useIsMobile';

function MonthlyBudgetTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151513] border border-black/20 rounded-xl p-3 shadow-lg">
        <p className="text-white font-medium text-sm">{payload[0]?.payload?.month}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-xs font-medium">
            {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function BudgetChart({ transactions, budgets = [] }) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const useLightAnimations = isMobile || prefersReducedMotion;

  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const data = MONTH_LABELS.map((month, index) => ({
      month,
      monthNum: index + 1,
      budget: 0,
      spending: 0,
    }));

    // Aggregate spending by month from transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      if (year === currentYear && transaction.type === 'expense') {
        data[month - 1].spending += transaction.amount;
      }
    });

    // Aggregate budgets by month
    budgets.forEach((budget) => {
      let monthlyBudgetAmount = budget.amount;
      if (budget.period === "yearly") {
        monthlyBudgetAmount = budget.amount / 12;
      } else if (budget.period === "weekly") {
        monthlyBudgetAmount = (budget.amount * 52) / 12;
      }

      for (let i = 0; i < 12; i++) {
        data[i].budget += monthlyBudgetAmount;
      }
    });

    // Return all 12 months (not just months with data)
    return data;
  }, [transactions, budgets]);

  const chartData = monthlyData;
  const currentMonthStats = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const currentMonth = chartData[currentMonthIndex] || { budget: 0, spending: 0 };
    const totalBudget = currentMonth.budget;
    const totalSpending = currentMonth.spending;

    return {
      totalBudget,
      totalSpending,
      remaining: totalBudget - totalSpending,
    };
  }, [chartData]);

  return (
    <motion.div
      initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: useLightAnimations ? 0.1 : 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Monthly Budget vs Spending
            </h3>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff5f34]" />
          </div>
        </CardHeader>
        <CardContent>
          <>
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-2xl transition-colors duration-200 hover:bg-[#fff3c4] [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:border-0 [&_.recharts-wrapper]:ring-0 [&_.recharts-surface]:outline-none [&_.recharts-surface]:border-0 [&_.recharts-surface]:ring-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: isMobile ? 8 : 20, left: 0, bottom: isMobile ? 10 : 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,19,0.15)" />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(21,21,19,0.45)"
                    tick={{ fill: 'rgba(21,21,19,0.65)', fontSize: isMobile ? 10 : 12 }}
                    axisLine={{ stroke: 'rgba(21,21,19,0.2)' }}
                    interval={isMobile ? 1 : 0}
                  />
                  <YAxis
                    stroke="rgba(21,21,19,0.45)"
                    tick={{ fill: 'rgba(21,21,19,0.65)', fontSize: isMobile ? 10 : 12 }}
                    axisLine={{ stroke: 'rgba(21,21,19,0.2)' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    width={isMobile ? 34 : 50}
                  />
                  <Tooltip content={<MonthlyBudgetTooltip />} isAnimationActive={!useLightAnimations} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: isMobile ? '8px' : '20px',
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(21,21,19,0.12)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                    }}
                    labelStyle={{
                      color: 'rgba(21,21,19,0.7)',
                      fontSize: isMobile ? '11px' : '12px',
                      margin: '0 12px 0 0',
                    }}
                    iconSize={isMobile ? 10 : 12}
                  />
                  <Bar
                    dataKey="budget"
                    fill="#5cc9ff"
                    radius={[8, 8, 0, 0]}
                    name="Budget"
                    isAnimationActive={!useLightAnimations}
                  />
                  <Bar
                    dataKey="spending"
                    fill="#ff5f34"
                    radius={[8, 8, 0, 0]}
                    name="Spending"
                    isAnimationActive={!useLightAnimations}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-black/10">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">This Month Budget</p>
                  <p className="text-sm sm:text-base font-bold text-[#1d4ed8]">
                    ₹{currentMonthStats.totalBudget.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">This Month Spending</p>
                  <p className="text-sm sm:text-base font-bold text-[#c2412d]">
                    ₹{currentMonthStats.totalSpending.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">This Month Remaining</p>
                  <p className="text-sm sm:text-base font-bold text-[#1f6b44]">
                    ₹{currentMonthStats.remaining.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </>
        </CardContent>
      </Card>
    </motion.div>
  );
}
