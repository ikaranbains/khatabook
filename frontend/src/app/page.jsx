"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import Dashboard from "../components/Dashboard";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import BudgetSummary from "../components/BudgetSummary";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PwaInstallPrompt from "../components/PwaInstallPrompt";
import {
  getCurrentWorkspace,
  getTransactions,
  createTransaction,
  removeTransaction,
  getBudgets,
  createBudget,
  removeBudget,
  updateCurrentWorkspace,
} from "../lib/api";
import { APP_TAB_IDS } from "../lib/constants";

const CURRENT_WORKSPACE_QUERY_KEY = ["workspace", "current"];
const TRANSACTIONS_QUERY_KEY = ["transactions"];
const BUDGETS_QUERY_KEY = ["budgets"];

const BudgetTracker = dynamic(() => import("../components/BudgetTracker"), {
  loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
  ssr: false,
});

const BudgetCategoryChart = dynamic(
  () => import("../components/BudgetCategoryChart"),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
    ssr: false,
  },
);

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function Home() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") {
      return "dashboard";
    }

    const savedActiveTab = localStorage.getItem("activeTab");
    return savedActiveTab && APP_TAB_IDS.includes(savedActiveTab)
      ? savedActiveTab
      : "dashboard";
  });
  const [mutationError, setMutationError] = useState("");

  const workspaceQuery = useQuery({
    queryKey: CURRENT_WORKSPACE_QUERY_KEY,
    queryFn: getCurrentWorkspace,
  });

  const transactionsQuery = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: getTransactions,
  });

  const budgetsQuery = useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: getBudgets,
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data]);
  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data]);
  const workspace = workspaceQuery.data;
  const salaryAmount = workspace?.salaryAmount ?? 0;

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );

  const totalBudgeted = useMemo(
    () => budgets.reduce((sum, budget) => sum + budget.amount, 0),
    [budgets],
  );

  const remainingSalary = salaryAmount - totalExpenses;
  const remainingBudgetCapacity = salaryAmount - totalBudgeted;

  const updateWorkspaceMutation = useMutation({
    mutationFn: updateCurrentWorkspace,
    onMutate: () => {
      setMutationError("");
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(CURRENT_WORKSPACE_QUERY_KEY, updatedWorkspace);
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to update amount"));
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction) => {
      if (salaryAmount <= 0) {
        throw new Error("Set your monthly amount before adding transactions.");
      }

      if (transaction.amount > remainingSalary) {
        throw new Error("This expense is higher than your remaining balance.");
      }

      return createTransaction({
        ...transaction,
        type: "expense",
        date: new Date().toISOString(),
      });
    },
    onMutate: () => {
      setMutationError("");
    },
    onSuccess: (createdTransaction) => {
      queryClient.setQueryData(TRANSACTIONS_QUERY_KEY, (current = []) => [
        createdTransaction,
        ...current,
      ]);
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to create transaction"));
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: removeTransaction,
    onMutate: () => {
      setMutationError("");
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(TRANSACTIONS_QUERY_KEY, (current = []) =>
        current.filter((transaction) => transaction.id !== deletedId),
      );
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to delete transaction"));
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budget) => {
      if (salaryAmount <= 0) {
        throw new Error("Set your monthly amount before creating budgets.");
      }

      if (budget.amount > remainingBudgetCapacity) {
        throw new Error("This budget is higher than your remaining balance available for planning.");
      }

      return createBudget(budget);
    },
    onMutate: () => {
      setMutationError("");
    },
    onSuccess: (createdBudget) => {
      queryClient.setQueryData(BUDGETS_QUERY_KEY, (current = []) => [
        createdBudget,
        ...current,
      ]);
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to create budget"));
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: removeBudget,
    onMutate: () => {
      setMutationError("");
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(BUDGETS_QUERY_KEY, (current = []) =>
        current.filter((budget) => budget.id !== deletedId),
      );
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to delete budget"));
    },
  });

  const queryError = workspaceQuery.error || transactionsQuery.error || budgetsQuery.error;
  const apiError = mutationError || (queryError ? getErrorMessage(queryError, "") : "");
  const isInitialLoading =
    workspaceQuery.isLoading && transactionsQuery.isLoading && budgetsQuery.isLoading;

  const activeTabLabel = useMemo(
    () =>
      activeTab === "dashboard"
        ? "Dashboard"
        : activeTab === "transactions"
          ? "Transactions"
          : "Budget Management",
    [activeTab],
  );

  if (isInitialLoading) {
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
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          salaryAmount={salaryAmount}
          onSaveSalary={updateWorkspaceMutation.mutateAsync}
          isSavingSalary={updateWorkspaceMutation.isPending}
        />

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

          {activeTab === "dashboard" && (
            <section aria-label="Financial Dashboard">
              <Dashboard
                transactions={transactions}
                budgets={budgets}
                salaryAmount={salaryAmount}
              />
            </section>
          )}

          {activeTab === "transactions" && (
            <section aria-label="Transactions Management">
              <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] lg:grid-cols-[460px_1fr] gap-4 sm:gap-8">
                <aside aria-label="Add Transaction Form">
                  <TransactionForm
                    onSubmit={createTransactionMutation.mutateAsync}
                    salaryAmount={salaryAmount}
                    remainingSalary={remainingSalary}
                  />
                </aside>
                <article aria-label="Transaction List">
                  <TransactionList
                    transactions={transactions.filter((transaction) => transaction.type === "expense")}
                    onDelete={deleteTransactionMutation.mutateAsync}
                  />
                </article>
              </div>
            </section>
          )}

          {activeTab === "budget" && (
            <section aria-label="Budget Management">
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-1 sm:space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                    Budget Management
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Allocate your monthly amount, track spending, and manage your finances.
                  </p>
                </div>

                <BudgetTracker
                  budgets={budgets}
                  transactions={transactions}
                  salaryAmount={salaryAmount}
                  onAddBudget={createBudgetMutation.mutateAsync}
                  onDeleteBudget={deleteBudgetMutation.mutateAsync}
                />

                <BudgetSummary
                  budgets={budgets}
                  transactions={transactions}
                  salaryAmount={salaryAmount}
                />

                <div className="grid grid-cols-1 gap-4 sm:gap-8">
                  <BudgetCategoryChart budgets={budgets} transactions={transactions} />
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
        <PwaInstallPrompt />
      </div>
    </div>
  );
}
