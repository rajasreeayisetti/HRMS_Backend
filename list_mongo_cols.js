const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();
