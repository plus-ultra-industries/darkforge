#!/usr/bin/env node
const fs = require('fs');

async function callLLM({ model, apiKey, prompt }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a software planning agent. Return strict JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LLM call failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

function fallbackPlan(epicNumber, epicTitle) {
  return {
    pm: {
      summary: `PM expansion for ${epicTitle}`,
      user_stories: ['As an agency QA lead, I can run automated checks and review reproducible findings.'],
      acceptance_criteria: ['Project can be created', 'Run can be triggered', 'Findings include screenshots'],
    },
    tpm: {
      proposals: [
        {
          name: 'Phoenix + Oban + Playwright worker',
          tradeoffs: 'Fast iteration, clear separation of orchestration vs browser execution',
        },
      ],
      recommendation: 'Phoenix + Oban + Playwright worker',
    },
    architect: {
      tasks: [
        { id: `E${epicNumber}-T1`, title: 'Core QA run pipeline (project -> run -> findings)', depends_on: [], parallelizable: false, owner_role: 'engineer', acceptance: ['Can trigger run manually', 'Findings persisted'] },
        { id: `E${epicNumber}-T2`, title: 'Browser checks + screenshot evidence capture', depends_on: [`E${epicNumber}-T1`], parallelizable: true, owner_role: 'engineer', acceptance: ['Failure screenshots captured', 'Repro steps generated'] },
        { id: `E${epicNumber}-T3`, title: 'QA report + markdown export', depends_on: [`E${epicNumber}-T1`], parallelizable: true, owner_role: 'engineer', acceptance: ['Run summary view exists', 'Markdown export works'] },
        { id: `E${epicNumber}-T4`, title: 'Review/fix loop + merge gate integration', depends_on: [`E${epicNumber}-T2`, `E${epicNumber}-T3`], parallelizable: false, owner_role: 'engineer', acceptance: ['Needs-fix loop works', 'Ready-to-merge signal emitted'] },
      ],
    },
  };
}

(async () => {
  const [epicNumber, epicTitlePath, outPath] = process.argv.slice(2);
  if (!epicNumber || !epicTitlePath || !outPath) {
    console.error('Usage: llm-plan.js <epicNumber> <epicJsonPath> <outPath>');
    process.exit(1);
  }

  const epic = JSON.parse(fs.readFileSync(epicTitlePath, 'utf8'));
  const title = epic.title;
  const body = epic.body || '';

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.DARKFORGE_MODEL || 'gpt-4o-mini';

  let plan;
  if (apiKey) {
    try {
      plan = await callLLM({
        model,
        apiKey,
        prompt: `Epic #${epicNumber}\nTitle: ${title}\nBody:\n${body}\n\nReturn JSON with keys pm,tpm,architect. architect.tasks[] must have id,title,depends_on[],parallelizable,owner_role,acceptance[].`,
      });
    } catch (e) {
      console.error(`LLM unavailable, using fallback: ${e.message}`);
      plan = fallbackPlan(epicNumber, title);
    }
  } else {
    plan = fallbackPlan(epicNumber, title);
  }

  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  console.log(JSON.stringify({ outPath, usedLLM: !!apiKey }, null, 2));
})();
