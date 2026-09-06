import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('public/citycell-web-catalog.json'));
const original=JSON.parse(read('source/catalog.original.json'));
assert.equal(catalog.products.length,1864);
assert.equal(new Set(catalog.products.map(p=>p.id)).size,catalog.products.length);
assert.deepEqual(catalog.products.map(p=>[p.id,p.name,p.price,p.inStock]),original.products.map(p=>[p.id,p.name,p.price,p.inStock]));
for(const p of catalog.products){assert.ok(p.imageUrl.startsWith('/'),`External image: ${p.id}`);assert.ok(fs.existsSync(path.join(root,'public',p.imageUrl)),`Missing image: ${p.id}`);}
const manifest=JSON.parse(read('source/asset-manifest.json'));
for(const a of manifest.assets){const bytes=fs.readFileSync(path.join(root,'public',a.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
const app=read('public/assets/index-D94YxEFh.js');
assert.ok(app.includes('Pf=storeCatalog.products.map('));
assert.ok(!app.includes('return[...it,...xn].slice(0,15)'));
assert.ok(!app.includes('return C3.has(Jf(a.name))'));
assert.ok(!/https?:\/\/[^"\s]+\.(png|jpg|webp)/.test(app));
assert.ok(!app.includes('/manus-storage/'));
const syntax=spawnSync(process.execPath,['--check',path.join(root,'public/assets/index-D94YxEFh.js')]);
assert.equal(syntax.status,0,syntax.stderr?.toString());
assert.ok(!read('public/index.html').includes('manus-runtime'));
assert.ok(!read('public/index.html').includes('fonts.googleapis.com'));
console.log(`PASS: ${catalog.products.length} shared products, ${manifest.assets.length} image checksums, local asset references and JavaScript syntax.`);
