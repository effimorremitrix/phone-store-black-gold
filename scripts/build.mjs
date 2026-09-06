import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s)};
const manifest=JSON.parse(read('source/asset-manifest.json'));
function localize(s){for(const asset of manifest.assets)s=s.split(asset.url).join(asset.path);return s;}
let app=localize(read('source/deployed.js'));
const productImages=JSON.parse(localize(read('source/catalog.original.json'))).products;
for(const missing of manifest.failed){const pathname=new URL(missing.url).pathname;const match=pathname.match(/p(\d+)_/);if(match)app=app.split(pathname).join(productImages[Number(match[1])-1].imageUrl);}

function replaceOnce(before,after){if(app.split(before).length!==2)throw new Error('Source changed: '+before.slice(0,80));app=app.replace(before,after);}
const start=app.indexOf('Pf=['),end=app.indexOf('],G3=',start);
if(start<0||end<0)throw new Error('Missing storefront product boundary');
app=app.slice(0,start)+'Pf=storeCatalog.products.map(p=>({...p,category:p.categories.find(c=>["כיסויים","מגני מסך","מטענים","כבלים","אוזניות","סוללות גיבוי"].includes(c))??p.categories.at(-1)??"",image:p.imageUrl,facts:p.specifications.map(s=>[s.label,s.value]),badge:p.onSale?"מבצע":undefined}))'+app.slice(end+1);
replaceOnce('function Ku(a){return C3.has(Jf(a.name))}','function Ku(a){return a.inStock!==false}');
replaceOnce('return[...it,...xn].slice(0,15)','return[...it,...xn]');
replaceOnce('se=G3,','se=Array.from(new Set([...G3,...C.map(p=>p.category)])),');
replaceOnce('L.includes(He.category)||','(L.includes(He.category)||He.categories?.some(c=>L.includes(c)))||');
replaceOnce('K,re]=_.useState(6e3)','K,re]=_.useState(Math.max(6000,...storeCatalog.products.map(p=>p.price)))');
for(const [a,b] of [['פתיחת קטלוג CityCell המלא','לכל המלאי שלנו'],['Open the full CityCell catalog','View all store inventory'],['Открыть полный каталог CityCell','Весь ассортимент магазина'],['בקטלוג CityCell כרגע','במלאי שלנו כרגע'],['in the CityCell catalog','in our inventory'],['В каталоге CityCell','В нашем ассортименте']])app=app.split(a).join(b);
// Keep both views on the same authoritative inventory, with no supplier-only subset.
app='const storeCatalog = await fetch("/citycell-web-catalog.json").then(r=>{if(!r.ok)throw new Error("Catalog unavailable");return r.json()});\n'+app;
// Match the captured read-only backend responses on static hosting as well.
app=app.replace('fetch(a,l){return globalThis.fetch(a,{...l??{},credentials:"include"})}',`fetch(a,l){const u=new URL(a,location.origin);if(u.pathname.startsWith('/api/trpc/')){const ps=u.pathname.slice('/api/trpc/'.length).split(',');const rs=ps.map(p=>({result:{data:{json:p==='managedCatalog.changes'?{products:[]}:p==='storefront.sourceData'?{status:'unavailable',data:null}:{status:'unavailable',message:'The original private backend is not included.'}}}}));return Promise.resolve(new Response(JSON.stringify(u.searchParams.has('batch')?rs:rs[0]),{headers:{'Content-Type':'application/json'}}));}return globalThis.fetch(a,{...l??{},credentials:'include'});}`);
write('public/assets/index-D94YxEFh.js',app);
write('public/assets/index-DVRKiZVu.css',localize(read('source/deployed.css')));
write('public/index.html',read('source/index.html').replace(/<link rel="preconnect"[^>]+>/g,'').replace(/<link href="https:\/\/fonts.googleapis.com[^>]+>/,'<link rel="stylesheet" href="/assets/fonts.css">')); 
const catalog=JSON.parse(localize(read('source/catalog.original.json')));
write('public/citycell-web-catalog.json',JSON.stringify(catalog));
write('public/_redirects','/* /index.html 200\n');
console.log(`Built ${catalog.products.length} shared catalog/inventory products and ${manifest.assets.length} local images.`);
fs.cpSync(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
