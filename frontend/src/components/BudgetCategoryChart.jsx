'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { BUDGET_CATEGORY_CHART_COLORS } from '@/lib/constants';
import useIsMobile from '@/lib/useIsMobile';

function CategoryTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#151513] border border-black/20 rounded-xl p-3 shadow-lg">
        <p className="text-white font-medium text-sm">{data.name}</p>
        <p className="text-xs text-[#7bd1ff]">Budget: ₹{data.budget.toLocaleString('en-IN')}</p>
        <p className="text-xs text-[#ff9b6a]">Spent: ₹{data.spent.toLocaleString('en-IN')}</p>
        <p className="text-xs text-[#8ddf7b]">Remaining: ₹{data.remaining.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
}

export default function BudgetCategoryChart({ budgets, transactions }) {
  const [chartType, setChartType] = useState('pie');
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const useLightAnimations = isMobile || prefersReducedMotion;

  const expenseByCategory = useMemo(() => {
    const totals = new Map();
    for (const transaction of transactions) {
      if (transaction.type !== 'expense') continue;
      const key = transaction.category || 'Other';
      totals.set(key, (totals.get(key) || 0) + Number(transaction.amount || 0));
    }
    return totals;
  }, [transactions]);

  const chartData = useMemo(() => {
    return budgets.map((budget) => {
      const spent = expenseByCategory.get(budget.category) || 0;

      return {
        name: budget.category,
        spent,
        budget: budget.amount,
        remaining: Math.max(0, budget.amount - spent),
      };
    });
  }, [budgets, expenseByCategory]);

  const pieData = useMemo(
    () => chartData.filter((item) => item.spent > 0),
    [chartData],
  );

  const renderPieLabel = ({ name, percent }) => {
    if (percent < 0.05) return '';
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <motion.div
      initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: useLightAnimations ? 0.1 : 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff5f34]" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Category Breakdown
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
              <button
                onClick={() => setChartType('pie')}
                className={`px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  chartType === 'pie'
                    ? 'bg-[#151513] text-white border border-black/10'
                    : 'bg-white text-slate-600 border border-black/10 hover:bg-[#f1eee6]'
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 sm:px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  chartType === 'bar'
                    ? 'bg-[#151513] text-white border border-black/10'
                    : 'bg-white text-slate-600 border border-black/10 hover:bg-[#f1eee6]'
                }`}
              >
                Bar
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="w-full h-80 sm:h-96 flex items-center justify-center">
              <p className="text-slate-600 text-sm">No budgets set yet</p>
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80 lg:h-96 [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:border-0 [&_.recharts-surface]:outline-none [&_.recharts-surface]:border-0">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  pieData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-600 text-sm">No spending data yet</p>
                    </div>
                  ) : (
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy={isMobile ? '45%' : '50%'}
                        labelLine={false}
                        label={isMobile ? false : renderPieLabel}
                        outerRadius={isMobile ? '62%' : '70%'}
                        fill="#8884d8"
                        dataKey="spent"
                        isAnimationActive={!useLightAnimations}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              BUDGET_CATEGORY_CHART_COLORS[
                                index % BUDGET_CATEGORY_CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CategoryTooltip />} isAnimationActive={!useLightAnimations} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconSize={10}
                        wrapperStyle={{ fontSize: isMobile ? '11px' : '12px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  )
                ) : (
                  <BarChart data={chartData} margin={{ top: 20, right: isMobile ? 8 : 20, left: 0, bottom: isMobile ? 50 : 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,21,19,0.15)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(21,21,19,0.5)"
                      tick={{ fill: 'rgba(21,21,19,0.65)', fontSize: isMobile ? 10 : 12 }}
                      angle={isMobile ? -30 : -45}
                      interval={isMobile ? 1 : 0}
                      textAnchor="end"
                      height={isMobile ? 65 : 80}
                    />
                    <YAxis
                      stroke="rgba(21,21,19,0.5)"
                      tick={{ fill: 'rgba(21,21,19,0.65)', fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      width={isMobile ? 36 : 48}
                    />
                    <Tooltip content={<CategoryTooltip />} isAnimationActive={!useLightAnimations} />
                    <Bar dataKey="spent" fill="#ff5f34" radius={[8, 8, 0, 0]} name="Spent" isAnimationActive={!useLightAnimations} />
                    <Bar dataKey="remaining" fill="#33c784" radius={[8, 8, 0, 0]} name="Remaining" isAnimationActive={!useLightAnimations} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
