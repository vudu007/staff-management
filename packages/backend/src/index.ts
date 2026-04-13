import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import staffRoutes from './modules/staff/staff.routes';
import storeRoutes from './modules/store/store.routes';
import performanceRoutes from './modules/performance/performance.routes';
import userRoutes from './modules/user/user.routes';
import reportRoutes from './modules/report/report.routes';
import emailRoutes from './modules/email/email.routes';
import inductionRoutes from './modules/induction/induction.routes';
import storeInventoryRoutes from './modules/store-inventory/store-inventory.routes';
import storeRequisitionRoutes from './modules/store-requisition/store-requisition.routes';
import staffLettersRoutes from './modules/staff-letters/staff-letters.routes';
import examVerificationRoutes from './modules/exam-verification/exam-verification.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Staff Management API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/induction', inductionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/email', emailRoutes);

app.use('/api/store-inventory', storeInventoryRoutes);
app.use('/api/store-requisitions', storeRequisitionRoutes);
app.use('/api/staff-letters', staffLettersRoutes);
app.use('/api/exam-verification', examVerificationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
