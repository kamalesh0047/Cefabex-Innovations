import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {Miniflare,Log,LogLevel}=await import(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const root=path.resolve(import.meta.dirname,'..');
const serverRoot=path.join(root,'dist/server');
const modules=[{type:'ESModule',path:path.join(serverRoot,'index.js')},...readdirSync(serverRoot,{recursive:true}).filter(f=>f.endsWith('.js')&&f!=='index.js').map(f=>({type:'ESModule',path:path.join(serverRoot,f)}))];
const mf=new Miniflare({modulesRoot:serverRoot,modules,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{SITE_PRIVATE_ADMIN_BOOTSTRAP:'true'},assets:{directory:path.join(root,'dist/client'),binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}},log:new Log(LogLevel.ERROR)});
let checks=0;
const origin='https://test.cefabex.example';
const adminHeaders={'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'owner@example.test'};
const call=async(url,options={})=>{const request=new Request(origin+url,options);const response=await mf.dispatchFetch(request.url,{method:request.method,headers:Object.fromEntries(request.headers),...(request.body?{body:await request.arrayBuffer()}:{})});return {response,body:response.headers.get('content-type')?.includes('application/json')?await response.json():await response.text()};};
const post=(url,body,headers={})=>call(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:JSON.stringify(body)});
try{
 const db=await mf.getD1Database('DB');
 const migration=readFileSync(path.join(root,'drizzle/0000_burly_the_hunter.sql'),'utf8');
 for(const statement of migration.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await db.prepare(statement).run();
 for(const [url,word] of [['/','Cefabex'],['/about','Fathima'],['/services','ATS Resume'],['/projects','Smart Sea'],['/events','moments'],['/reviews','Client'],['/contact','9600371766'],['/inquiry','Tell us'],['/privacy','Project inquiries'],['/projects/smart-sea-belt','proactive'],['/projects/fida-clothing','FIDA'],['/admin','Admin']]){
  const {response,body}=await call(url);assert.equal(response.status,200,url);assert.ok(body.toLowerCase().includes(word.toLowerCase()),url+' content');assert.ok(!/kany?akumari|kanniyakumari/i.test(body),url+' forbidden location');checks++;
 }
 assert.equal((await call('/projects/not-a-project')).response.status,404);checks++;
 assert.equal((await call('/not-a-page')).response.status,404);checks++;
 for(const asset of ['/fonts/manrope-latin-wght-normal.woff2','/fonts/instrument-serif-latin-400-normal.woff2','/fonts/instrument-serif-latin-400-italic.woff2','/media/logo.webp','/media/moment-02.webp']){assert.equal((await call(asset)).response.status,200,asset);checks++;}
 assert.equal((await call('/api/admin')).response.status,401);checks++;
 assert.equal((await post('/api/admin',{kind:'events',record:{}})).response.status,403);checks++;
 const inquiry={id:crypto.randomUUID(),name:'Test inquiry',email:'test@example.test',phone:'+91 9000000000',company:'QA only',service:'Website Development',message:'This is a test project inquiry for isolated verification.',consent:true,website:''};
 const invalid=await post('/api/inquiries',{...inquiry,consent:false});assert.equal(invalid.response.status,400);assert.ok(invalid.body.errors.consent);checks++;
 assert.equal((await post('/api/inquiries',inquiry,{Origin:'https://other.example'})).response.status,403);checks++;
 assert.equal((await post('/api/inquiries',inquiry)).response.status,201);checks++;
 assert.equal((await post('/api/inquiries',inquiry)).response.status,200);assert.equal((await db.prepare('select count(*) as n from inquiries').first()).n,1);checks++;
 assert.equal((await post('/api/admin/activate',{},adminHeaders)).response.status,200);checks++;
 assert.equal((await post('/api/admin/activate',{}, {...adminHeaders,'oai-authenticated-user-id':'different-account'})).response.status,403);checks++;
 const event={id:crypto.randomUUID(),title:'Isolated test event',date:'2026-10-11',description:'Test content for database behavior only.',image:'/media/moment-02.webp',published:false,archived:false};
 assert.equal((await post('/api/admin',{kind:'events',record:event},adminHeaders)).response.status,200);assert.equal((await call('/api/content?kind=events')).body.records.length,0);checks++;
 assert.equal((await post('/api/admin',{kind:'events',record:{...event,published:true}},adminHeaders)).response.status,200);assert.equal((await call('/api/content?kind=events')).body.records.length,1);checks++;
 assert.equal((await post('/api/admin',{kind:'events',record:{...event,published:true,archived:true}},adminHeaders)).response.status,200);assert.equal((await call('/api/content?kind=events')).body.records.length,0);checks++;
 const review={id:crypto.randomUUID(),name:'Test client',company:'QA only',service:'Website Development',quote:'Isolated test feedback. Never published to the live site.',rating:5,consentConfirmed:false,published:true,archived:false};
 assert.equal((await post('/api/admin',{kind:'reviews',record:review},adminHeaders)).response.status,400);checks++;
 assert.equal((await post('/api/admin',{kind:'reviews',record:{...review,consentConfirmed:true}},adminHeaders)).response.status,200);assert.equal((await call('/api/content?kind=reviews')).body.records.length,1);checks++;
 assert.equal((await post('/api/admin',{kind:'inquiries',record:{id:inquiry.id,status:'completed'}},adminHeaders)).response.status,200);assert.equal((await db.prepare('select status from inquiries where id=?').bind(inquiry.id).first()).status,'completed');checks++;
 const ownerData=await call('/api/admin',{headers:adminHeaders});assert.equal(ownerData.response.status,200);assert.equal(ownerData.body.inquiries.length,1);checks++;
 const file=new File([readFileSync(path.join(root,'public/media/moment-02.webp'))],'test.webp',{type:'image/webp'});const fd=new FormData();fd.set('file',file);
 const upload=await call('/api/admin/media',{method:'POST',headers:{Origin:origin,...adminHeaders},body:fd});assert.equal(upload.response.status,201);assert.ok(upload.body.url.startsWith('/api/media/'));assert.equal((await call(upload.body.url)).response.status,200);checks++;
 const invalidFile=new FormData();invalidFile.set('file',new File(['this is not an image at all'],'fake.png',{type:'image/png'}));assert.equal((await call('/api/admin/media',{method:'POST',headers:{Origin:origin,...adminHeaders},body:invalidFile})).response.status,400);checks++;
 const ip='192.0.2.44';for(let n=0;n<6;n++)assert.equal((await post('/api/inquiries',{...inquiry,id:crypto.randomUUID()},{'cf-connecting-ip':ip})).response.status,201);assert.equal((await post('/api/inquiries',{...inquiry,id:crypto.randomUUID()},{'cf-connecting-ip':ip})).response.status,429);checks++;
 console.log(JSON.stringify({passed:checks,scope:'SSR routes, deep links, assets, inquiries, idempotency, admin authorization, consent, drafts, publishing, archives, R2 uploads, rate limits',productionDataWritten:false}));
}finally{await mf.dispose();}
