(async () => {
    const testEmail = `test_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const testPassword = 'password123';

    try {
        console.log(`Attempting login with new user: ${testEmail}`);
        const response = await fetch('${API_URL}/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });

        const data = await response.json();
        console.log('Login Response:', data);

        // Verify in Supabase
        const supabase = require('./src/config/supabase');
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', testEmail)
            .single();

        if (user) {
            console.log('User successfully created and found in Supabase:', user.email);
            console.log('Verification Success!');
        } else {
            console.log('User NOT found in Supabase.', error);
        }

    } catch (err) {
        console.error('Error during login/verification:', err.message);
    }
})();

