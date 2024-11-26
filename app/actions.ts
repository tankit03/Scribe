'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  // Type-casting here for convenience
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}


export async function signup(formData: FormData) {
  console.log('signup action');
  const supabase = await createClient();

  // Type-casting here for convenience
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Derive full name from the email
  const fullName = email.split('@')[0];

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Include the derived full name here
      },
    },
  });

  if (error) {
    console.error(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
