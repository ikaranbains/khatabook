import * as React from "react";
const BASE_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive";

const BUTTON_VARIANT_CLASSES = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const BUTTON_SIZE_CLASSES = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
};

function getButtonClasses({ variant = "default", size = "default", className = "" } = {}) {
  const variantClasses = BUTTON_VARIANT_CLASSES[variant] || BUTTON_VARIANT_CLASSES.default;
  const sizeClasses = BUTTON_SIZE_CLASSES[size] || BUTTON_SIZE_CLASSES.default;
  return `${BASE_BUTTON_CLASSES} ${variantClasses} ${sizeClasses} ${className}`.trim();
}

const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  );
});

export { Button, getButtonClasses as buttonVariants };
