"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, CandlestickSeries } from "lightweight-charts";
import type { DummyCandle } from "@/lib/dummyStockData";

interface Props {
  candles: DummyCandle[];
}

export default function StockChart({ candles }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#f3f4f6" },
        horzLines: { color: "#f3f4f6" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 360,
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: "#e5e7eb",
        timeVisible: false,
        ticksVisible: true,
      },
      rightPriceScale: {
        borderColor: "#e5e7eb",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    candleSeries.setData(candles);

    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candles]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
