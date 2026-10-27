import React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-sm border border-zinc-900 active:bg-black",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200",
    outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200",
    ghost: "text-zinc-900 hover:bg-zinc-100",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    black: "bg-black text-white hover:bg-zinc-800 border-2 border-black",
  },
  size: {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-6 text-sm",
    icon: "h-9 w-9",
    xs: "h-7 px-2.5 text-[11px]",
  },
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
