#!/usr/bin/env node
const fs = require('fs');

const graphPath = process.argv[2] || 'darkfactory/tasks/sample-epic.json';
if (!fs.existsSync(graphPath)) {
  console.error(`Task graph not found: ${graphPath}`);
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const byId = new Map(graph.tasks.map(t => [t.id, t]));

let promoted = 0;
for (const task of graph.tasks) {
  if (task.status !== 'blocked') continue;
  const unblocked = task.depends_on.every(dep => byId.get(dep)?.status === 'done');
  if (unblocked) {
    task.status = 'ready';
    promoted++;
  }
}

fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));
console.log(JSON.stringify({ promoted, graphPath }, null, 2));
