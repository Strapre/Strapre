// 1. First, let's add debugging to your existing api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // ADD THESE DEBUG LOGS
  console.log('=== CALLBACK DEBUG ===')
  console.log('Full URL:', request.url)
  console.log('Code present:', !!code)
  console.log('Error:', error)
  console.log('All query params:', Object.fromEntries(requestUrl.searchParams.entries()))
  console.log('=====================')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth error:', error, errorDescription)
    
    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      return NextResponse.redirect(`${requestUrl.origin}/get-started?error=expired`)
    }
    
    return NextResponse.redirect(`${requestUrl.origin}?error=${error}`)
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Exchange code for session
      const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (authError) {
        console.error('Session exchange error:', authError)
        return NextResponse.redirect(`${requestUrl.origin}?error=session_failed`)
      }
      
      if (session?.user) {
        console.log('User authenticated:', session.user.id, session.user.email)
        
        // Check if user exists in our users table
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('id, username, email')
          .eq('id', session.user.id)
          .single()

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Error checking existing user:', selectError)
        }

        console.log('Existing user check:', { existingUser, selectError })

        if (!existingUser) {
          // Create new user record
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              location: {},
              image_count: 0,
              badge_tier: 1,
              reaction_count: 0,
              post_count: 0
            })

          if (insertError) {
            console.error('Error creating user:', insertError)
          } else {
            console.log('User created successfully')
          }

          // New user - redirect to setup
          console.log('Redirecting new user to setup')
          return NextResponse.redirect(`${requestUrl.origin}/setup`)
        } else if (!existingUser.username) {
          // User exists but no username - redirect to setup
          console.log('Redirecting existing user to setup')
          return NextResponse.redirect(`${requestUrl.origin}/setup`)
        } else {
          // Complete user - redirect to feed
          console.log('Redirecting complete user to feed')
          return NextResponse.redirect(`${requestUrl.origin}/feed`)
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}?error=auth_callback_failed`)
    }
  }

  // IF NO CODE - this is where the hash parameters are coming from
  console.log('No code parameter found - likely implicit flow')
  
  // Instead of showing the raw URL, redirect to a page that handles client-side auth
  return NextResponse.redirect(`${requestUrl.origin}/auth/verify`)
}
