const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpem16bGFldWJob2xmZHpjYmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMjg1MiwiZXhwIjoyMDkxNDk4ODUyfQ.f1WhgrNBV96ZWZTeJCnk1iO1Jq8yyNPyTamGFridqCg',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const usersToCreate = [
  { email: 'admin@example.com', name: 'Admin User', role: 'admin' },
  { email: 'teacher@example.com', name: 'Teacher User', role: 'teacher' },
  { email: 'student@example.com', name: 'Student User', role: 'student' }
]

async function setup() {
  console.log('--- Database Credential Setup ---')
  
  for (const u of usersToCreate) {
    try {
      // First, check if user exists
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const existing = users.find(ex => ex.email === u.email)
      
      if (existing) {
        console.log(`User ${u.email} already exists. Updating password...`)
        await supabase.auth.admin.updateUserById(existing.id, { password: 'password123' })
      } else {
        console.log(`Creating user ${u.email}...`)
        const { data, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: 'password123',
          email_confirm: true,
          user_metadata: { full_name: u.name, role: u.role }
        })
        
        if (error) {
          console.error(`Failed to create ${u.email}: ${error.message}`)
          // If it fails due to trigger, we might need to insert into profiles manually if possible
          // but we can't bypass trigger failures here easily.
        } else {
          console.log(`SUCCESS: Created ${u.email}`)
        }
      }
    } catch (err) {
      console.error(`Unexpected error for ${u.email}:`, err.message)
    }
  }
}

setup()
