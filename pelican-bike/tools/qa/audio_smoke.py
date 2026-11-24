"""音频冒烟测试：真实 Edge 里用真实点击解锁 WebAudio，在压缩器输出挂 Analyser 量化实际信号。

用法：python tools/qa/audio_smoke.py
产物：shots/audio/smoke.html、shots/audio/audio.bundle.js（只打包 src/audio，不碰 app.js）、shots/audio/smoke.json
判定：解锁成功且 ctx running；有信号（RMS>0.02）且不削波（峰值<0.99）；静音窗内无声；取消静音后有声；
      关/开音乐后有声；无 console/page 错误；dispose 后 ctx=none。
"""
import json
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'shots' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)

# 1) 只把音频引擎打包成 IIFE（与 app.js 无关）
subprocess.run(['node', str(ROOT / 'node_modules' / 'esbuild' / 'bin' / 'esbuild'), str(ROOT / 'src' / 'audio' / 'audio.js'),
                '--bundle', '--format=iife', '--global-name=PelicanAudio', f'--outfile={OUT / "audio.bundle.js"}', '--log-level=warning'],
               check=True, cwd=ROOT)

HTML = """<!doctype html><meta charset="utf-8"><title>audio smoke</title>
<button id="go" style="font-size:40px;padding:30px">unlock</button>
<script src="./audio.bundle.js"></script>
<script>
window.__maxRms = 0; window.__frames = 0; window.__err = null; window.__log = [];
window.addEventListener('error', (e) => { window.__err = String(e.message); });
// 取证：拦截 createDynamicsCompressor，在它后面挂一个 Analyser（不改变引擎行为）
const orig = AudioContext.prototype.createDynamicsCompressor;
AudioContext.prototype.createDynamicsCompressor = function () {
  const c = orig.call(this);
  window.__tap = this.createAnalyser(); window.__tap.fftSize = 2048;
  c.connect(window.__tap);
  return c;
};
document.getElementById('go').addEventListener('click', () => {
  const audio = PelicanAudio.createAudio();
  window.__audio = audio;
  const t0 = performance.now(); window.__t0 = t0;
  // 调用时间线（取证用）：记录相对点击的毫秒数
  for (const k of ['setMuted', 'setMusicEnabled']) {
    const f = audio[k].bind(audio);
    audio[k] = (b) => { window.__log.push([Math.round(performance.now() - t0), k, b]); return f(b); };
  }
  audio.setVolume(0.8); audio.setMusicEnabled(true);
  window.__unlockReturned = audio.unlock();
  window.__sfx = {};
  for (const k of ['bell', 'squawk', 'jump', 'gulp', 'click', 'toggle', 'shift']) window.__sfx[k] = audio.sfx[k]();
  window.__sfx.land = audio.sfx.land(1); window.__sfx.splash = audio.sfx.splash(1);
  // 状态切换按真实时间各触发一次（无头模式 rAF 帧率不稳，不能按帧数计）
  setTimeout(() => audio.sfx.squawk(), 400);
  setTimeout(() => audio.setMuted(true), 750);
  setTimeout(() => audio.setMuted(false), 1050);
  setTimeout(() => audio.setMusicEnabled(false), 1350);
  setTimeout(() => audio.setMusicEnabled(true), 1650);
  const state = { v: 5, crankVel: 6, mode: 'pedal', pedalPower: 0.7, air: false, gear: 1 };
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    audio.update(state, dt, { hour: 22.5, cadence:57 });
    window.__frames++;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});
</script>"""
page_file = OUT / 'smoke.html'
page_file.write_text(HTML, encoding='utf-8')

TAP_JS = """() => { const a = window.__tap; if (!a) return { tap: false };
  const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b);
  let s = 0, pk = 0; for (const x of b) { s += x * x; pk = Math.max(pk, Math.abs(x)); }
  const r = Math.sqrt(s / b.length);
  if (Number.isFinite(r)) window.__maxRms = Math.max(window.__maxRms, r);
  return { tap: true, rms: r, peak: pk, now: Math.round(performance.now() - window.__t0) }; }"""

logs = []
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_context(viewport={'width': 640, 'height': 360}).new_page()
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto(page_file.as_uri(), wait_until='load')
    page.click('#go')                                    # 真实用户手势
    page.wait_for_timeout(300)
    early = page.evaluate("() => ({ unlockReturned: window.__unlockReturned, ready: window.__audio.ready, state: window.__audio.getState(), sfx: window.__sfx })")
    peaks = []
    for _ in range(18):                                  # 采样约 2.7s：出声 → 静音 → 恢复 → 关/开音乐
        page.wait_for_timeout(150)
        peaks.append(page.evaluate(TAP_JS))
    final = page.evaluate("() => ({ state: window.__audio.getState(), frames: window.__frames, err: window.__err, log: window.__log, now: Math.round(performance.now() - window.__t0) })")
    page.evaluate("() => window.__audio.dispose()")
    disposed = page.evaluate("() => ({ state: window.__audio.getState(), ready: window.__audio.ready })")
    browser.close()

# 用调用时间线定位窗口（调用日志与采样共用页面内的 t0 = 点击时刻）
tl = [(x.get('rms', -1), x.get('now', 0)) for x in peaks]
pick = lambda k, want: [t for t, kk, b in final['log'] if kk == k and b is want]
mute_on, mute_off = (pick('setMuted', True) or [None])[0], (pick('setMuted', False) or [None])[0]
music_on = (pick('setMusicEnabled', True) or [None])[-1]
muted_rms = [r for r, t in tl if mute_on is not None and mute_off is not None and mute_on + 100 < t < mute_off - 40]
unmuted_rms = [r for r, t in tl if mute_off is not None and mute_off + 150 < t]
restart_rms = [r for r, t in tl if music_on is not None and t > music_on + 250]
calls = len(final['log'])
result = {
    'after_click': early, 'final': final, 'after_dispose': disposed,
    'maxRms': round(max((x.get('rms', 0) for x in peaks), default=0), 4),
    'peakAbs': round(max((x.get('peak', 0) for x in peaks), default=0), 4),
    'sfxReturned': early.get('sfx'),
    'rmsTimeline': [round(x.get('rms', -1), 4) for x in peaks],
    'mutedWindowRms': [round(x, 4) for x in muted_rms], 'maxRmsAfterUnmute': round(max(unmuted_rms), 4) if unmuted_rms else None,
    'maxRmsAfterMusicRestart': round(max(restart_rms), 4) if restart_rms else None,
    'logs': logs[:20],
}
checks = {
    'unlock_running': early.get('unlockReturned') is True and early.get('ready') is True and early['state']['ctx'] == 'running',
    'signal_present': result['maxRms'] > 0.02,
    'no_clipping': result['peakAbs'] < 0.99,
    'all_sfx_built': len(early.get('sfx') or {}) == 9 and all(early['sfx'].values()),   # 每个音效都真的建出了节点（没被 shot() 的 try/catch 吞掉）
    'muted_silent': bool(muted_rms) and max(muted_rms) < 0.004,
    'unmute_audible': bool(unmuted_rms) and max(unmuted_rms) > 0.01,
    'music_restart_audible': bool(restart_rms) and max(restart_rms) > 0.01,
    'final_state': final['state']['muted'] is False and final['state']['music'] is True and 84 < final['state']['bpm'] <= 150,
    'no_page_errors': not any(l.startswith(('[pageerror]', '[error]')) for l in logs) and final['err'] is None,
    'dispose': disposed['state']['ctx'] == 'none' and disposed['ready'] is False,
}
result['checks'] = checks
(OUT / 'smoke.json').write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps({k: v for k, v in result.items() if k not in ('final',)}, ensure_ascii=False, indent=1))
print('final:', json.dumps(final['state']), 'frames:', final['frames'])
ok = all(checks.values())
print('SMOKE', 'PASS' if ok else 'FAIL', calls)
sys.exit(0 if ok else 1)
