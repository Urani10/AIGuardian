import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../store/database.js';
export const adminRouter=Router(); adminRouter.use(requireAuth,requireAdmin);
adminRouter.get('/overview', async(_req,res)=>{ const db=await readDb(); res.json({users:db.users.map(u=>({id:u.id,name:u.name,email:u.email,role:u.role,suspended:u.suspended,createdAt:u.createdAt})), analytics:{totalScans:db.scans.length,activeUsers:db.users.filter(u=>!u.suspended).length,threats:db.scans.reduce((a,s)=>({...a,[s.threatLevel]:(a[s.threatLevel]??0)+1}),{} as Record<string,number>),systemLogs:db.users.flatMap(u=>u.activity.slice(0,5).map(message=>({user:u.email,message}))).slice(0,50)}}); });
adminRouter.patch('/users/:id/suspend', async(req,res)=>{ const db=await readDb(); const u=db.users.find(x=>x.id===req.params.id); if(!u)return res.status(404).json({error:'User not found'}); u.suspended=!u.suspended; await writeDb(db); res.json({suspended:u.suspended}); });
adminRouter.delete('/users/:id', async(req,res)=>{ const db=await readDb(); db.users=db.users.filter(u=>u.id!==req.params.id); db.scans=db.scans.filter(s=>s.userId!==req.params.id); await writeDb(db); res.status(204).end(); });
