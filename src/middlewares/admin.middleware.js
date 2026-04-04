import User from '../models/user.model.js';

const adminMiddleware = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware which runs before this one
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. You do not have admin privileges' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error while checking permissions' });
    }
};

export default adminMiddleware;
