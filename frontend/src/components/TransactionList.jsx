"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChartBar } from "lucide-react";
import AppSelect from "@/components/ui/react-select";
import { TRANSACTION_CATEGORY_ICONS } from "@/lib/constants";
import useIsMobile from "@/lib/useIsMobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TransactionList({ transactions, onDelete }) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const useLightAnimations = isMobile || prefersReducedMotion;

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (filter === "all") return true;
        return transaction.type === filter;
      }),
    [transactions, filter],
  );

  const sortedTransactions = useMemo(
    () =>
      [...filteredTransactions].sort((a, b) => {
        if (sortBy === "date") {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === "amount") {
          return b.amount - a.amount;
        }
        if (sortBy === "description") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      }),
    [filteredTransactions, sortBy],
  );

  const getCategoryIcon = (category) => TRANSACTION_CATEGORY_ICONS[category] || "📌";

  const totals = useMemo(() => {
    const income = sortedTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = sortedTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  }, [sortedTransactions]);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete?.id) return;

    try {
      setIsDeleting(true);
      await onDelete(transactionToDelete.id);
      setTransactionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

   return (
     <motion.div
       className="glass rounded-2xl overflow-hidden"
       initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: useLightAnimations ? 0.1 : 0.5 }}
     >
       <div className="relative p-4 sm:p-6 border-b border-black/10 bg-[#f7f1e6]">
         <div className="flex flex-col gap-3 sm:gap-4">
           <h2 className="text-lg sm:text-xl font-display font-semibold text-slate-900">Transactions</h2>
           <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
             <AppSelect
               className="sm:min-w-[170px]"
               value={filter}
               onChange={setFilter}
               options={[
                 { value: "all", label: "All Types" },
                 { value: "income", label: "Income" },
                 { value: "expense", label: "Expenses" },
               ]}
             />
             <AppSelect
               className="sm:min-w-[190px]"
               value={sortBy}
               onChange={setSortBy}
               options={[
                 { value: "date", label: "Sort by Date" },
                 { value: "amount", label: "Sort by Amount" },
                 { value: "description", label: "Sort by Name" },
               ]}
             />
           </div>
         </div>
       </div>

       <div className="theme-scrollbar divide-y divide-black/10 relative max-h-150 overflow-y-auto p-4">
         {sortedTransactions.length === 0 ? (
           <motion.div
             className="p-8 sm:p-16 text-center"
             initial={useLightAnimations ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: useLightAnimations ? 0.1 : 0.5 }}
           >
             <ChartBar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-6 opacity-70" />
             <p className="font-bold text-lg sm:text-xl mb-2 text-slate-900">
               No transactions found
             </p>
             <p className="text-xs sm:text-sm font-medium opacity-80 text-slate-600">
               Add your first transaction to get started
             </p>
           </motion.div>
         ) : (
           sortedTransactions.map((transaction, index) => (
             <motion.div
               key={transaction.id}
               className="py-3 sm:p-5 transition-all duration-300 border-l-4 border-transparent rounded-xl group relative overflow-hidden hover:bg-[#fff3c4]"
               initial={useLightAnimations ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: useLightAnimations ? 0 : index * 0.05 }}
             >
               <div className="flex items-center justify-between gap-2 sm:gap-4">
                 {/* Left side - Icon and details */}
                 <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                   <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-xl glass-card shrink-0">
                     <span className="text-base sm:text-xl">
                       {getCategoryIcon(transaction.category)}
                     </span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 flex-wrap">
                       <p className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                         {transaction.name[0].toUpperCase() + transaction.name.slice(1) || "Unnamed transaction"}
                       </p>
                       <span
                         className={`inline-flex items-center w-5 h-5 justify-center rounded-full text-xs font-medium shrink-0 ${
                           transaction.type === "income"
                             ? "bg-[#dcf6e6] text-[#1f6b44] border border-black/10"
                             : "bg-[#ffe1db] text-[#c2412d] border border-black/10"
                         }`}
                       >
                         {transaction.type === "income" ? "+" : "-"}
                       </span>
                     </div>
                     <div className="flex items-center gap-1 mt-1 text-xs text-slate-600 flex-wrap">
                       <span className="truncate">{transaction.category}</span>
                       <span>•</span>
                       <span className="shrink-0">
                         {new Date(transaction.date).toLocaleDateString(
                           "en-IN",
                           {
                             day: "numeric",
                             month: "short",
                             year: "2-digit",
                           },
                         )}
                       </span>
                     </div>
                     {transaction.type === "expense" && transaction.gstAmount > 0 && (
                       <div className="mt-1">
                         <span className="text-xs text-[#5c3ea5] bg-[#efe5ff] px-1.5 py-0.5 rounded border border-black/10">
                           GST: ₹{transaction.gstAmount.toFixed(0)}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Right side - Amount and delete */}
                 <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-1 sm:gap-3 shrink-0">
                   <div className="text-right min-w-0">
                     <p
                       className={`font-bold text-sm sm:text-xl whitespace-nowrap ${
                         transaction.type === "income"
                           ? "text-[#1f6b44]"
                           : "text-[#c2412d]"
                       }`}
                     >
                       {transaction.type === "income" ? "+" : "-"}
                       {formatCurrency(transaction.amount)}
                     </p>
                     {transaction.type === "expense" &&
                       transaction.totalAmount !== transaction.amount && (
                       <p className="text-xs md:text-sm text-slate-500 whitespace-nowrap">
                         T: {formatCurrency(transaction.totalAmount)}
                       </p>
                     )}
                   </div>
                   <button
                     onClick={() => setTransactionToDelete(transaction)}
                     className="p-1 sm:p-2 text-slate-500 hover:text-[#c2412d] transition-colors shrink-0 cursor-pointer"
                     title="Delete transaction"
                     aria-label={`Delete ${transaction.name || "transaction"}`}
                   >
                     <svg
                       className="w-4 h-4 sm:w-5 sm:h-5"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                       />
                     </svg>
                   </button>
                 </div>
               </div>
             </motion.div>
           ))
         )}
       </div>

       {sortedTransactions.length > 0 && (
         <div className="p-3 sm:p-4 bg-[#f7f1e6] border-t border-black/10">
           <div className="flex px-4 flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
             <span className="text-slate-600">
               {sortedTransactions.length} transaction
               {sortedTransactions.length !== 1 ? "s" : ""}
             </span>
             <div className="flex flex-row items-start sm:items-center gap-2 sm:gap-4">
               <span className="text-[#1f6b44] font-medium">
                 In:{" "}
                 {formatCurrency(totals.income)}
               </span>
               <span className="text-[#c2412d] font-medium">
                 Out:{" "}
                 {formatCurrency(totals.expense)}
               </span>
             </div>
           </div>
         </div>
       )}

       <AlertDialog
         open={Boolean(transactionToDelete)}
         onOpenChange={(open) => {
           if (!open && !isDeleting) {
             setTransactionToDelete(null);
           }
         }}
       >
         <AlertDialogContent className="overflow-hidden rounded-2xl border-2 border-black/10 bg-[#f7f1e6] p-0 shadow-[0_8px_0_rgba(21,21,19,0.08),0_22px_40px_rgba(21,21,19,0.15)]">
           <AlertDialogHeader className="border-b border-black/10 px-4 py-4 sm:px-6 sm:py-5 text-left">
             <AlertDialogTitle className="font-display text-lg sm:text-xl text-slate-900">
               Delete Transaction?
             </AlertDialogTitle>
             <AlertDialogDescription className="text-xs sm:text-sm text-slate-600">
               This action cannot be undone.
             </AlertDialogDescription>
           </AlertDialogHeader>

           {transactionToDelete && (
             <div className="px-4 py-3 sm:px-6 sm:py-4 bg-white/70 border-b border-black/10">
               <p className="text-sm font-semibold text-slate-900 truncate">
                 {transactionToDelete.name || "Unnamed transaction"}
               </p>
               <p className="text-xs text-slate-600 mt-1">
                 {transactionToDelete.category} • {formatCurrency(transactionToDelete.amount)}
               </p>
             </div>
           )}

           <AlertDialogFooter className="px-4 py-3 sm:px-6 sm:py-4">
             <AlertDialogCancel
               disabled={isDeleting}
               className="border-black/10 bg-white text-slate-700 hover:bg-[#f1eee6]"
             >
               Cancel
             </AlertDialogCancel>
             <AlertDialogAction
               onClick={handleConfirmDelete}
               disabled={isDeleting}
               className="bg-[#ff5f34] text-white hover:bg-[#f2512b] border border-black/10"
             >
               {isDeleting ? "Deleting..." : "Delete"}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </motion.div>
   );
}
