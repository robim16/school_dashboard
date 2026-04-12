const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpem16bGFldWJob2xmZHpjYmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMjg1MiwiZXhwIjoyMDkxNDk4ODUyfQ.f1WhgrNBV96ZWZTeJCnk1iO1Jq8yyNPyTamGFridqCg',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const mockUsers = [
  { email: 'admin@edustream.com', full_name: 'Edustream Admin', role: 'admin' },
  { email: 'sarah.green@edustream.com', full_name: 'Sarah Green', role: 'teacher' },
  { email: 'mark.wilson@edustream.com', full_name: 'Mark Wilson', role: 'teacher' },
  { email: 'elena.rod@edustream.com', full_name: 'Elena Rodriguez', role: 'teacher' },
  { email: 'john.doe@student.com', full_name: 'John Doe', role: 'student' },
  { email: 'jane.smith@student.com', full_name: 'Jane Smith', role: 'student' },
  { email: 'mike.ross@student.com', full_name: 'Mike Ross', role: 'student' },
  { email: 'sarah.lee@student.com', full_name: 'Sarah Lee', role: 'student' },
  { email: 'alex.vance@student.com', full_name: 'Alex Vance', role: 'student' }
]

async function run() {
  console.log('Registering users via Admin API...')
  for (const user of mockUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: user.full_name, role: user.role }
    })
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`User ${user.email} already exists.`)
      } else {
        console.error(`Error ${user.email}:`, error.message)
      }
    } else {
      console.log(`Successfully created: ${user.email}`)
    }
  }
}

run()
