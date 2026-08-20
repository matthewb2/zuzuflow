"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import StockChart from "@/components/StockChart";
import { getDummyStockData } from "@/lib/dummyStockData";
import type { DummyStockInfo } from "@/lib/dummyStockData";

const STOCK_NAMES: Record<string, string> = {
  "005930": "삼성전자",
  "000660": "SK하이닉스",
  "035420": "네이버",
  "035720": "카카오",
  "비트코인": "비트코인",
  "AAPL": "AAPL",
};

const STOCK_TICKERS: Record<string, string> = {
  "005930": "005930 · KOSPI",
  "000660": "000660 · KOSPI",
  "035420": "035420 · KOSPI",
  "035720": "035720 · KOSPI",
  "비트코인": "BTC · CRYPTO",
  "AAPL": "AAPL · NASDAQ",
};

export default function StockDetail() {
  const params = useParams();
  const code = params.code as string;
  const stockName = STOCK_NAMES[code] || code;
  const stockTicker = STOCK_TICKERS[code] || code;

  const [stock, setStock] = useState<DummyStockInfo | null>(null);

  useEffect(() => {
    setStock(getDummyStockData(code));
  }, [code]);

  const [userZCoin, setUserZCoin] = useState(1300);
  const [position, setPosition] = useState<"buy" | "sell" | null>(null);
  const [opinion, setOpinion] = useState("");
  const [voteWeight, setVoteWeight] = useState(10);

  const [feeds, setFeeds] = useState([
    { id: 1, user: "반도체개미", pos: "buy", text: "외인 세력이 Z코인 베팅판에 몰리는거 보니 내일 무조건 갭상승 출발입니다.", weight: 50, time: "3분 전" },
    { id: 2, user: "인버스전문가", pos: "sell", text: "거시 경제 지표가 좋지 않습니다. 무리한 베팅은 차트 훼손을 부릅니다.", weight: 10, time: "12분 전" },
  ]);

  const totalBuyWeight = feeds.filter(f => f.pos === "buy").reduce((acc, cur) => acc + cur.weight, 0);
  const totalSellWeight = feeds.filter(f => f.pos === "sell").reduce((acc, cur) => acc + cur.weight, 0);
  const totalWeight = totalBuyWeight + totalSellWeight;
  const buyPct = totalWeight > 0 ? Math.round((totalBuyWeight / totalWeight) * 100) : 50;

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return alert("포지션을 선택하세요!");
    if (!opinion.trim()) return alert("의견을 남겨주세요!");
    if (userZCoin < voteWeight) return alert("Z코인이 부족합니다.");

    const newFeed = {
      id: Date.now(),
      user: "나의 주주플로우",
      pos: position,
      text: opinion,
      weight: voteWeight,
      time: "방금 전",
    };

    setFeeds([newFeed, ...feeds]);
    setUserZCoin(userZCoin - voteWeight);
    setOpinion("");
    setPosition(null);
    alert(`${voteWeight} Z코인을 사용하여 투표를 완료했습니다!`);
  };

  const formatPrice = (n: number) => n.toLocaleString();

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900">{stockName}</h1>
              <p className="text-xs text-gray-400">{stockTicker}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-500 block">나의 잔액</span>
            <span className="text-sm font-black text-indigo-600">💎 {userZCoin} Z</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {stock && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">실시간 시세</p>
                  <p className="text-3xl font-black text-gray-900">{formatPrice(stock.currentPrice)}원</p>
                </div>
                <div className={`ml-auto text-right ${stock.change >= 0 ? "text-red-500" : "text-blue-500"}`}>
                  <p className="text-lg font-black">
                    {stock.change >= 0 ? "+" : ""}{formatPrice(stock.change)}
                  </p>
                  <p className="text-xs font-bold">
                    {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">고가</p>
                  <p className="font-bold text-gray-800">{formatPrice(stock.high)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">저가</p>
                  <p className="font-bold text-gray-800">{formatPrice(stock.low)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2">
                  <p className="text-gray-400">거래량</p>
                  <p className="font-bold text-gray-800">{formatPrice(stock.volume)}</p>
                </div>
              </div>
            </div>

            <StockChart candles={stock.candles} />
          </>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800">Z코인 투표 파워 현황</h3>
            <span className="text-xs text-gray-400">총 투표 가중치: {totalWeight} Z</span>
          </div>
          <div className="w-full bg-blue-500 h-5 rounded-full overflow-hidden flex shadow-inner">
            <div className="bg-red-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${buyPct}%` }}>
              {buyPct}%
            </div>
            <div className="h-full flex items-center justify-center text-[10px] text-white font-bold flex-1">
              {100 - buyPct}%
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs font-bold">
            <span className="text-red-500">BULL 파워: {totalBuyWeight}Z</span>
            <span className="text-blue-500">BEAR 파워: {totalSellWeight}Z</span>
          </div>
        </div>

        <form onSubmit={handleVoteSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-1">플로우 보팅 (Flow Voting)</h4>
            <p className="text-xs text-gray-400">보유한 Z코인을 소모하여 투표 의견의 영향력(가중치)을 높일 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPosition("buy")} className={`py-3 rounded-xl text-sm font-black border transition-all ${position === "buy" ? "bg-red-50 border-red-500 text-red-600 shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              🔥 BULL (매수)
            </button>
            <button type="button" onClick={() => setPosition("sell")} className={`py-3 rounded-xl text-sm font-black border transition-all ${position === "sell" ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              ❄️ BEAR (매도)
            </button>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>투표 가중치 설정</span>
              <span className="text-indigo-600 font-bold">{voteWeight} Z코인 소모</span>
            </div>
            <input type="range" min="10" max="100" step="10" value={voteWeight} onChange={(e) => setVoteWeight(Number(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
          </div>

          <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} placeholder="Z코인 생태계의 건전한 투자 플로우를 위해 정교한 의견을 작성해주세요." className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none" />
          
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm">
            {voteWeight} Z코인으로 투표 및 플로우 피드 등록
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 text-sm px-1">종목 토론 플로우</h3>
          <div className="space-y-2">
            {feeds.map((f) => (
              <div key={f.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-800">{f.user}</span>
                    {f.pos === "buy" ? (
                      <span className="bg-red-50 text-red-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded">BULL</span>
                    ) : (
                      <span className="bg-blue-50 text-blue-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded">BEAR</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded mr-2">파워 {f.weight}Z</span>
                    <span className="text-[11px] text-gray-400">{f.time}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
