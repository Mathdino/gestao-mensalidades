import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.redirect('/')
}
