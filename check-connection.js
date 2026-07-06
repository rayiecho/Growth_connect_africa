require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL set:', !!url);
console.log('Key set:', !!key);

if (!url || !key) {
  console.log('RESULT: Missing env vars — stop here, fix .env.local first.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const { data, error, count } = await supabase
    .from('applicants')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('RESULT: Could not reach "applicants" table.');
    console.log('Error:', error.message);
  } else {
    console.log('RESULT: Connected successfully. Row count in applicants:', count);
  }
}
check();
