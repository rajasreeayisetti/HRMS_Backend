const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

const addUser = async (name, email, password, role = 'user') => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const { data, error } = await supabase
            .from('users')
            .upsert([{
                name,
                email,
                password: hashedPassword,
                role
            }], { onConflict: 'email' });

        if (error) throw error;
        console.log(`User added: ${email} / ${password}`);
    } catch (err) {
        console.error('Error adding user:', err);
    }
};

(async () => {
    await addUser('Test User', 'user@example.com', 'password123');
})();
