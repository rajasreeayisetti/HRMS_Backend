const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', decoded.id)
            .single();
        
        if (!user || error) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

module.exports = { protect };
