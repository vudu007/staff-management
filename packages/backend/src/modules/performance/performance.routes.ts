import { Router } from 'express';
import { PerformanceService } from './performance.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const performanceService = new PerformanceService();

router.use(authenticate);

router.post('/', requireRole('MANAGER'), auditLog({ action: 'CREATE', entityType: 'PERFORMANCE' }), async (req: AuthRequest, res) => {
  try {
    const review = await performanceService.create({ ...req.body, reviewerId: req.user!.userId });
    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/summary', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const summary = await performanceService.getSummary(req.query);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:staffId', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const reviews = await performanceService.getByStaff(req.params.staffId);
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', requireRole('MANAGER'), auditLog({ action: 'UPDATE', entityType: 'PERFORMANCE', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const review = await performanceService.update(req.params.id, req.body);
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
