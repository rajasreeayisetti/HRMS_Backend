const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const supabase = require('./src/config/supabase');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
    try {
        const { data: adminExists } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@example.com')
            .single();

        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            await supabase
                .from('users')
                .insert([{
                    name: 'Admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'admin'
                }]);

            console.log('Admin seeded in Supabase: admin@example.com / password123');
        }
        // 2. Regular Company User
        const { data: userExists2 } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'company@example.com')
            .single();

        if (!userExists2) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            await supabase
                .from('users')
                .insert([{
                    name: 'Company_101',
                    email: 'company@example.com',
                    password: hashedPassword,
                    role: 'company'
                }]);

            console.log('Company User seeded: company@example.com OR Company_101 / password123');
        }
    } catch (err) {
        console.log('Seeder error', err);
    }
};
seedAdmin();



const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const authRoutes = require('./src/routes/auth.routes');
const candidateRoutes = require('./src/routes/candidate.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
