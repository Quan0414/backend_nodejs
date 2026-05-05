import express from 'express';
const router = express.Router();
import { adminController } from '../controllers/index.js';
import { authMiddleware, adminMiddleware } from '../middlewares/index.js';

// Protect all admin routes: User must be logged in AND must have admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin CRUD operations on Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
