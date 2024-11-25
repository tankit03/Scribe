import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { notebookId, email } = await req.json();

  if (!notebookId || !email) {
    return NextResponse.json(
      { error: 'Notebook ID and email are required' },
      { status: 400 }
    );
  }

  // Create a Supabase client with admin privileges
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure SERVICE_ROLE_KEY is properly set
  );

  try {
    // Fetch the user by email
    const { data: user, error: userError } =
      await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Insert a new row in notebook_details for the shared user
    const { error: insertError } = await supabaseAdmin
      .from('notebook_details')
      .insert({
        notebook_id: notebookId,
        user_id: user.id, // Shared user's ID
      });

    if (insertError) {
      console.error('Error sharing notebook:', insertError);
      return NextResponse.json(
        { error: 'Failed to share the notebook' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: `Notebook shared successfully with ${email}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error while sharing notebook:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
