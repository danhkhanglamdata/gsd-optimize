#!/usr/bin/env node
// Post-Execute Chain Hook – Stop event
// Fires when Claude stops responding after any command.
// Detects if execute-phase just completed by checking for a freshly written
// VERIFICATION.md (written by gsd-verifier at end of execute-phase).
//
// If detected + post_execute_chain.enabled = true in config.json:
//   → Injects additionalContext reminding Claude to auto-chain:
//     verify-work → add-tests → validate-phase
//
// Stop hook stdin format: { "stop_hook_active": true/false }
// Output: { "hookSpecificOutput": { "hookEventName": "Stop", "additionalContext": "..." } }

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(process.cwd(), '.planning', 'config.json');
const PHASES_DIR  = path.join(process.cwd(), '.planning', 'phases');
const FRESH_MS    = 5 * 60 * 1000; // 5 minutes = "just completed"

function silentExit() {
  process.stdout.write('{}');
  process.exit(0);
}

const timeout = setTimeout(silentExit, 3000);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { input += c; });
process.stdin.on('end', () => {
  clearTimeout(timeout);
  try {
    // Read config
    let config = {};
    try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch (_) { return silentExit(); }

    const chain = config.post_execute_chain || {};
    if (!chain.enabled || !chain.auto_run) return silentExit();

    // Scan .planning/phases/ for a VERIFICATION.md written in last FRESH_MS
    if (!fs.existsSync(PHASES_DIR)) return silentExit();

    let latestVerification = null;
    let latestPhaseNum     = null;
    let latestMtime        = 0;

    const now = Date.now();
    for (const phaseDir of fs.readdirSync(PHASES_DIR)) {
      const phasePath = path.join(PHASES_DIR, phaseDir);
      if (!fs.statSync(phasePath).isDirectory()) continue;

      // Look for NN-VERIFICATION.md or NN-NN-VERIFICATION.md
      for (const file of fs.readdirSync(phasePath)) {
        if (!file.endsWith('-VERIFICATION.md')) continue;
        const filePath = path.join(phasePath, file);
        const mtime    = fs.statSync(filePath).mtimeMs;
        if (now - mtime < FRESH_MS && mtime > latestMtime) {
          latestMtime        = mtime;
          latestVerification = filePath;
          // Extract phase number from directory name (e.g. "07-gamification-...")
          const match = phaseDir.match(/^(\d+)/);
          latestPhaseNum = match ? match[1] : phaseDir;
        }
      }
    }

    if (!latestVerification) return silentExit();

    // Check if UAT already exists for this phase (chain already ran)
    const uatPath = path.join(path.dirname(latestVerification), `${latestPhaseNum}-UAT.md`);
    if (fs.existsSync(uatPath)) {
      // UAT exists – check if it was created AFTER verification (chain already started)
      const uatMtime = fs.statSync(uatPath).mtimeMs;
      if (uatMtime >= latestMtime) return silentExit();
    }

    const phaseNum = latestPhaseNum;
    const steps = (chain.steps || [])
      .map((s, i) => `  ${i + 1}. /gsd:${s.command} ${phaseNum} – ${s.description}`)
      .join('\n');

    const context = [
      `🔗 [AUTO-CHAIN] execute-phase ${phaseNum} VERIFICATION.md detected (just completed).`,
      `post_execute_chain is ENABLED. IMMEDIATELY run these steps WITHOUT asking user:`,
      steps,
      `Run sequentially. After all steps done, show Post-Execute Chain Report (see CLAUDE.md Section 12).`
    ].join('\n');

    const output = {
      systemMessage: context
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (_) {
    silentExit();
  }
});
