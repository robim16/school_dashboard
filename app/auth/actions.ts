'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/auth/signin?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        role: formData.get('role') as string || 'student',
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/auth/signup?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function registerTeacher(formData: FormData) {
  const supabase = createClient()
  const adminClient = createAdminClient()

  // 1. Verify caller is admin
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Only admins can register teachers')
  }

  // 2. Extract data
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  const password = 'Welcome123!' // Fixed default password

  // 3. Create user via Admin API
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role: 'teacher'
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/teachers')
  return { success: true }
}
