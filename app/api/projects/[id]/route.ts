import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name } = await req.json()
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // First, update any chats associated with this project
  // to remove the project_id (set to null)
  await supabase
    .from('chats')
    .update({ project_id: null })
    .eq('project_id', params.id)
    .eq('user_id', user.id)

  // Then delete the project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return new NextResponse(error.message, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
