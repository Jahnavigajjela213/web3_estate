"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Coins, LayoutDashboard, Receipt, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import { useClaimableRewards, usePortfolio, useProperties } from "@/lib/queries";
import { useCurrentWallet } from "./use-current-wallet";
import { buildInvestorMetrics } from "./investor-utils";

const NAV = [
  { href: "/investor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investor/marketplace", label: "Marketplace", icon: Building2 },
  { href: "/investor/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/investor/yield", label: "Yield & Claims", icon: Coins },
  { href: "/investor/transactions", label: "Transactions", icon: Receipt },
] as const;

export function InvestorSidebar() {
  const pathname = usePathname();
  const wallet = useCurrentWallet();
  const properties = useProperties();
  const portfolio = usePortfolio(wallet);
  const claimable = useClaimableRewards(wallet);
  const metrics = buildInvestorMetrics(portfolio.data?.holdings ?? [], properties.data ?? []);

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-[#F9FAFF] px-4 py-5 shadow-[16px_0_60px_-48px_hsl(var(--foreground)/0.6)] dark:bg-card/[0.35] lg:flex">
      <Link href="/investor" className="mb-9 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary via-chart-3 to-chart-2 font-bold text-primary-foreground shadow-lg shadow-primary/20">
          E
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">EstateChain</span>
          <span className="text-[11px] text-muted-foreground">Investor Suite</span>
        </div>
      </Link>

      <div className="mb-4 px-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Menu
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = item.href === "/investor" ? pathname === "/investor" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative -mx-4 flex items-center gap-3 px-7 py-3 text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-primary/[0.13] via-primary/[0.08] to-transparent text-primary shadow-none ring-0"
                  : "text-muted-foreground hover:bg-primary/[0.08] hover:text-primary",
              )}
            >
              {active ? <span className="absolute inset-y-0 left-0 w-1 bg-primary" /> : null}
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <SidebarMetric
          title="Portfolio Value"
          value={formatCurrency(metrics.estimatedValue)}
          sub={`${metrics.propertiesOwned} properties held`}
          loading={properties.isLoading || portfolio.isLoading}
        />
        <SidebarMetric
          title="Claimable Yield"
          value={`${claimable.data?.total_claimable_eth ?? "0"} ETH`}
          sub={`${claimable.data?.properties?.length ?? 0} properties accruing`}
          loading={claimable.isLoading}
          accent="violet"
        />
      </div>
    </aside>
  );
}

function SidebarMetric({
  title,
  value,
  sub,
  loading,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  loading?: boolean;
  accent?: "violet";
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-3.5 shadow-sm backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <div className={cn("mt-1.5 text-xl font-semibold tracking-tight", accent ? "text-chart-3" : "text-primary")}>{value}</div>
      )}
      {!loading ? <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
