const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data, error } = await supabase
    .from('candidates')
    .select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
})();
