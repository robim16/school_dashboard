const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpem16bGFldWJob2xmZHpjYmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMjg1MiwiZXhwIjoyMDkxNDk4ODUyfQ.f1WhgrNBV96ZWZTeJCnk1iO1Jq8yyNPyTamGFridqCg'
)

async function check() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) console.error(error)
  else console.log('Users in Auth:', users.map(u => u.email))
}

check()
