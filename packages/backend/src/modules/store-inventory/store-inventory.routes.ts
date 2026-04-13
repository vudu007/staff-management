import { Router } from 'express';
import { StoreInventoryService } from './store-inventory.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';
import { parseCsv } from '../../utils/csv';
import multer from 'multer';
import * as fs from 'fs';
import * as os from 'os';

const router = Router();
const service = new StoreInventoryService();
const upload = multer({ dest: os.tmpdir() });

router.use(authenticate);

router.get('/', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const result = await service.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRole('MANAGER'), auditLog({ action: 'CREATE', entityType: 'STORE_INVENTORY' }), async (req: AuthRequest, res) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/import', requireRole('MANAGER'), upload.single('file'), auditLog({ action: 'IMPORT', entityType: 'STORE_INVENTORY' }), async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.body;
    if (!storeId) {
      return res.status(400).json({ success: false, message: 'storeId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const rows = await parseCsv(req.file.path);
    const result = await service.importInventory(storeId, rows);
    fs.unlinkSync(req.file.path);
    res.json({ success: true, ...result });
  } catch (error: any) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', requireRole('MANAGER'), auditLog({ action: 'UPDATE', entityType: 'STORE_INVENTORY', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const result = await service.update(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('ADMIN'), auditLog({ action: 'DELETE', entityType: 'STORE_INVENTORY', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Inventory item deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
