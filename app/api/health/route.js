import { NextResponse } from 'next/server';

export async function GET() {
  const hasUrl = !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return NextResponse.json({
    status: 'ok',
    appName: 'Smart Grocery Price Tracker (GrabMart Style)',
    timestamp: new Date().toISOString(),
    environment: {
      supabaseConfigured: hasUrl && hasKey,
      vercelRegion: process.env.VERCEL_REGION || 'local',
      runtime: 'Next.js 16 App Router'
    }
  });
}
