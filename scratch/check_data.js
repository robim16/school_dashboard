const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpem16bGFldWJob2xmZHpjYmZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkyMjg1MiwiZXhwIjoyMDkxNDk4ODUyfQ.f1WhgrNBV96ZWZTeJCnk1iO1Jq8yyNPyTamGFridqCg'
)

async function check() {
  const { data, error } = await supabase.rpc('execute_sql_query', { 
    sql_query: 'SELECT count(*) FROM auth.users' 
  }).catch(() => ({ error: 'RPC not available' }))

  if (error) {
    // If RPC isn't available, we can try to just select from a public table
    const { count, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    console.log('Profiles count:', count)
    if (countError) console.error(countError)
  } else {
    console.log('Auth Users count:', data)
  }
}

check()
