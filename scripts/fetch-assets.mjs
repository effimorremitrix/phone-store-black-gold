import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'source/asset-manifest.json'),'utf8'));
const pending=manifest.assets.filter(a=>!fs.existsSync(path.join(root,'public',a.path)));
await Promise.all(Array.from({length:12},async()=>{while(pending.length){const a=pending.shift();const r=await fetch(a.url,{headers:{'Accept-Encoding':'identity'},signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`Image download failed: ${a.url}`);const b=Buffer.from(await r.arrayBuffer());if(crypto.createHash('sha256').update(b).digest('hex')!==a.sha256)throw Error(`Image changed since capture: ${a.url}`);const p=path.join(root,'public',a.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);}}));
