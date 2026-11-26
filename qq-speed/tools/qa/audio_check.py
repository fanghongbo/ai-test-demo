"""Audio smoke test. A headless browser has no speakers, but it does run the WebAudio graph:
this checks that audio starts on the first gesture, that every sound effect and every API can be called without throwing,
and that the three songs and the mute switch do what they say.

  python tools/qa/audio_check.py
"""
import json
import pathlib
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from game_check import Session  # noqa: E402

CALLS = """async () => {
  const A = window.__game.audio, out = { ready: false, errors: [], bgm: [] };
  const tr = (label, fn) => { try { fn(); } catch (e) { out.errors.push(label + ': ' + e.message); } };
  await new Promise((r) => setTimeout(r, 600));
  out.ready = A.ready;
  for (const [name, arg] of [['click'], ['count'], ['go'], ['drift'], ['mini'], ['nitro'], ['double'], ['gas'], ['hit', 0.8], ['bump'], ['perfect'], ['lap', true], ['lap', false], ['finish'], ['rescue'], ['wrong'],
    ['itemGet'], ['missile'], ['boom', 1], ['spin'], ['shield'], ['magnet'], ['banana'], ['block'], ['toss'], ['splash', 0.6]]) tr('sfx ' + name, () => A.play(name, arg));
  tr('engine', () => A.engine(0.6, 0.8, true)); tr('screech', () => A.screech(0.5, 0.4)); tr('wind', () => A.windVol(0.5)); tr('boost', () => A.boost(0.5)); tr('scrape', () => A.scrape(0.5));
  tr('quiet', () => { A.engine(0, 0, false); A.screech(0); A.windVol(0); A.boost(0); A.scrape(0); });
  tr('musicOn', () => A.setMusicOn(true));
  out.bgm.push(A.bgmName);
  for (const d of [1, 1, 1, -1]) { tr('nextMusic', () => A.nextMusic(d)); out.bgm.push(A.bgmName); }
  tr('mute', () => A.setMuted(true)); out.muted = A.muted; tr('unmute', () => A.setMuted(false)); out.unmuted = !A.muted;
  tr('vol', () => A.setMusicVol(0.1)); tr('stopMusic', () => A.stopMusic());
  await new Promise((r) => setTimeout(r, 500));
  return out;
}"""

with sync_playwright() as p:
    s = Session(p, 'shots/audio')
    before = s.eval("() => ({ ready: window.__game.audio.ready, muted: window.__game.audio.muted })")
    print('before any gesture:', json.dumps(before))
    s.page.mouse.click(800, 500)                                                  # a real user gesture: the browser only lets audio start after one
    s.wait(400)
    r = s.eval(CALLS)
    print('after a click:', json.dumps(r, ensure_ascii=False))
    s.page.keyboard.press('KeyM'); s.wait(200)
    print('M key toggles the sound setting:', s.eval("() => [window.__game.ui.S.sound, window.__game.audio.muted, document.getElementById('muteBtn').textContent]"))
    s.page.keyboard.press('KeyM'); s.wait(200)
    print('M again:', s.eval("() => [window.__game.ui.S.sound, window.__game.audio.muted, document.getElementById('muteBtn').textContent]"))
    errors = [l for l in s.logs if l.startswith('[pageerror]') or '[error]' in l]
    print('console errors:', errors[:6] if errors else 'none')
    bad = (not r['ready']) or r['errors'] or errors or len(set(r['bgm'])) < 3 or not (r.get('muted') and r.get('unmuted'))
    print('AUDIO PROBLEM' if bad else 'AUDIO OK')
    s.browser.close()
    sys.exit(1 if bad else 0)
