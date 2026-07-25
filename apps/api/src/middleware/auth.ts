import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/auth.js';
import { readDb } from '../store/database.js';
declare global { namespace Express { interface Request { user?: { id:string; email:string; role:'user'|'admin' } } } }
function cookie(req:Request,name:string){return req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${name}=`))?.split('=').slice(1).join('=');}
export async function requireAuth(req:Request,res:Response,next:NextFunction){const header=req.headers.authorization?.replace('Bearer ',''); const token=header??cookie(req,'token'); if(!token)return res.status(401).json({error:'Authentication required'}); try{const payload=verifyToken(token); const db=await readDb(); const user=db.users.find(u=>u.id===payload.id); if(!user||user.suspended)return res.status(403).json({error:'Account unavailable'}); req.user=payload; next();}catch{return res.status(401).json({error:'Invalid or expired session'});}}
export function requireAdmin(req:Request,res:Response,next:NextFunction){ if(req.user?.role!=='admin') return res.status(403).json({error:'Admin access required'}); next(); }
