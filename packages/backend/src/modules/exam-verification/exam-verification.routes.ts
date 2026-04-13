import { Router } from 'express';
import { ExamVerificationService } from './exam-verification.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const service = new ExamVerificationService();

router.use(authenticate);

// Get verifications for a specific staff member
router.get('/staff/:staffId', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const results = await service.getStaffVerifications(req.params.staffId);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Run verification
router.post('/', requireRole('MANAGER'), auditLog({ action: 'VERIFY_EXAM', entityType: 'STAFF' }), async (req: AuthRequest, res) => {
  try {
    const { staffId, examBody, examType, examYear, examNumber, pin } = req.body;
    
    if (!staffId || !examBody || !examYear || !examNumber) {
      return res.status(400).json({ success: false, message: 'Missing required exam parameters' });
    }

    const verification = await service.verifyExam({ staffId, examBody, examType, examYear, examNumber, pin });
    res.status(201).json({ success: true, data: verification });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
