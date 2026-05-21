import { NextResponse } from 'next/server';

export async function GET() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'vars not set' });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    const text = await res.text();
    return NextResponse.json({ status: res.status, body: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
