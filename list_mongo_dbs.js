const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();
