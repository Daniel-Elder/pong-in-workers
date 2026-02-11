import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative group transition-all duration-100 ease-out active:scale-95",
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-background",
          "uppercase font-bold tracking-widest",
          "shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]",
          size === "sm" && "px-4 py-2 text-xs",
          size === "md" && "px-8 py-4 text-sm md:text-base",
          size === "lg" && "px-12 py-6 text-lg md:text-xl",
          className
        )}
        {...props}
      />
    );
  }
);

ArcadeButton.displayName = "ArcadeButton";
