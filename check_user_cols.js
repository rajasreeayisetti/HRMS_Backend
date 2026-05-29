const supabase = require('./src/config/supabase');
(async () => {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) throw error;
        if (data && data.length > 0) {
            console.log('Columns in users table:', Object.keys(data[0]));
        } else {
            console.log('No users found to check columns.');
        }
    } catch (err) {
        console.error('Error checking columns:', err);
    }
})();
