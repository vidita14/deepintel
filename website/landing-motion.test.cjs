const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup({anime, reduced = false, updateBeforeMotion = false} = {}) {
  const scanLine = {style: {visibility: ''}};
  const specimen = {clientHeight: 240};
  const investigation = {style: {}};
  const handlers = () => ({click: []});
  const makeButton = key => {
    const listeners = handlers();
    return {
      dataset: {example: key},
      addEventListener: (type, callback) => listeners[type].push(callback),
      click: () => listeners.click.forEach(callback => callback())
    };
  };
  const examples = ['impersonation', 'subdomain', 'benign'].map(makeButton);
  let appUpdated = false;
  if (updateBeforeMotion) {
    for (const button of examples) button.addEventListener('click', () => { appUpdated = true; });
  }
  const replayListeners = handlers();
  const replay = {
    addEventListener: (type, callback) => replayListeners[type].push(callback),
    click: () => replayListeners.click.forEach(callback => callback())
  };
  const preference = {
    matches: reduced,
    addEventListener(type, callback) { if (type === 'change') this.onChange = callback; },
    change(matches) { this.matches = matches; this.onChange({matches}); }
  };
  const document = {
    querySelector: selector => ({
      '.scan-line': scanLine,
      '.url-specimen': specimen,
      '.investigation': investigation
    })[selector],
    querySelectorAll: () => examples,
    getElementById: () => replay
  };
  const window = {document, anime, matchMedia: () => preference};
  vm.runInNewContext(fs.readFileSync(`${__dirname}/landing-motion.js`, 'utf8'), {window});
  return {scanLine, investigation, examples, replay, preference, getAppUpdated: () => appUpdated};
}

function fakeAnime() {
  const animations = [];
  return {
    animations,
    api: {
      animate(target, parameters) {
        const animation = {
          target,
          parameters,
          cancelled: false,
          completed: false,
          cancel() { this.cancelled = true; },
          complete() {
            this.completed = true;
            parameters.onComplete?.(this);
          }
        };
        animations.push(animation);
        return animation;
      }
    }
  };
}

const noLibrary = setup();
assert.equal(noLibrary.scanLine.style.visibility, 'hidden');
assert.equal(noLibrary.scanLine.style.opacity, '');
assert.doesNotThrow(() => noLibrary.replay.click());
noLibrary.examples[0].click();

const stylesheet = fs.readFileSync(`${__dirname}/style.css`, 'utf8');
assert.match(stylesheet, /\.scan-line\{[^}]*opacity:0/);

const library = fakeAnime();
const page = setup({anime: library.api, updateBeforeMotion: true});
assert.equal(library.animations.length, 1);
assert.equal(library.animations[0].target, page.scanLine);
assert.deepEqual(Array.from(library.animations[0].parameters.y), [0, 240]);
assert.ok(library.animations[0].parameters.duration < 4000);
assert.equal(library.animations[0].parameters.loop, undefined);
assert.equal(page.scanLine.style.visibility, 'visible');
assert.equal(page.scanLine.style.opacity, '1');
library.animations[0].parameters.onComplete();
assert.equal(page.scanLine.style.visibility, 'hidden');
assert.equal(page.scanLine.style.opacity, '');

page.replay.click();
assert.equal(library.animations.length, 2);
assert.equal(library.animations[1].target, page.scanLine);
assert.equal(library.animations[1].parameters.duration, 1700);
page.examples[1].click();
assert.equal(page.getAppUpdated(), true);
assert.equal(library.animations.length, 3);
assert.equal(library.animations[2].target, page.investigation);
assert.deepEqual(Array.from(library.animations[2].parameters.opacity), [0.65, 1]);
assert.deepEqual(Array.from(library.animations[2].parameters.y), [5, 0]);
page.preference.change(true);
assert.equal(library.animations[1].completed, true);
assert.equal(library.animations[2].completed, true);
assert.equal(page.scanLine.style.visibility, 'hidden');
assert.equal(page.scanLine.style.opacity, '');
assert.equal(page.investigation.style.opacity, '1');
assert.equal(page.investigation.style.transform, 'translateY(0px)');

const reducedLibrary = fakeAnime();
const reducedPage = setup({anime: reducedLibrary.api, reduced: true});
assert.equal(reducedLibrary.animations.length, 0);
assert.equal(reducedPage.scanLine.style.visibility, 'hidden');
reducedPage.replay.click();
reducedPage.examples[0].click();
assert.equal(reducedLibrary.animations.length, 0);

console.log('Landing motion: scan replay, example updates, missing Anime.js, and reduced motion pass.');
