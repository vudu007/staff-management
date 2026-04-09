import { Router } from 'express';
import { ReportService } from './report.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
const reportService = new ReportService();

router.use(authenticate);
router.use(requireRole('VIEWER'));

router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const dashboard = await reportService.getDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/staff', async (req: AuthRequest, res) => {
  try {
    const report = await reportService.getStaffReport(req.query);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/*
router.get('/attendance', async (req: AuthRequest, res) => {
  try {
    const report = await reportService.getAttendanceReport(req.query);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
*/

router.get('/performance', async (req: AuthRequest, res) => {
  try {
    const report = await reportService.getPerformanceReport(req.query);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
