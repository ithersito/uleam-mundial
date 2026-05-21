import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    SUPABASE_URL: process.env.SUPABASE_URL ? `set (${process.env.SUPABASE_URL.substring(0, 20)}...)` : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
