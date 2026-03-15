"use client";

import { useState } from "react";
import { TrendingUp, LayoutGrid, CreditCard, Target, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { HEADER_TAB_ITEMS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import SalarySettingsModal from "@/components/SalarySettingsModal";

const TAB_ICON_MAP = {
  overview: LayoutGrid,
  transactions: CreditCard,
  budget: Target,
};

export default function Header({
  activeTab,
  setActiveTab,
  salaryAmount,
  onSaveSalary,
  isSavingSalary,
}) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogoClick = () => {
    setActiveTab("dashboard");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("activeTab", "dashboard");
    }
    router.push("/");
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl px-4 sm:px-6 py-3 border-2 border-black/10 bg-white/80 backdrop-blur-sm shadow-[0_8px_0_rgba(21,21,19,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-8">
          <button
            type="button"
            className="flex items-center space-x-2 sm:space-x-3 shrink-0 cursor-pointer"
            onClick={handleLogoClick}
            aria-label="Go to overview"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#151513] shadow-[0_4px_0_rgba(21,21,19,0.2)]">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="font-display text-lg sm:text-xl font-bold text-slate-900">
              KhataBook
            </div>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 sm:gap-3">
            <nav className="flex-1 sm:flex-none flex items-center justify-between sm:justify-start space-x-1 bg-[#f1eee6] px-1 sm:px-1.5 py-1 sm:py-1.5 rounded-xl border-2 border-black/10 overflow-x-auto">
              {HEADER_TAB_ITEMS.map((tab) => {
                const TabIcon = TAB_ICON_MAP[tab.iconKey];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer flex-1 sm:flex-none justify-center flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#151513] text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                    }`}
                  >
                    <TabIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-xs sm:text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black/10 bg-[#f1eee6] text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
              aria-label="Open money settings"
              title="Money settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>

      <SalarySettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        salaryAmount={salaryAmount}
        onSave={onSaveSalary}
        isSaving={isSavingSalary}
      />
    </motion.header>
  );
}
