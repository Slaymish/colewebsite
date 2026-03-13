import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "link";
}

export function Button({
  asChild = false,
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-neutral-950 px-4 py-2 text-white hover:bg-neutral-800",
        variant === "ghost" && "px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
        variant === "outline" && "border border-neutral-200 bg-white px-4 py-2 text-neutral-900 hover:bg-neutral-50",
        variant === "link" && "h-auto rounded-none px-0 py-0 text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline",
        className,
      )}
      {...props}
    />
  );
}
