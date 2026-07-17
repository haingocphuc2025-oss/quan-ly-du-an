const fs = require('fs');
const path = require('path');
const projectRoot = process.argv[2];
const ua = path.join(projectRoot, '.ua');
const inter = path.join(ua, 'intermediate');
const scan = JSON.parse(fs.readFileSync(path.join(inter, 'scan-result.json'), 'utf8'));
const commit = process.argv[3] || '';
const now = new Date().toISOString();
function slash(p){ return String(p).replace(/\\/g,'/'); }
function idPart(s){ return String(s).replace(/[\r\n]/g,' ').trim().replace(/:/g,'_'); }
function categoryType(cat, lang, p){
  if (cat === 'docs') return 'document';
  if (cat === 'config') return 'config';
  if (cat === 'script') return 'file';
  if (cat === 'markup') return 'file';
  if (cat === 'infra') return 'resource';
  if (cat === 'data') return 'table';
  return 'file';
}
function complexity(lines){
  if (lines > 800) return 'high';
  if (lines > 250) return 'medium';
  return 'low';
}
const nodes=[];
const edges=[];
const nodeIds=new Set();
function addNode(n){ if(!nodeIds.has(n.id)){ nodeIds.add(n.id); nodes.push(n); } }
function addEdge(e){ if(nodeIds.has(e.source) && nodeIds.has(e.target)) edges.push(e); }
const fileIdByPath = new Map();
for (const f of scan.files) {
  const p = slash(f.path);
  const t = categoryType(f.fileCategory, f.language, p);
  const id = `${t}:${p}`;
  fileIdByPath.set(p, id);
  addNode({
    id, type:t, name:path.basename(p), filePath:p,
    summary:`${f.fileCategory || 'project'} file (${f.language || 'unknown'}, ${f.sizeLines || 0} lines).`,
    tags:[f.fileCategory || 'file', f.language || 'unknown'],
    complexity: complexity(f.sizeLines || 0),
    metadata:{ sizeLines:f.sizeLines || 0, fileCategory:f.fileCategory || 'unknown', language:f.language || 'unknown' }
  });
}
for (const name of fs.readdirSync(inter).filter(n => /^structure-\d+\.json$/.test(n))) {
  const data = JSON.parse(fs.readFileSync(path.join(inter, name), 'utf8'));
  for (const r of data.results || []) {
    const p = slash(r.path);
    const fid = fileIdByPath.get(p);
    if (!fid) continue;
    const localSymbols = new Map();
    for (const fn of r.functions || []) {
      const nid = `function:${p}:${idPart(fn.name)}`;
      addNode({ id:nid, type:'function', name:fn.name, filePath:p, summary:`Function ${fn.name} in ${p}.`, tags:['function', r.language || 'unknown'], complexity: complexity((fn.endLine||fn.startLine||0)-(fn.startLine||0)), metadata:{ startLine:fn.startLine, endLine:fn.endLine, params:fn.params || [] } });
      addEdge({ source:fid, target:nid, type:'contains', weight:1.0, direction:'forward' });
      localSymbols.set(fn.name, nid);
    }
    for (const cls of r.classes || []) {
      const nid = `class:${p}:${idPart(cls.name)}`;
      addNode({ id:nid, type:'class', name:cls.name, filePath:p, summary:`Class ${cls.name} in ${p}.`, tags:['class', r.language || 'unknown'], complexity: complexity((cls.endLine||cls.startLine||0)-(cls.startLine||0)), metadata:{ startLine:cls.startLine, endLine:cls.endLine, methods:cls.methods || [], properties:cls.properties || [] } });
      addEdge({ source:fid, target:nid, type:'contains', weight:1.0, direction:'forward' });
      localSymbols.set(cls.name, nid);
    }
    for (const call of r.callGraph || []) {
      const source = localSymbols.get(call.caller);
      const targetName = String(call.callee || '').split(/[.(]/)[0];
      const target = localSymbols.get(targetName) || localSymbols.get(call.callee);
      if (source && target && source !== target) addEdge({ source, target, type:'calls', weight:0.8, direction:'forward', metadata:{ lineNumber:call.lineNumber } });
    }
  }
}
const layerDefs = [
  ['layer:source-code','Source Code','Executable code, scripts, and UI implementation files', n => ['file','function','class'].includes(n.type) && !['docs','config'].includes(n.metadata?.fileCategory)],
  ['layer:documentation','Documentation','Project specifications, notes, and markdown documentation', n => n.type === 'document'],
  ['layer:configuration','Configuration','Configuration and structured project metadata', n => n.type === 'config'],
  ['layer:data-and-assets','Data and Assets','Data files and non-code assets tracked in the project', n => ['table','resource','schema','service','pipeline'].includes(n.type)]
];
const layers = layerDefs.map(([id,name,description,pred]) => ({ id, name, description, nodeIds:nodes.filter(pred).map(n=>n.id) })).filter(l => l.nodeIds.length);
const rootDocs = nodes.filter(n => n.type === 'document' && /(^|\/)README/i.test(n.filePath || '')).slice(0,3).map(n=>n.id);
const codeRoots = nodes.filter(n => n.type === 'file' && /(^|\/)(index|main|app|local_file_helper)\.(js|ts|tsx|py|html)$/i.test(n.filePath || '')).slice(0,5).map(n=>n.id);
const tour = [
  { order:1, title:'Project Overview', description:'Start with the top-level documentation and project control files.', nodeIds: rootDocs.length ? rootDocs : nodes.filter(n=>n.type==='document').slice(0,5).map(n=>n.id) },
  { order:2, title:'Code Entry Points', description:'Inspect likely executable entry points and core implementation files.', nodeIds: codeRoots.length ? codeRoots : nodes.filter(n=>n.type==='file').slice(0,5).map(n=>n.id) },
  { order:3, title:'Configuration Surface', description:'Review configuration files that shape project behavior.', nodeIds: nodes.filter(n=>n.type==='config').slice(0,8).map(n=>n.id) }
].filter(s => s.nodeIds.length);
const graph = { version:'1.0.0', project:{ name:scan.projectName || path.basename(projectRoot), languages:scan.languages || [], frameworks:scan.frameworks || [], description:scan.projectDescription || 'Deterministic Understand-Anything graph.', analyzedAt:now, gitCommitHash:commit }, nodes, edges, layers, tour };
fs.writeFileSync(path.join(inter, 'assembled-graph.json'), JSON.stringify(graph, null, 2));
fs.writeFileSync(path.join(ua, 'knowledge-graph.json'), JSON.stringify(graph, null, 2));
fs.writeFileSync(path.join(ua, 'meta.json'), JSON.stringify({ lastAnalyzedAt:now, gitCommitHash:commit, version:'1.0.0', analyzedFiles:scan.totalFiles }, null, 2));
console.log(JSON.stringify({nodes:nodes.length, edges:edges.length, layers:layers.length, tourSteps:tour.length, analyzedFiles:scan.totalFiles}, null, 2));