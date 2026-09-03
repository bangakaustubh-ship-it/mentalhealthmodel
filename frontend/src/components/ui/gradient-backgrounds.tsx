"use client";

import { cn } from "@/lib/utils";

interface GradientBackgroundsProps {
  className?: string;
  variant?: "orange" | "amber";
}

export const GradientBackgrounds = ({
  className,
  variant = "orange",
}: GradientBackgroundsProps) => {
  const gradient =
    variant === "amber"
      ? "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #f59e0b 100%)"
      : "radial-gradient(125% 125% at 50% 10%, #fff 40%, #f97316 100%)";

  return (
    <div className={cn("absolute inset-0 z-0", className)}>
      <div className="w-full h-full" style={{ background: gradient }} />
    </div>
  );
};
