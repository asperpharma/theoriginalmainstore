#!/usr/bin/env node
let d = '';
process.stdin.on('data', c => d += c);
process.stdin.on('end', () => {
  try {
    const i = JSON.parse(d);
    const p = i.prompt || '';
    const routine = /<github-webhook-activity>[\s\S]*?(supabase\[bot\][\s\S]*?(Ignoring|no supabase directory)|coderabbitai\[bot\][\s\S]*?(Review skipped|[Dd]raft)|vercel\[bot\][\s\S]*?([Bb]uilding|[Qq]ueued|in_progress|pending|neutral))[\s\S]*?<\/github-webhook-activity>/.test(p);
    if (routine) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason: 'Routine webhook auto-suppressed (vercel building / coderabbit draft-skip / supabase ignore)'
      }));
    }
  } catch (e) {}
});
