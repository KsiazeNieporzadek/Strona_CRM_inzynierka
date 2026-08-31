"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Wallet, AlertTriangle, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Sparkline } from "@/components/dashboard/sparkline";

import revenueData from "@/data/revenue.json";
import roiData from "@/data/roi.json";
import topClientsData from "@/data/top_clients.json";
import paymentDelaysData from "@/data/payment_delays.json";
import fleetData from "@/data/fleet_summary.json";
import industryData from "@/data/industry_revenue.json";

function trendPercent(values: number[]) {
  const first = values[0];
  const last = values[values.length - 1];
  if (!first) return 0;
  return Math.round(((last - first) / first) * 100);
}

function TrendChip({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positive ? "text-[#4ade80]" : "text-[#f87171]"
      )}
    >
      {positive ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

function roiColor(roi: number) {
  if (roi >= 25) return "text-[#4ade80]";
  if (roi >= 20) return "text-[#facc15]";
  return "text-[#f87171]";
}

const PERIODS = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
];

const CHART_COLORS = ["#8b7cf6", "#22d3ee", "#fb923c", "#4ade80", "#facc15"];

export default function DashboardPage() {
  const [period, setPeriod] = useState(6);

  const revenueChartData = useMemo(
    () =>
      revenueData.months
        .map((month, idx) => ({ month, value: revenueData.values[idx] }))
        .slice(-period),
    [period]
  );

  const revenueTotal = revenueData.values.reduce((a, b) => a + b, 0);
  const revenueTrend = trendPercent(revenueData.values);
  const roiTrend = trendPercent(roiData.trend.roiValues);
  const delaysTrend = trendPercent(paymentDelaysData.trend.lateCounts);

  const roiSparkline = roiData.trend.months.map((month, idx) => ({
    month,
    roi: roiData.trend.roiValues[idx],
  }));
  const delaysSparkline = paymentDelaysData.trend.months.map((month, idx) => ({
    month,
    late: paymentDelaysData.trend.lateCounts[idx],
  }));

  const topClients = topClientsData.slice(0, 5);
  const maxCityValue = Math.max(...industryData.values);
  const fleetAvailablePercent = Math.round(
    (fleetData.available / fleetData.total) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel analityczny
          </h1>
          <p className="text-sm text-muted-foreground">
            Podsumowanie wyników firmy
          </p>
        </div>
        <div className="inline-flex gap-1 rounded-xl border border-border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.months)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                period === p.months
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#8b7cf6]/15 text-[#8b7cf6]">
              <Wallet className="size-5" />
            </div>
            <TrendChip value={revenueTrend} />
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight">
            {revenueTotal.toLocaleString()} PLN
          </div>
          <div className="text-sm text-muted-foreground">
            Przychody łącznie (12 mies.)
          </div>
          <div className="mt-3 -mx-1">
            <Sparkline
              data={revenueData.months.map((m, i) => ({
                m,
                v: revenueData.values[i],
              }))}
              dataKey="v"
              color="#8b7cf6"
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#4ade80]/15 text-[#4ade80]">
              <TrendingUp className="size-5" />
            </div>
            <TrendChip value={roiTrend} />
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight">
            {roiData.average}%
          </div>
          <div className="text-sm text-muted-foreground">Średnie ROI</div>
          <div className="mt-3 -mx-1">
            <Sparkline data={roiSparkline} dataKey="roi" color="#4ade80" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#f87171]/15 text-[#f87171]">
              <AlertTriangle className="size-5" />
            </div>
            <TrendChip value={-delaysTrend} />
          </div>
          <div className="mt-4 text-2xl font-bold tracking-tight">
            {paymentDelaysData.late}
          </div>
          <div className="text-sm text-muted-foreground">
            Opóźnione faktury ({paymentDelaysData.onTime}% na czas)
          </div>
          <div className="mt-3 -mx-1">
            <Sparkline data={delaysSparkline} dataKey="late" color="#f87171" />
          </div>
        </Card>
      </div>

      {/* Revenue + ROI ring */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Przychody brutto</h2>
            <span className="text-sm text-muted-foreground">
              Ostatnie {period} mies.
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b7cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b7cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--popover-foreground)",
                  fontSize: 13,
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} PLN`,
                  "Przychód",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b7cf6"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-2 p-5">
          <h2 className="self-start font-semibold">Trend ROI</h2>
          <ProgressRing percent={roiData.average} color="#4ade80" size={140}>
            <div className="text-center">
              <div className="text-3xl font-bold tracking-tight">
                {roiData.average}%
              </div>
              <div className="text-xs text-muted-foreground">średnie ROI</div>
            </div>
          </ProgressRing>
          <TrendChip value={roiTrend} />
        </Card>
      </div>

      {/* Clients + fleet + cities */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Top klienci</h2>
          <div className="space-y-3">
            {topClients.map((client, idx) => (
              <div key={client.name} className="flex items-center gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{
                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                >
                  {client.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {client.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.revenue.toLocaleString()} PLN
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("border-transparent bg-muted", roiColor(client.roi))}
                >
                  {client.roi}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center gap-3 p-5">
          <h2 className="self-start font-semibold">Dostępność floty</h2>
          <ProgressRing percent={fleetAvailablePercent} color="#22d3ee" size={140}>
            <div className="text-center">
              <div className="text-2xl font-bold tracking-tight">
                {fleetData.available}/{fleetData.total}
              </div>
              <div className="text-xs text-muted-foreground">dostępne</div>
            </div>
          </ProgressRing>
          <div className="text-xs text-muted-foreground">
            Śr. wiek floty: {fleetData.averageAge} lat
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Leasingi w miastach</h2>
          <div className="space-y-3">
            {industryData.cities.map((city, idx) => (
              <div key={city} className="flex items-center gap-3">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                  }}
                />
                <span className="w-28 shrink-0 truncate text-sm">{city}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(industryData.values[idx] / maxCityValue) * 100}%`,
                      backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                    }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">
                  {industryData.values[idx]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <Car className="size-3.5" />
            Najdłużej wolny: {fleetData.longestFree[0].regNumber} (
            {fleetData.longestFree[0].daysFree} dni)
          </div>
        </Card>
      </div>
    </div>
  );
}
