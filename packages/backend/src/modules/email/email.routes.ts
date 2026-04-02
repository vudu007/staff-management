import { Router } from 'express';
import { EmailService } from './email.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
const emailService = new EmailService();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.post('/send', async (req: AuthRequest, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, message: 'to, subject, and body required' });
    }
    const result = await emailService.sendEmail(to, subject, body);
    res.json({ success: result.success, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/credentials', async (req: AuthRequest, res) => {
  try {
    const { staffIds, recipient } = req.body;
    if (!staffIds || !recipient) {
      return res.status(400).json({ success: false, message: 'staffIds and recipient required' });
    }
    const result = await emailService.sendCredentials(staffIds, recipient);
    res.json({ success: result.success, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/smtp-configs', async (req: AuthRequest, res) => {
  try {
    const configs = await emailService.getSmtpConfigs();
    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/smtp-configs', async (req: AuthRequest, res) => {
  try {
    const config = await emailService.createSmtpConfig(req.body);
    res.status(201).json({ success: true, data: config });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/smtp-configs/:id', async (req: AuthRequest, res) => {
  try {
    const config = await emailService.updateSmtpConfig(req.params.id, req.body);
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/smtp-configs/:id', async (req: AuthRequest, res) => {
  try {
    await emailService.deleteSmtpConfig(req.params.id);
    res.json({ success: true, message: 'SMTP config deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
