import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Refresh the user's session
  const response = await updateSession(request)

  const supabase = await createClient()

  // Validate user authentication
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    // Redirect unauthorized users to the login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
