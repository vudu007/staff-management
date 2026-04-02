import { Router } from 'express';
import { InductionService } from './induction.service';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
const inductionService = new InductionService();

// Define allowed roles locally (since we use strings now)
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VIEWER: 'VIEWER'
};

router.use(authenticate);

// Get all inductions
router.get('/', async (req, res, next) => {
  try {
    const inductions = await inductionService.getAllInductions();
    res.json({ success: true, data: inductions });
  } catch (error) {
    next(error);
  }
});

// Get a single induction by ID
router.get('/:id', async (req, res, next) => {
  try {
    const induction = await inductionService.getInductionById(req.params.id);
    res.json({ success: true, data: induction });
  } catch (error) {
    next(error);
  }
});

// Create induction
router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      startDate: new Date(req.body.startDate),
    };
    const induction = await inductionService.createInduction(data);
    res.status(201).json({ success: true, data: induction });
  } catch (error) {
    next(error);
  }
});

// Update induction
router.patch('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.completionDate) data.completionDate = new Date(data.completionDate);

    const induction = await inductionService.updateInduction(req.params.id, data);
    res.json({ success: true, data: induction });
  } catch (error) {
    next(error);
  }
});

// Delete induction
router.delete('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res, next) => {
  try {
    await inductionService.deleteInduction(req.params.id);
    res.json({ success: true, message: 'Induction record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
