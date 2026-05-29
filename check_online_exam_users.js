const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/online-exam-system');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in online-exam-system:', collections.map(c => c.name));
        if (collections.some(c => c.name === 'users')) {
            const users = await mongoose.connection.db.collection('users').find({}).toArray();
            console.log('Found users in online-exam-system:', users.length);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();
