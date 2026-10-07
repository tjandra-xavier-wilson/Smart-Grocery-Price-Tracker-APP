// Vercel Serverless Function: Health Check & Environment Verification

module.exports = (req, res) => {
  const hasUrl = !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  res.status(200).json({
    status: 'ok',
    appName: 'Smart Grocery Price Tracker & Budget Safety Cap',
    timestamp: new Date().toISOString(),
    environment: {
      supabaseConfigured: hasUrl && hasKey,
      vercelRegion: process.env.VERCEL_REGION || 'local'
    }
  });
};
