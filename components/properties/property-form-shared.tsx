"use client";

import { Label } from "@/components/ui/label";
import { cn, formatEth } from "@/lib/utils";

/** Per-token sale price in ETH from total property value (ETH) ÷ token supply. */
export function calculateTokenPriceEth(totalValueEth: string, tokenSupply: string): number {
  const total = Number(totalValueEth);
  const supply = Number(tokenSupply);
  if (!Number.isFinite(total) || !Number.isFinite(supply) || total <= 0 || supply <= 0) return 0;
  return total / supply;
}

export function formatTokenPriceEth(priceEth: number, digits = 6): string {
  if (priceEth <= 0) return "";
  return formatEth(priceEth, { digits });
}

export const propertyDialogContentClass =
  "flex h-[min(700px,calc(100vh-2rem))] w-[min(100vw-2rem,30rem)] max-w-[min(100vw-2rem,30rem)] flex-col gap-0 overflow-hidden border-border/70 bg-card p-0 shadow-2xl dark:border-slate-700/80 dark:bg-slate-950 sm:rounded-2xl";

/** Inner padded scroll container used inside each property dialog. */
export const propertyDialogBodyClass =
  "scrollbar-thin flex min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-4 pt-4";

/** Sticky footer styling used at the bottom of property dialogs. */
export const propertyDialogFooterClass =
  "sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-border/60 bg-card px-4 py-3 dark:bg-slate-950 sm:flex-row sm:justify-end";

export const propertyFormClass = "grid min-w-0 gap-2.5";

export const propertyFormGridClass = "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2";

export function PropertyFormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label className="text-sm font-semibold normal-case tracking-normal text-foreground">{label}</Label>
      <div className="min-w-0 [&_input]:h-11 [&_input]:min-w-0 [&_input]:w-full [&_input]:max-w-full [&_input]:rounded-xl [&_input]:border-border/80 [&_input]:bg-background/70 [&_input]:px-3.5 [&_input]:text-sm [&_input]:shadow-sm dark:[&_input]:border-slate-700 dark:[&_input]:bg-slate-950/70">{children}</div>
    </div>
  );
}
