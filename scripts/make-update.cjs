const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{allowed,sha}=require('./update.cjs');
const root=path.resolve(__dirname,'..'),revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),pkg=require('../package.json');
const candidates=['package.json','package-lock.json','README.md','THIRD_PARTY.md','scripts/update.cjs',...fs.readdirSync(path.join(root,'src')).map(p=>'src/'+p)];
const files=candidates.filter(allowed).map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,bytes:b.length,sha256:sha(b)};});
fs.mkdirSync(path.join(root,'updates'),{recursive:true});fs.writeFileSync(path.join(root,'updates/latest.json'),JSON.stringify({schema:1,version:pkg.version,revision,files},null,2)+'\n');
