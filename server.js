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

const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL || process.env.frontend_url;
if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    try {
        const url = new URL(frontendUrl);
        allowedOrigins.push(url.origin);
    } catch (e) {}
}

// Clean and deduplicate origins (trim whitespace and remove trailing slashes)
const cleanOrigins = [...new Set(allowedOrigins.map(o => o.trim().replace(/\/$/, '')))];
console.log('Configured CORS origins:', cleanOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        if (cleanOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        } else {
            console.log(`[CORS Request Blocked] Origin: "${origin}" is not in allowed list:`, cleanOrigins);
            return callback(null, false);
        }
    },
    credentials: true
}));
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
