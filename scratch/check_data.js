const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://aizmzlaeubholfdzcbfw.supabase.co',
  `${ process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }`
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
