const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const { data: userExists, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error: createError } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
            }])
            .select()
            .single();

        if (createError) throw createError;

        if (user) {
            const token = generateToken(user.id);
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            res.status(201).json({
                success: true,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Enforce strict single-email login
        if (!email || email.toLowerCase() !== 'recrugi@gmail.com' || password !== 'recrugi@123') {
            return res.status(401).json({ success: false, message: 'Access Denied. Invalid credentials or unauthorized account.' });
        }

        // Look for the user in Supabase to get the correct user ID and role
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'recrugi@gmail.com')
            .single();

        let finalUserLayer = user;

        if (!user || findError) {
            // Auto-register the allowed user if it doesn't already exist in the db
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    name: 'Recrugi Admin',
                    email: 'recrugi@gmail.com',
                    password: hashedPassword,
                    role: 'admin'
                }])
                .select()
                .single();

            if (createError) throw createError;
            finalUserLayer = newUser;
        } else {
            // Optionally update password hash in DB if it doesn't match the new hardcoded one
            const isMatch = await bcrypt.compare(password, finalUserLayer.password);
            if (!isMatch) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                await supabase
                    .from('users')
                    .update({ password: hashedPassword })
                    .eq('email', 'recrugi@gmail.com');
            }
        }

        const token = generateToken(finalUserLayer.id);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            user: { id: finalUserLayer.id, name: finalUserLayer.name, email: finalUserLayer.email, role: finalUserLayer.role },
            token
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};
