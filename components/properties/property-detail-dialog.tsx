"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { Property } from "@/lib/types";
import { cn, formatCurrency, formatNumber, percent, shortAddress } from "@/lib/utils";

type PropertyDetailDialogProps = {
  property: Property & {
    rent_enabled?: boolean;
    current_cycle_paid?: boolean;
    next_rent_due_at?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  statusLabel?: string;
};

export function PropertyDetailDialog({
  property,
  open,
  onOpenChange,
  actionLabel,
  actionDisabled,
  onAction,
  statusLabel,
}: PropertyDetailDialogProps) {
  const images = (property.images ?? []).filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(0);
  const [paused, setPaused] = useState(false);
  const sold = Number(property.tokens_sold ?? 0);
  const supply = Number(property.token_supply ?? 0);
  const soldPct = Number(property.sold_percentage ?? percent(sold, supply));
  const tokenPriceEth = Number(property.token_sale_price_eth ?? 0);
  const monthlyRentEth = Number(property.monthly_rent_eth ?? 0);
  const totalValue = Number(property.total_value ?? 0);
  const perTokenValue = supply > 0 ? totalValue / supply : 0;
  const displayStatus = statusLabel ?? (property.token_address ? "Rent ready" : "Setup pending");
  const rentConfigured = monthlyRentEth > 0;
  const currentImage = images[selectedImage] ?? null;
  const hasMultipleImages = images.length > 1;
  const footerStatus = rentConfigured
    ? property.current_cycle_paid
      ? "Rent is already paid for this cycle."
      : "Rent is ready for this property."
    : "Rent has not been configured for this property.";

  useEffect(() => {
    if (open) setSelectedImage(0);
  }, [open, property.id]);

  useEffect(() => {
    if (!open || !hasMultipleImages || paused) return;
    const timer = window.setInterval(() => {
      setSelectedImage((current) => (current + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [open, hasMultipleImages, paused, images.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(1155px,calc(100vh-1rem))] w-[min(calc(100vw-1rem),580px)] max-w-[580px] overflow-y-auto rounded-[18px] border-border/80 bg-card p-4 shadow-2xl">
        <div className="space-y-3 pr-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-lg font-semibold leading-none">#{property.id}</span>
                <h2 className="truncate text-lg font-semibold leading-none">{property.name}</h2>
                <Badge variant="outline" className="shrink-0 rounded-md px-1.5 py-0 font-mono text-[10px]">
                  {property.token_symbol}
                </Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{property.location || "Location not set"}</span>
              </div>
            </div>
            <Badge variant={property.token_address ? "success" : "warning"} className="shrink-0 rounded-full px-3 py-1 text-[10px]">
              {displayStatus}
            </Badge>
          </div>

          <div
            className="relative overflow-hidden rounded-md bg-muted/30"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {currentImage ? (
              <img src={currentImage} alt={property.name} className="h-[250px] w-full object-cover" />
            ) : (
              <div className="grid h-[250px] place-items-center bg-gradient-to-br from-primary/20 to-card text-sm text-muted-foreground">
                No property image
              </div>
            )}
            {hasMultipleImages ? (
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/50 px-2.5 py-1.5 shadow-sm backdrop-blur">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    className={cn(
                      "h-1.5 rounded-full bg-white/75 shadow-sm transition-all",
                      index === selectedImage ? "w-5 bg-white" : "w-1.5 hover:bg-white",
                    )}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image.slice(0, 24)}-${index}`}
                  type="button"
                  className={cn(
                    "h-14 w-24 shrink-0 overflow-hidden rounded-md border bg-muted transition",
                    index === selectedImage ? "border-primary ring-2 ring-primary/35" : "border-border hover:border-primary/50",
                  )}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Monthly Rent" value={monthlyRentEth > 0 ? `${monthlyRentEth.toFixed(4)} ETH` : "Not set"} />
            <StatTile label="Property Value" value={formatCurrency(property.total_value)} />
            <StatTile label="Supply" value={formatNumber(supply)} />
            <StatTile label="Ownership Sold" value={`${soldPct.toFixed(1)}%`} />
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token sale progress</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatNumber(sold)} / {formatNumber(supply)}
              </span>
            </div>
            <Progress value={soldPct} className="h-1.5" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoPanel title="Property Description">
              <p>
                {property.name} is a tokenized real estate listing in {property.location || "a key market"}.
                Ownership is represented by {property.token_symbol} security tokens on Sepolia.
                Rent distribution can be enabled once the owner configures monthly rent on-chain.
              </p>
            </InfoPanel>
            <InfoPanel title="Property Details">
              <KeyValue label="Listing ID" value={`#${property.id}`} />
              <KeyValue label="Token symbol" value={property.token_symbol || "--"} />
              <KeyValue label="Token price" value={tokenPriceEth > 0 ? `${tokenPriceEth.toFixed(4)} ETH` : "Not set"} />
              <KeyValue label="Per-token value" value={perTokenValue > 0 ? formatCurrency(perTokenValue) : "--"} />
              <KeyValue label="Available tokens" value={formatNumber(Number(property.tokens_available ?? 0))} />
              <KeyValue label="Rent program" value={rentConfigured ? "Enabled" : "Disabled"} />
            </InfoPanel>
            <InfoPanel title="Payment Information">
              <KeyValue label="Payment currency" value="ETH" />
              <KeyValue label="Payment network" value="Sepolia" />
              <KeyValue label="Monthly rent" value={rentConfigured ? `${monthlyRentEth.toFixed(4)} ETH` : "--"} />
              <KeyValue label="Billing cycle" value="Monthly in advance" />
              <KeyValue label="Cycle status" value={property.current_cycle_paid ? "Paid" : "--"} />
            </InfoPanel>
            <InfoPanel title="Smart Contract">
              <KeyValue label="Security token" value={property.token_address ? shortAddress(property.token_address, 6, 4) : "Not deployed"} mono />
              <KeyValue label="Property NFT" value={property.nft_token_id ? `#${property.nft_token_id}` : "Not minted"} />
              <KeyValue label="Token standard" value="ERC-20 SecurityToken" />
              <KeyValue label="Created by" value={shortAddress(property.owner_wallet, 6, 4) || "Owner"} mono />
              <KeyValue
                label="Verified on-chain"
                value={
                  property.token_address ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-3 w-3" /> Yes
                    </span>
                  ) : (
                    "Pending"
                  )
                }
              />
            </InfoPanel>
          </div>

          <div className="-mx-4 mt-3 flex items-center justify-between gap-3 border-t border-border/70 bg-card px-4 py-3">
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {footerStatus}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" size="sm" variant="outline" className="min-w-20" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {actionLabel ? (
                <Button size="sm" disabled={actionDisabled} onClick={onAction} className="min-w-28">
                  {actionLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/70 bg-card px-3 py-3 text-center shadow-sm">
      <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[128px] rounded-lg border border-border/70 bg-muted/15 p-3 text-[11px] leading-relaxed">
      <h3 className="mb-2 text-xs font-semibold text-foreground">{title}</h3>
      <div className="space-y-1.5 text-muted-foreground">{children}</div>
    </div>
  );
}

function KeyValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <span>{label}</span>
      <span className={cn("min-w-0 text-right text-foreground", mono ? "font-mono" : "")}>{value}</span>
    </div>
  );
}
