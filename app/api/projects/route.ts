import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { name } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        name,
        user_id: user.id
      }
    ])
    .select()
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(data)
}
