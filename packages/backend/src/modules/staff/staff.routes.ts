import { Router } from 'express';
import { StaffService } from './staff.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { parseCsv, generateCsv } from '../../utils/csv';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const router = Router();
const staffService = new StaffService();
const upload = multer({ dest: os.tmpdir() });

router.use(authenticate);

router.get('/', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const result = await staffService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/export', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const { storeId, status, position } = req.query;
    const staff = await staffService.getAllForExport({
      storeId: storeId as string,
      status: status as string,
      position: position as string,
    });

    const headers = ['Store', 'Staff ID', 'First Name', 'Last Name', 'Position', 'Phone', 'Email', 'Status', 'Hire Date'];
    const rows = staff.map(s => [
      s.store.name, s.staffId, s.firstName, s.lastName, s.position, s.phone || '', s.email || '', s.status, s.hireDate ? new Date(s.hireDate).toISOString().split('T')[0] : ''
    ]);

    const csvContent = generateCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="staff_export_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/import', requireRole('ADMIN'), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const rows = await parseCsv(req.file.path);
    const result = await staffService.importStaff(rows);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRole('MANAGER'), auditLog({ action: 'CREATE', entityType: 'STAFF' }), async (req: AuthRequest, res) => {
  try {
    const result = await staffService.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk-delete', requireRole('ADMIN'), auditLog({ action: 'DELETE', entityType: 'STAFF' }), async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'IDs array required' });
    }
    const count = await staffService.bulkDelete(ids);
    res.json({ success: true, data: { deleted: count } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk-transfer', requireRole('ADMIN'), auditLog({ action: 'UPDATE', entityType: 'STAFF' }), async (req: AuthRequest, res) => {
  try {
    const { ids, storeId } = req.body;
    if (!ids || !storeId) {
      return res.status(400).json({ success: false, message: 'IDs and storeId required' });
    }
    const count = await staffService.bulkTransfer(ids, storeId);
    res.json({ success: true, data: { transferred: count } });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:id', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const staff = await staffService.getById(req.params.id);
    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.put('/:id', requireRole('MANAGER'), auditLog({ action: 'UPDATE', entityType: 'STAFF', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const staff = await staffService.update(req.params.id, req.body);
    res.json({ success: true, data: staff });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('ADMIN'), auditLog({ action: 'DELETE', entityType: 'STAFF', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await staffService.delete(req.params.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
