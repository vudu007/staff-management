import { Router } from 'express';
import { StoreService } from './store.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const storeService = new StoreService();

router.use(authenticate);

router.get('/', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const stores = await storeService.getAll(req.query);
    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const store = await storeService.getById(req.params.id);
    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/:id/staff', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const staff = await storeService.getStaff(req.params.id);
    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.get('/:id/analytics', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const analytics = await storeService.getAnalytics(req.params.id);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRole('ADMIN'), auditLog({ action: 'CREATE', entityType: 'STORE' }), async (req: AuthRequest, res) => {
  try {
    const store = await storeService.create(req.body);
    res.status(201).json({ success: true, data: store });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', requireRole('ADMIN'), auditLog({ action: 'UPDATE', entityType: 'STORE', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const store = await storeService.update(req.params.id, req.body);
    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('SUPER_ADMIN'), auditLog({ action: 'DELETE', entityType: 'STORE', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await storeService.delete(req.params.id);
    res.json({ success: true, message: 'Store deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
