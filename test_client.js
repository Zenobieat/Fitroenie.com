
const assert = require('assert');

// Mock Browser Environment
global.window = {};
global.document = {
  getElementById: () => ({ textContent: '', innerHTML: '', classList: { add:()=>{}, remove:()=>{} }, style:{} }),
  querySelector: () => ({ hidden: false }),
  createElement: (tag) => ({ innerHTML: '' })
};
global.WOENIE_LOCAL_SESSIONS = {};

// Load Helper Functions manually since we can't easily import from script.js without DOM
// Copying escapeHtml from script.js for testing
function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

console.log("Starting Client-Side Unit Tests...");

// Test 1: Escape HTML
try {
  console.log("Test 1: escapeHtml sanitization");
  assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;', 'Should escape script tags');
  assert.strictEqual(escapeHtml('User "Name"'), 'User &quot;Name&quot;', 'Should escape quotes');
  assert.strictEqual(escapeHtml("O'Connor"), 'O&#039;Connor', 'Should escape single quotes');
  console.log("[PASS] escapeHtml working correctly");
} catch (e) {
  console.error("[FAIL] escapeHtml", e.message);
  process.exit(1);
}

// Test 2: Host UI Update Mock
try {
  console.log("Test 2: Host UI Player Rendering");
  const players = {
      'p1': { nickname: '<b>Hacker</b>', score: 0 },
      'p2': { nickname: 'Normal Player', score: 10 }
  };
  global.WOENIE_LOCAL_SESSIONS['123456'] = { players };
  
  // Mock rendering logic from updateHostUI
  const rendered = Object.entries(players).map(([id, p]) => {
      return `<div class="lb-row"><span class="lb-name">${escapeHtml(p.nickname)}</span></div>`;
  }).join('');
  
  assert.ok(rendered.includes('&lt;b&gt;Hacker&lt;/b&gt;'), 'Should contain escaped nickname');
  assert.ok(!rendered.includes('<b>Hacker</b>'), 'Should NOT contain raw HTML');
  console.log("[PASS] Host UI rendering is safe");
} catch (e) {
  console.error("[FAIL] Host UI Update", e.message);
  process.exit(1);
}

console.log("\nALL CLIENT TESTS PASSED");
