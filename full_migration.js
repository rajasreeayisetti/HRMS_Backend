const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mongoCandidates = await mongoose.connection.db.collection('candidates').find({}).toArray();
        console.log(`Found ${mongoCandidates.length} candidates in MongoDB.`);

        if (mongoCandidates.length > 0) {
            const formatted = mongoCandidates.map(c => ({
                name: c.name,
                email: c.email || `missing_${Math.random()}@example.com`,
                phone: c.phone || '',
                role: c.role || '',
                department: c.department || '',
                total_fee: c.totalFee || 0,
                paid_amount: c.paidAmount || 0,
                due_amount: c.dueAmount || 0,
                status: c.status || 'Pending'
            }));

            const { error } = await supabase.from('candidates').upsert(formatted, { onConflict: 'email' });
            if (error) throw error;
            console.log('Candidates migrated successfully!');
        }

        const mongoUsers = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${mongoUsers.length} users in MongoDB.`);

        if (mongoUsers.length > 0) {
            const formattedUsers = mongoUsers.map(u => ({
                name: u.name,
                email: u.email,
                password: u.password, // Be careful: MongoDB and Supabase should use the same hashing or bcrypt here
                role: u.role || 'user'
            }));

            const { error: userError } = await supabase.from('users').upsert(formattedUsers, { onConflict: 'email' });
            if (userError) throw userError;
            console.log('Users migrated successfully!');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Migration error:', err);
    }
})();
