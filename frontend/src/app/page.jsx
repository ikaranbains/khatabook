"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "../components/ui/skeleton";
import Dashboard from "../components/Dashboard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import BudgetSummary from "../components/BudgetSummary";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  getTransactions,
  createTransaction,
  removeTransaction,
  getBudgets,
  createBudget,
  removeBudget,
} from "../lib/api";
import { APP_TAB_IDS } from "../lib/constants";

// Dynamic imports for heavier chart components
const BudgetTracker = dynamic(() => import("../components/BudgetTracker"), {
  loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
  ssr: false,
});

const BudgetCategoryChart = dynamic(
  () => import("../components/BudgetCategoryChart"),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
    ssr: false,
  }
);

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiError, setApiError] = useState("");
  const activeTabLabel =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "transactions"
        ? "Transactions"
        : "Budget Management";

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const savedActiveTab = localStorage.getItem("activeTab");
        if (savedActiveTab && APP_TAB_IDS.includes(savedActiveTab) && isMounted) {
          setActiveTab(savedActiveTab);
        }

        const [transactionData, budgetData] = await Promise.all([
          getTransactions(),
          getBudgets(),
        ]);

        if (isMounted) {
          setTransactions(transactionData);
          setBudgets(budgetData);
          setApiError("");
        }
      } catch (error) {
        if (isMounted) {
          setApiError(
            error?.message ||
              "Unable to connect to backend. Make sure backend is running on port 5000.",
          );
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab, isHydrated]);

  const addTransaction = useCallback(async (transaction) => {
    try {
      const created = await createTransaction({
        ...transaction,
        date: new Date().toISOString(),
      });
      setTransactions((prev) => [created, ...prev]);
      setApiError("");
    } catch (error) {
      setApiError(error?.message || "Failed to create transaction");
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await removeTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setApiError("");
    } catch (error) {
      setApiError(error?.message || "Failed to delete transaction");
    }
  }, []);

  const addBudget = useCallback(async (budget) => {
    try {
      const created = await createBudget(budget);
      setBudgets((prev) => [created, ...prev]);
      setApiError("");
    } catch (error) {
      setApiError(error?.message || "Failed to create budget");
    }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    try {
      await removeBudget(id);
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      setApiError("");
    } catch (error) {
      setApiError(error?.message || "Failed to delete budget");
    }
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full bg-background relative overflow-x-hidden">
        <div className="absolute inset-0 page-overlay pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background relative overflow-x-hidden">
      <div className="absolute inset-0 page-overlay pointer-events-none" />
      <div className="fixed inset-x-0 top-0 z-40 pointer-events-none backdrop-blur-sm sm:backdrop-blur-2xl bg-[--glass-surface]" />
      <div className="relative z-50 w-full mt-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main
          className="w-full px-4 sm:px-6 lg:px-8 pt-32 sm:pt-28 pb-8 sm:pb-16 grid gap-6 sm:gap-8"
          role="main"
        >
          <h1 className="sr-only">{activeTabLabel}</h1>
          {apiError && (
            <div className="rounded-xl border border-[#c2412d]/30 bg-[#ffe1db] px-4 py-3 text-sm text-[#8a2f1f]">
              {apiError}
            </div>
          )}
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <section aria-label="Financial Dashboard">
              <Dashboard transactions={transactions} budgets={budgets} />
            </section>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <section aria-label="Transactions Management">
              <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] lg:grid-cols-[460px_1fr] gap-4 sm:gap-8">
                <aside aria-label="Add Transaction Form">
                  <TransactionForm onSubmit={addTransaction} />
                </aside>
                <article aria-label="Transaction List">
                  <TransactionList
                    transactions={transactions}
                    onDelete={deleteTransaction}
                  />
                </article>
              </div>
            </section>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && (
            <section aria-label="Budget Management">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                    Budget Management
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Create budgets, track spending, and manage your finances
                  </p>
                </div>

                {/* Budget Tracker Section */}
                <BudgetTracker
                  budgets={budgets}
                  transactions={transactions}
                  onAddBudget={addBudget}
                  onDeleteBudget={deleteBudget}
                />

                {/* Summary Section */}
                <BudgetSummary budgets={budgets} transactions={transactions} />

                {/* Chart Section */}
                <div className="grid grid-cols-1 gap-4 sm:gap-8">
                  <BudgetCategoryChart
                    budgets={budgets}
                    transactions={transactions}
                  />
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
