import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth cancellation
  if (error) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }

  // Validate code parameter
  if (!code) {
    return NextResponse.json(
      { error: 'Missing code parameter' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Exchange code for session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    console.error('Exchange code for session error:', exchangeError);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }

  // Success: redirect to home
  return NextResponse.redirect(new URL('/', request.url));
}
