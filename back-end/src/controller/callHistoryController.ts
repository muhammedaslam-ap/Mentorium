import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { CallHistory } from '../config/socketIO';
import mongoose from 'mongoose';

export class CallHistoryController {
  async getCallHistory(req: CustomRequest, res: Response) {
    try {
      const { role } = req.user;
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Missing or invalid userId' });
      }

      if (!['tutor', 'student'].includes(role)) {
        return res.status(403).json({ message: 'Invalid role' });
      }
    const populateField = role === 'tutor' ? 'studentId' : 'tutorId';

       let calls

      const objectId = new mongoose.Types.ObjectId(userId);
      if( role === 'tutor'){
        console.log("here im")
       calls= await CallHistory.find({ tutorId: userId })
        .populate(populateField, 'name')
        .sort({ startTime: -1 });
      }else{
        calls = await CallHistory.find({ studentId: userId  })
        .populate(populateField, 'name')
        .sort({ startTime: -1 });
      }  
;
      console.log('[DEBUG] Role:', role);
      console.log('[DEBUG] Number of calls returned:', calls);

      return res.status(200).json({ data: calls });
    } catch (err) {
      console.error('[ERROR] getCallHistory:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
