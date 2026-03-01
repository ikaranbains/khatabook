'use client';

import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppSelect from '@/components/ui/react-select';
import { Badge } from '@/components/ui/badge';
import { GST_RATES, TRANSACTION_CATEGORIES } from '@/lib/constants';
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  Plus,
  IndianRupee,
  Receipt
} from 'lucide-react';

export default function TransactionForm({ onSubmit }) {
  const prefersReducedMotion = useReducedMotion();
  const defaultValues = {
    type: 'expense',
    name: '',
    description: '',
    amount: '',
    category: '',
    gstAmount: 0,
    totalAmount: 0,
    includeGSTOnly: false,
  };
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues,
  });

  const type = useWatch({ control, name: 'type' });
  const category = useWatch({ control, name: 'category' });
  const amount = useWatch({ control, name: 'amount' });
  const includeGSTOnly = useWatch({ control, name: 'includeGSTOnly' });
  const gstAmount = useWatch({ control, name: 'gstAmount' });
  const totalAmount = useWatch({ control, name: 'totalAmount' });

  useEffect(() => {
    const parsedAmount = parseFloat(amount) || 0;

    if (type !== 'expense') {
      setValue('gstAmount', 0, { shouldValidate: false });
      setValue('totalAmount', parsedAmount, { shouldValidate: false });
      setValue('includeGSTOnly', false, { shouldValidate: false });
      return;
    }

    const nextGstAmount = (parsedAmount * (GST_RATES[category] || 0)) / 100;
    setValue('gstAmount', nextGstAmount, { shouldValidate: false });
    setValue('totalAmount', parsedAmount + nextGstAmount, { shouldValidate: false });

    if ((GST_RATES[category] || 0) <= 0) {
      setValue('includeGSTOnly', false, { shouldValidate: false });
    }
  }, [amount, category, setValue, type]);

  const onFormSubmit = async (values) => {
    const parsedAmount = parseFloat(values.amount);
    const parsedGSTAmount = values.type === 'expense' ? parseFloat(values.gstAmount) || 0 : 0;
    const useGSTOnly = values.includeGSTOnly && parsedGSTAmount > 0;
    const finalAmount =
      values.type === 'expense'
        ? useGSTOnly
          ? parsedGSTAmount
          : parsedAmount
        : parsedAmount;
    const finalTotalAmount =
      values.type === 'expense'
        ? useGSTOnly
          ? parsedGSTAmount
          : parseFloat(values.totalAmount)
        : parsedAmount;

    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      amount: finalAmount,
      gstAmount: parsedGSTAmount,
      totalAmount: finalTotalAmount,
    });

    reset(defaultValues);
  };

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
               <CardTitle className="text-base sm:text-lg text-slate-900">Add Transaction</CardTitle>
               <p className="text-xs text-slate-600 font-normal">Record your income or expenses</p>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-5">
             <div className="space-y-2">
               <Label className="text-xs sm:text-sm font-medium text-slate-900">Transaction Type</Label>
               <div className="grid grid-cols-2 gap-2">
                 <Button
                   type="button"
                   onClick={() => {
                     setValue('type', 'expense', { shouldValidate: true });
                     setValue('category', '', { shouldValidate: true });
                   }}
                   className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors duration-150 cursor-pointer ${
                     type === 'expense' 
                       ? 'bg-[#ff5f34] hover:bg-[#f2512b] text-white' 
                       : 'hover:bg-[#f1eee6] bg-white text-slate-700 border border-black/10'
                   }`}
                 >
                   <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                   <span className="hidden sm:inline">Expense</span>
                   <span className="sm:hidden">Out</span>
                 </Button>
                 <Button
                   type="button"
                   onClick={() => {
                     setValue('type', 'income', { shouldValidate: true });
                     setValue('category', '', { shouldValidate: true });
                   }}
                   className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors duration-150 cursor-pointer ${
                     type === 'income' 
                       ? 'bg-[#33c784] hover:bg-[#2fb277] text-white' 
                       : 'hover:bg-[#f1eee6] bg-white text-slate-700 border border-black/10'
                   }`}
                 >
                   <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                   <span className="hidden sm:inline">Income</span>
                   <span className="sm:hidden">In</span>
                 </Button>
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-slate-900">Name *</Label>
               <input
                 id="name"
                 {...register('name', {
                   required: 'Name is required',
                   validate: (value) => value.trim().length > 0 || 'Name is required',
                 })}
                 placeholder="e.g., Uber Ride"
                 className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
               />
               {errors.name && <p className="text-xs text-[#c2412d]">{errors.name.message}</p>}
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div className="space-y-2">
                 <Label htmlFor="amount" className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-900">
                   <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                   Amount *
                 </Label>
                 <input
                   id="amount"
                   type="number"
                   {...register('amount', {
                     required: 'Amount is required',
                     validate: (value) =>
                       (parseFloat(value) > 0 && Number.isFinite(parseFloat(value))) ||
                       'Amount must be greater than 0',
                   })}
                   placeholder="0.00"
                   step="0.01"
                   min="0"
                   className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
                 />
                 {errors.amount && <p className="text-xs text-[#c2412d]">{errors.amount.message}</p>}
               </div>

               <div className="space-y-2">
                 <Label htmlFor="category" className="text-xs sm:text-sm font-medium text-slate-900">Category *</Label>
                 <Controller
                   name="category"
                   control={control}
                   rules={{ required: 'Category is required' }}
                   render={({ field }) => (
                     <AppSelect
                       value={field.value}
                       onChange={field.onChange}
                       placeholder="Select category"
                       options={TRANSACTION_CATEGORIES[type]}
                     />
                   )}
                 />
                 {errors.category && <p className="text-xs text-[#c2412d]">{errors.category.message}</p>}
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="description" className="text-xs sm:text-sm font-medium text-slate-900">Description</Label>
               <input
                 id="description"
                 {...register('description')}
                 placeholder="Optional subtext"
                 className="h-11 w-full min-w-0 rounded-[12px] border border-black/10 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-black/20 focus:ring-2 focus:ring-black/10"
               />
             </div>

             {type === 'expense' && (
               <div className="flex items-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 py-3">
                 <Controller
                   name="includeGSTOnly"
                   control={control}
                   render={({ field }) => (
                     <input
                       id="gst-only"
                       type="checkbox"
                       checked={field.value}
                       onChange={(e) => field.onChange(e.target.checked)}
                       disabled={!(category && GST_RATES[category] > 0)}
                       className="h-4 w-4 accent-[#5c3ea5] disabled:cursor-not-allowed"
                     />
                   )}
                 />
                 <Label
                   htmlFor="gst-only"
                   className="text-xs sm:text-sm font-medium text-slate-900 cursor-pointer"
                 >
                   Add GST amount
                 </Label>
               </div>
             )}

             <AnimatePresence initial={false}>
               {includeGSTOnly && type === 'expense' && category && GST_RATES[category] > 0 && (
                 <motion.div
                   key="gst-box"
                   initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                   animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                   exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
                   transition={{ duration: prefersReducedMotion ? 0.12 : 0.18, ease: 'easeOut' }}
                   className="p-2 sm:p-3 rounded-lg bg-[#f7f1e6] border border-black/10 will-change-transform"
                 >
                   <div className="flex items-center gap-2 mb-2 sm:mb-3">
                     <Calculator className="w-3 h-3 sm:w-4 sm:h-4 text-[#5c3ea5]" />
                     <h3 className="text-xs sm:text-sm font-semibold text-slate-900">GST Calculation</h3>
                     <Badge className="text-xs bg-[#151513] text-white">
                       {GST_RATES[category]}%
                     </Badge>
                   </div>
                   <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
                     <div className="text-center">
                       <p className="text-slate-600 mb-1">Base</p>
                       <p className="font-semibold text-slate-900 text-xs">
                         {formatCurrency(parseFloat(amount || 0))}
                       </p>
                     </div>
                     <div className="text-center border-l border-r border-black/10">
                       <p className="text-slate-600 mb-1">GST</p>
                       <p className="font-semibold text-slate-900 text-xs">
                         {formatCurrency(gstAmount)}
                       </p>
                     </div>
                     <div className="text-center">
                       <p className="text-slate-600 mb-1">Total</p>
                       <p className="font-semibold text-[#5c3ea5] text-xs">
                         {formatCurrency(totalAmount)}
                       </p>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <Button
               type="submit"
               className="w-full bg-[#ff5f34] hover:bg-[#f2512b] text-white font-medium transition-colors duration-150 text-sm cursor-pointer"
               disabled={isSubmitting}
             >
               <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
               Add Transaction
             </Button>
           </form>
         </CardContent>
       </Card>
     </motion.div>
   );
}
