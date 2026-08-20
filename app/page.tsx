"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, LogIn, UserPlus, User, Plus, Check, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function MainDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [userWallet, setUserWallet] = useState({
    username: "User",
    zCoinBalance: 1250,
  });

  const [trendingFeeds, setTrendingFeeds] = useState([
    {
      id: 1,
      stockCode: "005930",
      stockName: "삼성전자",
      username: "bull_master",
      position: "buy",
      opinion: "Strong buy! 이번 분기 실적이 모두를 놀라게 할 것입니다.",
      votes: 42,
      createdAt: "10분 전",
    },
    {
      id: 2,
      stockCode: "비트코인",
      stockName: "비트코인",
      username: "hodl_king",
      position: "buy",
      opinion: "반감기 후 지루한 횡보는 끝났습니다. 이제 흐름을 타세요.",
      votes: 128,
      createdAt: "30분 전",
    },
    {
      id: 3,
      stockCode: "AAPL",
      stockName: "AAPL",
      username: "apple_fan",
      position: "sell",
      opinion: "혁신 부족으로 단기 조정 예상. 스테이킹 갑니다.",
      votes: 15,
      createdAt: "1시간 전",
    },
  ]);

  const [recommendStocks, setRecommendStocks] = useState([
    { code: "035420", name: "네이버", rewarded: false },
    { code: "000660", name: "SK하이닉스", rewarded: false },
    { code: "035720", name: "카카오", rewarded: false },
  ]);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  const handleAddInterest = (code: string, name: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setRecommendStocks(
      recommendStocks.map((stock) =>
        stock.code === code ? { ...stock, rewarded: true } : stock
      )
    );
    setUserWallet((prev) => ({
      ...prev,
      zCoinBalance: prev.zCoinBalance + 50,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp size={24} className="text-indigo-600" />
          <span className="text-xl font-black text-indigo-600 tracking-tight">주주플로우</span>
        </Link>
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">{user?.name || 'User'}님</span>
              </div>
              <span className="text-sm font-black text-indigo-600">💎 {userWallet.zCoinBalance.toLocaleString()} Z</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup">
                <button className="flex items-center gap-1.5 text-gray-600 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition">
                  <UserPlus size={14} />
                  회원가입
                </button>
              </Link>
              <Link href="/login">
                <button className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                  <LogIn size={14} />
                  로그인
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 px-1">실시간 트렌딩 플로우</h2>

          <div className="space-y-3">
            {trendingFeeds.map((feed) => (
              <Link key={feed.id} href={`/stock/${feed.stockCode}`}>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-md mr-2">
                        {feed.stockName}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{feed.username}</span>
                    </div>
                    <span className="text-xs text-gray-400">{feed.createdAt}</span>
                  </div>

                  <p className="text-gray-800 text-sm mb-4 leading-relaxed">{feed.opinion}</p>

                  <div className="flex justify-between items-center border-t pt-3">
                    {feed.position === "buy" ? (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">🔥 상승</span>
                    ) : (
                      <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">❄️ 하락</span>
                    )}
                    <span className="text-xs text-gray-500 font-medium">❤️ {feed.votes}표</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-md">
            <h3 className="font-bold text-base mb-1">🪙 포인트 미션</h3>
            <p className="text-xs text-indigo-100 mb-4">관심 종목을 추가하고 리워드를 받으세요!</p>

            <div className="bg-white/10 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span>오늘 피드 작성</span>
                <span className="font-bold">0 / 1</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>투표 (3회)</span>
                <span className="font-bold text-yellow-300">완료 (+30Z)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3">➕ 관심 종목 추가 & 적립</h3>
            <div className="space-y-2">
              {recommendStocks.map((stock) => (
                <div key={stock.code} className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{stock.name}</p>
                    <p className="text-xs text-gray-400">{stock.code}</p>
                  </div>
                  <button
                    disabled={stock.rewarded}
                    onClick={() => handleAddInterest(stock.code, stock.name)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                      stock.rewarded
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {stock.rewarded ? <><Check size={12} /> 완료</> : <><Plus size={12} /> +50 Z</>}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {!isLoggedIn && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-2">🔐 더 많은 기능</h3>
              <p className="text-xs text-gray-500 mb-3">로그인하여 투표, 피드 작성, 포인트를 Z코인으로 전환 등을 이용하세요!</p>
              <Link href="/login">
                <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
                  지금 로그인
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
