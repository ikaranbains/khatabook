"use client";

import { useEffect, useMemo, useState } from "react";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(() => isStandalone());
  const showIosHint = useMemo(() => {
    if (typeof window === "undefined" || installed) return false;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|opr\//.test(ua);
    return isIos && isSafari;
  }, [installed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const canShow = useMemo(() => {
    if (installed || dismissed) return false;
    return Boolean(deferredPrompt) || showIosHint;
  }, [deferredPrompt, showIosHint, installed, dismissed]);

  const onInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome !== "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  if (!canShow) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[70] sm:left-auto sm:right-6 sm:w-[360px]">
      <div className="rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_8px_0_rgba(21,21,19,0.08),0_18px_32px_rgba(21,21,19,0.16)] backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">Install KhataBook</p>
        <p className="text-xs text-slate-600 mt-1">
          {deferredPrompt
            ? "Add KhataBook to your home screen for a faster app-like experience."
            : "In Safari, tap Share and then Add to Home Screen."}
        </p>
        <div className="flex items-center gap-2 mt-3">
          {deferredPrompt ? (
            <button
              type="button"
              onClick={onInstall}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#ff5f34] text-white hover:bg-[#f2512b] transition-colors"
            >
              Install
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-black/10 text-slate-700 hover:bg-[#f1eee6] transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
