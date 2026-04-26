import express from 'express';
import { Bill } from '../models/Bill.ts';
import { SSGCBill } from '../models/SSGCBill.ts';
import { authMiddleware, AuthRequest } from '../middleware/auth.ts';
import { demoBills } from '../lib/demoStore.ts';

const router = express.Router();

// Save a new analyzed bill
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    const { bill_type } = req.body;

    if (isDemo) {
      const newBill = {
        ...req.body,
        _id: Math.random().toString(36).substring(7),
        user: req.user?.id,
        created_at: new Date().toISOString()
      };
      demoBills.push(newBill);
      return res.status(201).json(newBill);
    }

    if (bill_type === 'SSGC') {
      const newSSGCBill = new SSGCBill({
        ...req.body,
        user: req.user?.id
      });
      await newSSGCBill.save();
      return res.status(201).json(newSSGCBill);
    } else {
      const newBill = new Bill({
        ...req.body,
        user: req.user?.id,
        bill_type: 'KE'
      });
      await newBill.save();
      return res.status(201).json(newBill);
    }
  } catch (error: any) {
    console.error('Save bill error:', error);
    res.status(500).json({ 
      message: 'Error saving bill', 
      error: error.message || 'Unknown database error' 
    });
  }
});

// Get all bills for the logged-in user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const isDemo = (req as any).isDemoMode;
  try {
    let keBills: any[] = [];
    let ssgcBills: any[] = [];

    if (isDemo) {
      const userBills = demoBills.filter(b => b.user === req.user?.id);
      keBills = userBills.filter(b => b.bill_type !== 'SSGC');
      ssgcBills = userBills.filter(b => b.bill_type === 'SSGC');
    } else {
      keBills = await Bill.find({ user: req.user?.id }).sort({ created_at: -1 });
      ssgcBills = await SSGCBill.find({ user: req.user?.id }).sort({ created_at: -1 });
    }
    
    // Combine for general history, tagged by type
    const combined = [
      ...keBills.map(b => ({ ...(isDemo ? b : b.toObject()), bill_type: 'KE' })),
      ...ssgcBills.map(b => ({ ...(isDemo ? b : b.toObject()), bill_type: 'SSGC' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

export default router;
