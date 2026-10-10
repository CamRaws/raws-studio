// Source-preview updater. Installed/signed .app updates use a different mechanism.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),REPO='CamRaws/raws-studio';
const FEED=`https://raw.githubusercontent.com/${REPO}/main/updates/latest.json`;
const allowed=p=>typeof p==='string'&&(/^(package\.json|package-lock\.json|README\.md|THIRD_PARTY\.md|scripts\/update\.cjs)$/.test(p)||/^src\/[A-Za-z0-9_-]+\.(js|cjs|mjs|html|css)$/.test(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function validate(m){
 if(m?.schema!==1||!/^\d+\.\d+\.\d+$/.test(m.version)||! /^[a-f0-9]{40}$/.test(m.revision)||!Array.isArray(m.files)||!m.files.length||m.files.length>60)throw Error('Invalid update manifest');
 const seen=new Set();let total=0;
 for(const f of m.files){if(!allowed(f.path)||seen.has(f.path)||! /^[a-f0-9]{64}$/.test(f.sha256)||!Number.isSafeInteger(f.bytes)||f.bytes<0||f.bytes>10*1024*1024)throw Error('Invalid update file');seen.add(f.path);total+=f.bytes;}
 if(total>20*1024*1024||!seen.has('package.json')||!seen.has('package-lock.json'))throw Error('Incomplete or oversized update');return m;
}
const newer=(a,b)=>{const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++){if(aa[i]>bb[i])return true;if(aa[i]<bb[i])return false;}return true;};
async function download(url,max,fetcher=fetch){const r=await fetcher(url,{signal:AbortSignal.timeout(15000),redirect:'error',headers:{'User-Agent':'RawsStudio-Updater','Cache-Control':'no-cache'}});if(!r.ok)throw Error(`Update service: ${r.status}`);if(!r.body)return Buffer.alloc(0);const reader=r.body.getReader(),parts=[];let size=0;try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw Error('Update download exceeds its size limit');parts.push(Buffer.from(value));}}finally{await reader.cancel().catch(()=>{});}return Buffer.concat(parts);}
async function plainFile(root,relative){const p=path.join(root,relative);const parent=await fs.lstat(path.dirname(p)).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(parent?.isSymbolicLink())throw Error('Update path is a symbolic link');const stat=await fs.lstat(p).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(stat&&!stat.isFile())throw Error('Update target is not a regular file');return p;}
async function rollback(root=ROOT){const state=path.join(root,'.raws-update-backup'),journal=JSON.parse(await fs.readFile(path.join(state,'journal.json'),'utf8'));if(!Array.isArray(journal.entries)||journal.entries.some(e=>!allowed(e.path)))throw Error('Invalid recovery journal');for(const e of journal.entries){const target=await plainFile(root,e.path);if(e.existed){await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(state,e.path),target);}else await fs.rm(target,{force:true});}await fs.rm(path.join(root,'.raws-update-state.json'),{force:true});await fs.rm(path.join(state,'journal.json'),{force:true});await fs.rm(path.join(state,'pending'),{force:true});}
async function install(m,root=ROOT,fetcher=fetch){
 validate(m);const staged=new Map();for(const f of m.files){const b=await download(`https://raw.githubusercontent.com/${REPO}/${m.revision}/${f.path}`,f.bytes+1,fetcher);if(b.length!==f.bytes||sha(b)!==f.sha256)throw Error('Update integrity check failed for '+f.path);staged.set(f.path,b);}
 const pkg=JSON.parse(staged.get('package.json'));if(pkg.name!=='raws-studio'||pkg.version!==m.version)throw Error('Update package does not match manifest');
 const backup=path.join(root,'.raws-update-backup');await fs.mkdir(backup,{recursive:true});const entries=[];
 for(const f of m.files){const target=await plainFile(root,f.path),existing=await fs.readFile(target).catch(e=>{if(e.code==='ENOENT')return null;throw e;});entries.push({path:f.path,existed:existing!==null});if(existing!==null){const dest=path.join(backup,f.path);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,existing);}}
 await fs.writeFile(path.join(backup,'journal.json'),JSON.stringify({entries}));await fs.writeFile(path.join(backup,'pending'),'1');
 try{for(const [p,b]of staged){const target=await plainFile(root,p);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,b);}await fs.writeFile(path.join(root,'.raws-update-state.json'),JSON.stringify({revision:m.revision,version:m.version}));await fs.rm(path.join(backup,'pending'));}
 catch(e){await rollback(root);throw e;}
}
async function main(){
 if(process.argv.includes('--rollback')){await rollback();console.log('Previous source files restored.');return;}
 if(process.argv.includes('--skip'))return;
 try{
  if(await fs.stat(path.join(ROOT,'.raws-update-backup','pending')).catch(()=>null)){await rollback();console.log('Recovered the previous version after an interrupted update.');}
  const local=JSON.parse(await fs.readFile(path.join(ROOT,'package.json'),'utf8'));if(local.name!=='raws-studio')throw Error('Not a Raws Studio project');
  const m=validate(JSON.parse((await download(FEED,128*1024)).toString()));const current=JSON.parse(await fs.readFile(path.join(ROOT,'.raws-update-state.json'),'utf8').catch(()=>'{"revision":""}'));
  if(current.revision===m.revision||!newer(m.version,local.version)){console.log('Raws Studio is up to date.');return;}
  if(process.argv.includes('--check')){console.log('Update available: '+m.version);return;}
  console.log('Downloading Raws Studio '+m.version+'…');await install(m);console.log('Update installed. Your project files were preserved.');
 }catch(e){console.log('Update check unavailable: '+e.message+'. Opening the current version.');}
}
module.exports={allowed,sha,validate,newer,download,install,rollback};if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
