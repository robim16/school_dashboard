const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpem16bGFldWJob2xmZHpjYmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMjg1MiwiZXhwIjoyMDkxNDk4ODUyfQ.f1WhgrNBV96ZWZTeJCnk1iO1Jq8yyNPyTamGFridqCg',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const emails = [
  'admin@edustream.com',
  'sarah.green@edustream.com',
  'mark.wilson@edustream.com',
  'elena.rod@edustream.com',
  'john.doe@student.com',
  'jane.smith@student.com',
  'mike.ross@student.com',
  'sarah.lee@student.com',
  'alex.vance@student.com'
]

async function run() {
  console.log('Starting password update...')
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) return console.error(listError)

  for (const email of emails) {
    const user = users.find(u => u.email === email)
    if (user) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: 'password123' })
      if (error) console.error(`Error ${email}:`, error.message)
      else console.log(`Success: ${email}`)
    }
  }
}

run()
