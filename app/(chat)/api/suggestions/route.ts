import { NextResponse } from 'next/server';

import { getSuggestionsByDocumentId } from '@/db/queries';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get suggestions data - this returns an object with a data property, not an array directly
    const { data: suggestions, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('document_id', documentId);
      
    if (error) {
      console.error('Error fetching suggestions:', error);
      return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }

    // Return the suggestions array
    return NextResponse.json(suggestions || [], { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
