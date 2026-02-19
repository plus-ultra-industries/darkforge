#!/usr/bin/env node
const fs = require('fs');

async function callOpenAI({ apiKey, model, prompt }) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are an autonomous software factory role agent. Return concise, structured markdown.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!r.ok) throw new Error(`openai error ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content || '';
}

function fallback(stage, issue) {
  return `# ${stage.toUpperCase()} Output (fallback)\n\nIssue #${issue.number}: ${issue.title}\n\n- This is bootstrap fallback output because OPENAI_API_KEY was not available.`;
}

(async () => {
  const [stage, issuePath, outPath] = process.argv.slice(2);
  if (!stage || !issuePath || !outPath) {
    console.error('Usage: llm-role.js <stage> <issue-json-path> <out-path>');
    process.exit(1);
  }

  const issue = JSON.parse(fs.readFileSync(issuePath, 'utf8'));
  const prompt = [
    `Stage: ${stage}`,
    `Issue #${issue.number}: ${issue.title}`,
    'Issue body:',
    issue.body || '(empty)',
    '',
    'Generate the best stage output for this role in markdown with actionable structure.',
  ].join('\n');

  let output;
  if (process.env.OPENAI_API_KEY) {
    try {
      output = await callOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.DARKFORGE_MODEL || 'gpt-4o-mini',
        prompt,
      });
    } catch (e) {
      output = `${fallback(stage, issue)}\n\n> LLM call failed: ${e.message}`;
    }
  } else {
    output = fallback(stage, issue);
  }

  fs.writeFileSync(outPath, output);
  console.log(JSON.stringify({ stage, outPath }, null, 2));
})();
