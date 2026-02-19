#!/usr/bin/env node
const fs = require('fs');

const inputPath = process.argv[2] || 'darkfactory/tasks';
if (!fs.existsSync(inputPath)) {
  console.error(`Task graph path not found: ${inputPath}`);
  process.exit(1);
}

const graphFiles = fs.statSync(inputPath).isDirectory()
  ? fs.readdirSync(inputPath).filter(f => f.endsWith('.json')).map(f => `${inputPath}/${f}`)
  : [inputPath];

let totalPromoted = 0;
for (const graphPath of graphFiles) {
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
  const byId = new Map((graph.tasks || []).map(t => [t.id, t]));

  let promoted = 0;
  for (const task of graph.tasks || []) {
    if (task.status !== 'blocked') continue;
    const unblocked = (task.depends_on || []).every(dep => byId.get(dep)?.status === 'done');
    if (unblocked) {
      task.status = 'ready';
      promoted++;
    }
  }

  totalPromoted += promoted;
  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));
  console.log(JSON.stringify({ promoted, graphPath }, null, 2));
}

console.log(JSON.stringify({ totalPromoted, files: graphFiles.length }, null, 2));
