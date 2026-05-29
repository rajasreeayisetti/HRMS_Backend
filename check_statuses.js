const supabase = require('./src/config/supabase');
(async () => {
    const { data, error } = await supabase.from('candidates').select('status, paid_amount');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
})();
