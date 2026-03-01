"use client";

import * as React from "react";

const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  const classes =
    `flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${className || ""}`.trim();

  return (
    <label
      ref={ref}
      data-slot="label"
      className={classes}
      {...props}
    />
  );
});

export { Label };
