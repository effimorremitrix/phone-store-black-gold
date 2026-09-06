import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'public');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/trpc/')){
  const procs=url.pathname.slice('/api/trpc/'.length).split(',');
  const results=procs.map(p=>({result:{data:{json:p==='managedCatalog.changes'?{products:[]}:p==='storefront.sourceData'?{status:'unavailable',data:null}:{status:'unavailable',message:'Original private backend is not part of this public website snapshot.'}}}}));
  res.writeHead(200,{'Content-Type':types['.json']});return res.end(JSON.stringify(url.searchParams.has('batch')?results:results[0]));
 }
 let target=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403);return res.end();}
 if(!fs.existsSync(target)||fs.statSync(target).isDirectory()){
  if(path.extname(target)){res.writeHead(404);return res.end('Not found');}
  target=path.join(root,'index.html');
 }
 res.writeHead(200,{'Content-Type':types[path.extname(target)]??'application/octet-stream'});fs.createReadStream(target).pipe(res);
}).listen(process.env.PORT??4173,'127.0.0.1',()=>console.log('Phone Store: http://localhost:'+(process.env.PORT??4173)));
