const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('Found users in MongoDB:', users.length);
        if (users.length > 0) {
            console.log('First user example:', JSON.stringify(users[0], null, 2));
            // Show all emails found
            console.log('All emails:', users.map(u => u.email));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();
