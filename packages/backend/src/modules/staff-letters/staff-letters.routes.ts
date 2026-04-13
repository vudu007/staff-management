import { Router } from 'express';
import { StaffLettersService } from './staff-letters.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const service = new StaffLettersService();

router.use(authenticate);

router.get('/', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const result = await service.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRole('MANAGER'), auditLog({ action: 'CREATE', entityType: 'STAFF_LETTER' }), async (req: AuthRequest, res) => {
  try {
    const result = await service.createLetter(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/send', requireRole('MANAGER'), auditLog({ action: 'SEND', entityType: 'STAFF_LETTER', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const result = await service.sendLetter(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('ADMIN'), auditLog({ action: 'DELETE', entityType: 'STAFF_LETTER', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Letter deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
