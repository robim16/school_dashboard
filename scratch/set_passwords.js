const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
const envConfig = dotenv.parse(fs.readFileSync(envPath))

const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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

async function initializePasswords() {
  console.log('Initializing passwords for mock users...')
  
  for (const email of emails) {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      return
    }

    const user = users.find(u => u.email === email)
    if (user) {
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: 'password123' }
      )
      
      if (error) {
        console.error(`Error updating password for ${email}:`, error.message)
      } else {
        console.log(`Password set for ${email}`)
      }
    } else {
      console.warn(`User ${email} not found`)
    }
  }
}

initializePasswords()
