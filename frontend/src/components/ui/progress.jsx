"use client";

import * as React from "react";

function Progress({ className, value = 0, ...props }) {
  const normalizedValue = Math.max(0, Math.min(100, Number(value) || 0));
  const classes = `bg-primary/20 relative h-2 w-full overflow-hidden rounded-full ${className || ""}`.trim();

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={classes}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - normalizedValue}%)` }}
      />
    </div>
  );
}

export { Progress };
