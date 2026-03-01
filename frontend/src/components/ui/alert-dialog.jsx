"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { buttonVariants } from "@/components/ui/button";

const AlertDialogContext = React.createContext(null);

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog");
  }
  return context;
}

function AlertDialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const controlled = typeof open === "boolean";
  const isOpen = controlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (next) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const contextValue = React.useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen]);

  return <AlertDialogContext.Provider value={contextValue}>{children}</AlertDialogContext.Provider>;
}

function AlertDialogTrigger({ ...props }) {
  const { setOpen } = useAlertDialogContext();
  return <button type="button" data-slot="alert-dialog-trigger" onClick={() => setOpen(true)} {...props} />;
}

function AlertDialogPortal({ children }) {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
}

function AlertDialogOverlay({ className, ...props }) {
  const { setOpen } = useAlertDialogContext();
  const classes = `fixed inset-0 z-50 bg-black/50 ${className || ""}`.trim();

  return (
    <div
      data-slot="alert-dialog-overlay"
      className={classes}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
}

function AlertDialogContent({ className, ...props }) {
  const { open, setOpen } = useAlertDialogContext();
  const classes =
    `bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg ${className || ""}`.trim();

  React.useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        role="alertdialog"
        aria-modal="true"
        data-slot="alert-dialog-content"
        className={classes}
        onClick={(event) => event.stopPropagation()}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }) {
  return <div data-slot="alert-dialog-header" className={`flex flex-col gap-2 text-center sm:text-left ${className || ""}`.trim()} {...props} />;
}

function AlertDialogFooter({ className, ...props }) {
  return <div data-slot="alert-dialog-footer" className={`flex flex-col-reverse gap-2 sm:flex-row sm:justify-end ${className || ""}`.trim()} {...props} />;
}

function AlertDialogTitle({ className, ...props }) {
  return <h2 data-slot="alert-dialog-title" className={`text-lg font-semibold ${className || ""}`.trim()} {...props} />;
}

function AlertDialogDescription({ className, ...props }) {
  return <p data-slot="alert-dialog-description" className={`text-muted-foreground text-sm ${className || ""}`.trim()} {...props} />;
}

function AlertDialogAction({ className, onClick, ...props }) {
  const { setOpen } = useAlertDialogContext();

  return (
    <button
      type="button"
      className={buttonVariants({ className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
      {...props}
    />
  );
}

function AlertDialogCancel({ className, onClick, ...props }) {
  const { setOpen } = useAlertDialogContext();

  return (
    <button
      type="button"
      className={buttonVariants({ variant: "outline", className })}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
