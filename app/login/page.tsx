"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { signIn, signOut, useSession } from 'next-auth/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const oauth = searchParams.get('oauth');

    if (status === 'authenticated' && session?.user && oauth === 'google') {
      const user = session.user as any;
      const providerAccountId = user.providerAccountId || user.sub;
      const googleEmail = user.email;
      const googleName = user.name;
      const googleImage = user.image;

      if (providerAccountId) {
        processGoogleLogin(googleEmail, googleName, googleImage, providerAccountId);
      }
    }
  }, [status, session, searchParams]);

  const processGoogleLogin = async (googleEmail: string | null, googleName: string | null, googleImage: string | null, providerAccountId: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/oauth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerAccountId,
          email: googleEmail,
          name: googleName,
          image: googleImage,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.ok || data._id)) {
        const userItem = data.item || data;
        const accessToken = data.accessToken || data.item?.token?.accessToken || data.item?.accessToken || userItem.token?.accessToken;

        const userData = {
          _id: userItem._id,
          email: userItem.email || googleEmail,
          name: userItem.name || googleName,
          type: userItem.type,
          image: userItem.image || googleImage,
          loginType: 'google',
          accessToken: accessToken,
          token: {
            accessToken: accessToken,
            refreshToken: data.item?.token?.refreshToken || userItem.token?.refreshToken
          },
        };
        setUser(userData);
        router.push('/');
      } else {
        const params = new URLSearchParams({
          email: googleEmail || '',
          name: googleName || '',
          provider: 'google',
          providerAccountId,
        });
        router.push(`/signup?${params.toString()}`);
      }
    } catch (err) {
      console.error('OAuth login error:', err);
    }
  };

  useEffect(() => {
    const oauth = searchParams.get('oauth');
    const userParam = searchParams.get('user');

    if (oauth === 'success' && userParam) {
      try {
        const userData = JSON.parse(userParam);

        if (userData.accessToken || userData.token) {
          setUser(userData);
          router.push('/');
        } else if (userData.email) {
          const params = new URLSearchParams({
            email: userData.email,
            name: userData.name || '',
            provider: 'google'
          });
          router.push(`/signup?${params.toString()}`);
        } else {
          setError('사용자 정보를 찾을 수 없습니다.');
        }
        return;
      } catch (err) {
        setError('로그인 데이터 처리 중 오류가 발생했습니다.');
      }
    }

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError('Google 로그인에 실패했습니다.');
    }
  }, [searchParams, setUser, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.ok) {
        const userData = {
          ...data.item,
          token: data.item?.token,
          accessToken: data.item?.token?.accessToken,
        };
        setUser(userData);
        router.push('/');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    if (status === 'authenticated') {
      await signOut({ redirect: false });
    }

    const result = await signIn('google', { callbackUrl: '/login?oauth=google' });
    if (result?.error) {
      setError('Google 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-gray-600 font-medium">로그인 중...</p>
          </div>
        </div>
      )}

      <header className="max-w-md mx-auto py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-xl tracking-tight">
          <TrendingUp size={28} />
          주주플로우
        </Link>
      </header>

      <main className="max-w-md mx-auto mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft size={20} />
          메인으로
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl">
              <TrendingUp className="text-white" size={48} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">로그인</h1>
          <p className="text-gray-500 text-center mb-8">이메일과 비밀번호로 로그인</p>

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-indigo-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>로딩 중...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
