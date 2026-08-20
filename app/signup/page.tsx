"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const provider = searchParams.get('provider');
    const providerAccountId = searchParams.get('providerAccountId');
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');

    if (provider === 'google' && providerAccountId) {
      setEmail(emailParam || '');
      setName(nameParam || '');
    }
  }, [searchParams]);

  const isGoogleSignup = searchParams.get('provider') === 'google' && searchParams.get('providerAccountId');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const provider = searchParams.get('provider');
    const providerAccountId = searchParams.get('providerAccountId');

    try {
      const requestBody: any = {
        type: 'user',
        email,
        name,
        loginType: provider === 'google' ? 'google' : 'email',
      };

      if (provider === 'google' && providerAccountId) {
        requestBody.extra = { providerAccountId };
      } else {
        requestBody.password = password;
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.ok || data._id) {
        let loginData = data;

        if (!isGoogleSignup && email && password) {
          const loginRes = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          loginData = await loginRes.json();
        }

        if (loginData.ok) {
          const userItem = loginData.item || loginData.user || loginData;
          const accessToken = userItem.token?.accessToken || loginData.accessToken;
          const userStore = {
            _id: userItem._id,
            email: userItem.email || email,
            name: userItem.name || name,
            type: userItem.type,
            image: userItem.image,
            loginType: isGoogleSignup ? 'google' : 'email',
            accessToken,
            token: {
              accessToken,
              refreshToken: userItem.token?.refreshToken || loginData.refreshToken,
            },
          };
          setUser(userStore);
          router.push('/');
        } else {
          router.push('/login');
        }
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).map((err: any) => err.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || '회원가입에 실패했습니다.');
        }
        setLoading(false);
      }
    } catch (err) {
      setError('오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4">
      <header className="max-w-md mx-auto py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-black text-xl tracking-tight">
          <TrendingUp size={28} />
          주주플로우
        </Link>
      </header>

      <main className="max-w-md mx-auto mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-2xl">
              <TrendingUp className="text-white" size={48} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">회원가입</h1>
          <p className="text-gray-500 text-center mb-8">주주플로우에 오신 것을 환영합니다</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

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

            {!isGoogleSignup && (
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
                    required={!isGoogleSignup}
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
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              로그인
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600"
        >
          <ArrowLeft size={20} />
          메인으로
        </Link>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>로딩 중...</p></div>}>
      <SignupForm />
    </Suspense>
  );
}
