const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('========================================================================');
    console.error('FATAL ERROR: SUPABASE_URL or SUPABASE_KEY is not defined.');
    console.error('Please configure these in your Railway dashboard under the "Variables" tab.');
    console.error('========================================================================');
    throw new Error('Supabase URL and Key are required environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
