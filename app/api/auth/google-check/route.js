import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = 
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    'https://ihickxbofezjqxncegda.supabase.co';

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (res.status === 400) {
      const data = await res.json().catch(() => ({}));
      // Di dashboard Supabase (https://supabase.com/dashboard):
      // Buka menu Authentication -> Providers -> Google,
      // aktifkan toggle "Enable Google provider", lalu isi Client ID dan Client Secret dari Google Cloud Console.
      return NextResponse.json({
        enabled: false,
        error: data.msg || 'Unsupported provider: provider is not enabled',
        code: 400
      });
    }

    return NextResponse.json({
      enabled: true,
      status: res.status
    });
  } catch (err) {
    return NextResponse.json({
      enabled: false,
      error: err.message
    });
  }
}
