import { Router } from 'express';
import { AuthService } from './auth.service';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

export default router;
