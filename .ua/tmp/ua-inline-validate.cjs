const fs = require('fs');
const graphPath = process.argv[2];
const outputPath = process.argv[3];
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const issues = [], warnings = [];
if (!Array.isArray(graph.nodes)) issues.push('graph.nodes is missing or not an array');
if (!Array.isArray(graph.edges)) issues.push('graph.edges is missing or not an array');
const nodeIds = new Set();
const seen = new Map();
for (const [i,n] of (graph.nodes||[]).entries()) {
  if (!n.id) { issues.push(`Node[${i}] missing id`); continue; }
  if (seen.has(n.id)) issues.push(`Duplicate node ID ${n.id}`); else seen.set(n.id,i);
  if (!n.type) issues.push(`Node ${n.id} missing type`);
  if (!n.name) issues.push(`Node ${n.id} missing name`);
  if (!n.summary) issues.push(`Node ${n.id} missing summary`);
  if (!Array.isArray(n.tags) || !n.tags.length) issues.push(`Node ${n.id} missing tags`);
  nodeIds.add(n.id);
}
for (const [i,e] of (graph.edges||[]).entries()) {
  if (!nodeIds.has(e.source)) issues.push(`Edge[${i}] source ${e.source} not found`);
  if (!nodeIds.has(e.target)) issues.push(`Edge[${i}] target ${e.target} not found`);
}
for (const layer of graph.layers || []) for (const id of layer.nodeIds || []) if (!nodeIds.has(id)) issues.push(`Layer ${layer.id} refs missing ${id}`);
for (const step of graph.tour || []) for (const id of step.nodeIds || []) if (!nodeIds.has(id)) issues.push(`Tour step ${step.order} refs missing ${id}`);
const stats = { totalNodes: graph.nodes.length, totalEdges: graph.edges.length, totalLayers: graph.layers.length, tourSteps: graph.tour.length, nodeTypes:{}, edgeTypes:{} };
for (const n of graph.nodes) stats.nodeTypes[n.type] = (stats.nodeTypes[n.type]||0)+1;
for (const e of graph.edges) stats.edgeTypes[e.type] = (stats.edgeTypes[e.type]||0)+1;
fs.writeFileSync(outputPath, JSON.stringify({issues,warnings,stats}, null, 2));
console.log(JSON.stringify({issues:issues.length,warnings:warnings.length,stats}, null, 2));