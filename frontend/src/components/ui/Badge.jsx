import React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "border-transparent bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-800",
  secondary: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
  destructive: "border-transparent bg-red-600 text-white shadow",
  outline: "border-zinc-300 text-zinc-900",
  success: "border-transparent bg-zinc-900 text-emerald-400 border border-zinc-700",
  defaulter: "border-black bg-black text-white font-mono font-bold",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}
