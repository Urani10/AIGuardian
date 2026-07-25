import { createHmac, pbkdf2 as pbkdf2Callback, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { env } from '../config/env.js';
const pbkdf2=promisify(pbkdf2Callback); const enc=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
export async function hashPassword(password:string){ const salt=randomBytes(16).toString('hex'); const hash=(await pbkdf2(password,salt,120000,32,'sha256')).toString('hex'); return `pbkdf2$${salt}$${hash}`; }
export async function verifyPassword(password:string, stored:string){ const [,salt,hash]=stored.split('$'); const candidate=(await pbkdf2(password,salt,120000,32,'sha256')).toString('hex'); return timingSafeEqual(Buffer.from(hash,'hex'),Buffer.from(candidate,'hex')); }
export function signToken(user:{id:string;email:string;role:string}, remember=false){ const payload={...user,exp:Math.floor(Date.now()/1000)+(remember?2592000:28800)}; const body=`${enc({alg:'HS256',typ:'JWT'})}.${enc(payload)}`; const sig=createHmac('sha256',env.JWT_SECRET).update(body).digest('base64url'); return `${body}.${sig}`; }
export function verifyToken(token:string){ const [h,p,s]=token.split('.'); const sig=createHmac('sha256',env.JWT_SECRET).update(`${h}.${p}`).digest('base64url'); if(sig!==s) throw new Error('bad signature'); const payload=JSON.parse(Buffer.from(p,'base64url').toString()) as {id:string;email:string;role:'user'|'admin';exp:number}; if(payload.exp < Date.now()/1000) throw new Error('expired'); return payload; }
