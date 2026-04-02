import { Router } from 'express';
import { UserService } from './user.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const userService = new UserService();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', async (req: AuthRequest, res) => {
  try {
    const users = await userService.getAll();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', auditLog({ action: 'CREATE', entityType: 'USER' }), async (req: AuthRequest, res) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', auditLog({ action: 'UPDATE', entityType: 'USER', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auditLog({ action: 'DELETE', entityType: 'USER', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await userService.delete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
