const supabase = require('./src/config/supabase');
(async () => {
    const { data, error } = await supabase.from('users').select('email, name');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
})();
