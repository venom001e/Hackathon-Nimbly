import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing username or password' },
        { status: 400 }
      )
    }

    const user = validateCredentials(username, password)

    if (user) {
      return NextResponse.json({
        success: true,
        user,
        message: 'Login successful'
      })
    }

    return NextResponse.json(
      { error: 'Wrong username or password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
