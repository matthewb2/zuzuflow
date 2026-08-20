import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL + '/users/';
const LOGIN_URL = process.env.API_URL + '/users/login';
const SIGNUP_OAUTH_URL = process.env.API_URL + '/users/signup/oauth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, loginType, extra } = body;

    const providerAccountId = extra?.providerAccountId;

    if (loginType === 'google' && providerAccountId) {
      const response = await fetch(SIGNUP_OAUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-id': 'zuzuflow'
        },
        body: JSON.stringify({
          type: 'user',
          loginType: 'google',
          email: body.email,
          name: body.name,
          image: body.image,
          extra: { providerAccountId },
        }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && (data.ok || data._id)) {
        return NextResponse.json({
          ok: 1,
          item: data.item || data,
          accessToken: data.item?.token?.accessToken || data.token?.accessToken,
          email: data.email || data.item?.email,
          name: data.name || data.item?.name,
          image: data.image || data.item?.image,
        });
      }

      return NextResponse.json({ ok: 0, message: data?.message || 'Google signup failed.' });
    }

    if (email && password && !body.name) {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'client-id': 'zuzuflow'
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && data.ok) {
        return NextResponse.json({
          ok: 1,
          item: data.item || data.user,
          accessToken: data.item?.token?.accessToken || data.token?.accessToken
        });
      }

      return NextResponse.json({ ok: 0, message: data?.message || 'Invalid email or password.' });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': 'zuzuflow'
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = null; }

    if (data) {
      return NextResponse.json(data);
    }
    return NextResponse.json({ ok: 0, message: 'Server error. Please try again.' }, { status: 500 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ ok: 0, message: 'An error occurred.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ ok: 0, message: 'User ID required.' }, { status: 400 });
    }

    const response = await fetch(`${API_URL}${_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'client-id': 'zuzuflow'
      },
      body: JSON.stringify(updateData),
    });

    const text = await response.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = null; }

    if (data) {
      return NextResponse.json(data);
    }
    return NextResponse.json({ ok: 0, message: 'Server error.' }, { status: 500 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ ok: 0, message: 'An error occurred.' }, { status: 500 });
  }
}
