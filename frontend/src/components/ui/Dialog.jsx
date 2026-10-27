import React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-none"
        onClick={() => onOpenChange && onOpenChange(false)}
      />
      {/* Content */}
      <div className="relative z-50 w-full max-w-lg">{children}</div>
    </div>
  );
}

export const DialogContent = React.forwardRef(
  ({ className, children, onClose, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border border-zinc-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1 text-zinc-500 hover:text-zinc-950 border border-zinc-200 hover:bg-zinc-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {children}
    </div>
  )
);
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-4", className)} {...props} />
);

export const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-bold leading-none tracking-tight text-zinc-950", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-zinc-500", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100 mt-4", className)}
    {...props}
  />
);
