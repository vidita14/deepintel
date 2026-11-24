const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = Object.fromEntries(['url', 'title', 'badge', 'evidence', 'why', 'layer'].map(key => [`example-${key}`, {textContent: '', classList: {toggle() {}}}]));
const buttons = ['impersonation', 'subdomain', 'benign'].map(key => ({dataset: {example: key}, active: false, classList: {toggle(_, value) { this.value = value; }}, setAttribute(_, value) {this.pressed = value;}, addEventListener(_, fn) {this.click = fn;}}));
vm.runInNewContext(fs.readFileSync(`${__dirname}/app.js`, 'utf8'), {document: {getElementById: id => elements[id], querySelectorAll: () => buttons}});
for (const button of buttons) {
  button.click();
  assert.equal(button.pressed, 'true');
  assert.equal(buttons.filter(item => item.pressed === 'true').length, 1);
  assert.ok(elements['example-url'].textContent.startsWith('https://'));
  assert.ok(elements['example-evidence'].textContent.length > 40);
}
assert.equal(elements['example-badge'].textContent, 'BENIGN STRUCTURE');
assert.equal(elements['example-layer'].textContent, 'DATA QUALITY');
console.log('Walkthrough: all three selections update evidence and exclusive button state.');

const path = require('node:path');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
assert.doesNotMatch(html, /href=["']https:\/\/github\.com\/Vishwa-Koparkar\/?["']/);
assert.doesNotMatch(html, /(?:by Vishwa Koparkar|A PROJECT BY VISHWA|Meet the builder)/i);
for (const [, asset] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
  if (!/^[a-z]+:/i.test(asset)) assert.ok(fs.existsSync(path.join(asset === './dashboard.html' ? `${__dirname}/..` : __dirname, asset)), `Missing public asset: ${asset}`);
}

assert.match(html, /Illustrative example · not live inference/);
assert.ok(html.indexOf('src="app.js"') < html.indexOf('src="landing-motion.js"'), 'Evidence updates must run before their animation');
assert.ok(html.indexOf('src="assets/vendor/anime.umd.min.js"') < html.indexOf('src="landing-motion.js"'), 'Anime.js must load before motion');
console.log('Public page: repository-only attribution and referenced assets pass.');

assert.match(html, /href="https:\/\/vidita14.github.io\/deepintel\/"/);
assert.doesNotMatch(html, /Vishwa-Koparkar|vishwa-koparkar/);
