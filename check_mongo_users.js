const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, default: 'user' }
});

const User = mongoose.model('User', userSchema);

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('Found users in MongoDB:', JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();
