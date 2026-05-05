"use client";

import { useReportWebVitals } from "next/web-vitals";

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
};

function reportVital(metric: WebVitalMetric): void {
  if (process.env.NODE_ENV !== "production") return;

  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    path: window.location.pathname,
  });

  const url = "/api/vitals";

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(url, blob)) return;
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function WebVitalsReporter() {
  useReportWebVitals(reportVital);
  return null;
}
