"use client";

import { motion } from "framer-motion";
import { TrendingUp, Github, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import { FOOTER_SOCIAL_LINKS } from "@/lib/constants";

const SOCIAL_ICON_MAP = {
  github: Github,
  twitter: Twitter,
  mail: Mail,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-12 sm:mt-16 border-t-2 border-black/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="flex flex-col items-start space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#151513] shadow-[0_4px_0_rgba(21,21,19,0.2)]">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                KhataBook
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xs">
              Personal finance management for Indian households
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900">
              Quick Links
            </h3>
            <nav className="flex flex-col space-y-2 sm:space-y-2.5" aria-label="Footer navigation">
              <Link
                href="/"
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Home
              </Link>
              <a
                href="#"
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900">
              Follow Us
            </h3>
            <div className="flex items-center space-x-3 sm:space-x-4" aria-label="Social media links">
              {FOOTER_SOCIAL_LINKS.map((link) => {
                const Icon = SOCIAL_ICON_MAP[link.iconKey];
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.ariaLabel}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-black/10 my-6 sm:my-8" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600">
          <p>
            &copy; {currentYear} KhataBook. All rights reserved.
          </p>
          <p>
            Made with <span className="text-red-500">❤</span> in India
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
