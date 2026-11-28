"""声音检查。无头浏览器没有喇叭，但 WebAudio 的整张图是真的在跑：这里启动声音，用音频模块自带的电平表（audio.meter）
量几种状态下的输出，再把每种效果都触发一遍——确认起得来、不静音、不削波，静音开关和音量真的起作用。

  python tools/qa/audio_check.py
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, AUDIO_FLAG, launch, open_page  # noqa: E402

RUN = """async () => {
  const g = window.__game, A = g.audio, out = { steps: {}, errors: [], info: {} };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tr = (label, fn) => { try { fn(); } catch (e) { out.errors.push(label + ': ' + e.message); } };
  const run = async (label, ms) => { out.steps[label] = await A.meter(ms); };
  const key = (type, code) => window.dispatchEvent(new KeyboardEvent(type, { code }));
  tr('start', () => A.start());
  await wait(1500);
  A.state.nextWhale = A.state.nextCreak = A.state.nextChord = Infinity;             // 关掉“隔一阵响一声”的定时器：要量的是已知的声音
  const ctx = A.state.ctx;
  out.info = { started: A.state.started, state: ctx && ctx.state, rate: ctx && ctx.sampleRate, latency: ctx && +(ctx.baseLatency ?? 0).toFixed(4), now: ctx && +ctx.currentTime.toFixed(2) };
  await run('bed_title', 2500);
  tr('whale', () => A.whale());
  await run('whale', 2600);
  await wait(2500);
  tr('creak', () => A.creak(1));
  await run('creak', 2000);
  tr('exhale', () => A.exhale());
  await run('exhale', 1500);
  tr('clicks', () => { for (let i = 0; i < 10; i++) A.click(); });
  await run('clicks', 500);
  tr('vent', () => A.ventBubble(1));
  await wait(5000);                                                      // 等混响的尾巴都散干净
  await run('bed_title_again', 2000);
  tr('chord', () => A.chord(2));
  await wait(4500);                                                      // 和声铺底 4.5 秒才升到头
  await run('chord', 2000);
  await wait(11000);
  // 自由潜泳、按住 W 和 Shift 疾游：划水声跟着泳速走（每帧的 audio.update 是主循环按真实状态调的）
  tr('free', () => g.setMode('free'));
  await wait(1500);
  await run('bed_free_still', 2000);
  key('keydown', 'KeyW'); key('keydown', 'ShiftLeft');
  await wait(1200);
  await run('swim_boost', 1800);
  key('keyup', 'ShiftLeft');
  await wait(1500);
  await run('swim_cruise', 1500);
  key('keyup', 'KeyW');
  tr('volume', () => A.setVolume(0.3));
  await wait(900);
  await run('volume_0.3', 1500);
  tr('volume back', () => A.setVolume(0.8));
  tr('mute', () => A.setOn(false));
  await wait(2600);
  await run('muted', 1500);
  tr('unmute', () => A.setOn(true));
  await wait(1500);
  await run('unmuted', 1500);
  tr('night', () => g.setTime('night'));
  await wait(1500);
  await run('bed_night', 2000);
  out.info.nowEnd = +ctx.currentTime.toFixed(2);
  return out;
}"""

with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS + [AUDIO_FLAG])
    ctx, page, logs = open_page(browser)
    r = page.evaluate(RUN)
    browser.close()

steps, info = r['steps'], r['info']
print('audio context:', json.dumps(info))
for k, v in steps.items():
    print(f'  {k:16s} peak {v["peak"]:.4f}  rms {v["rms"]:.4f}')
bad = []
if r['errors']:
    bad.append('调用出错：' + '; '.join(r['errors']))
if logs:
    bad.append('console: ' + ' | '.join(logs[:4]))
if info.get('state') != 'running':
    bad.append(f'AudioContext 没在跑（{info.get("state")}）')
if not info.get('now') or not info.get('nowEnd') or info['nowEnd'] - info['now'] < 25:
    bad.append('音频时钟没走：量不了')


def lt(a, b, text):
    if not steps[a]['rms'] < b:
        bad.append(text)


if not bad:
    bed = steps['bed_title']['rms']
    if bed < 0.004:
        bad.append(f'底噪太小，几乎是静音：{bed}')
    if steps['whale']['rms'] < bed * 1.4:
        bad.append(f'鲸叫的时候没有变响：{steps["whale"]["rms"]:.4f} 对底噪 {bed:.4f}')
    if abs(steps['bed_title_again']['rms'] - bed) > bed * 0.12:
        bad.append(f'同样的标题画面，底噪前后差太多（有声音没散干净）：{bed:.4f} 对 {steps["bed_title_again"]["rms"]:.4f}')
    if steps['creak']['rms'] < bed * 1.2:
        bad.append(f'沉船的呻吟太小，压不过底噪：{steps["creak"]["rms"]:.4f} 对 {bed:.4f}')
    if steps['swim_boost']['rms'] < steps['bed_free_still']['rms'] * 1.15:
        bad.append(f'疾游的时候划水声没起来：{steps["swim_boost"]["rms"]:.4f} 对静止 {steps["bed_free_still"]["rms"]:.4f}')
    if not steps['swim_cruise']['rms'] < steps['swim_boost']['rms']:
        bad.append('松开 Shift 以后没有轻下来')
    if steps['chord']['rms'] < bed * 1.2:
        bad.append(f'和声铺底没起来：{steps["chord"]["rms"]:.4f}')
    if not steps['volume_0.3']['rms'] < bed * 0.7:
        bad.append(f'音量调到 0.3 没有变轻：{steps["volume_0.3"]["rms"]:.4f}')
    if steps['muted']['rms'] > max(0.0005, bed * 0.03):
        bad.append(f'静音之后还有声音：{steps["muted"]["rms"]:.4f}')
    if steps['unmuted']['rms'] < 0.004:
        bad.append(f'取消静音没有恢复：{steps["unmuted"]["rms"]:.4f}')
    if steps['bed_night']['rms'] < 0.004:
        bad.append(f'夜里静音了：{steps["bed_night"]["rms"]:.4f}')
    if not steps['bed_night']['rms'] > steps['unmuted']['rms'] * 1.05:
        bad.append(f'夜里轰鸣应该更重一点：{steps["bed_night"]["rms"]:.4f} 对 {steps["unmuted"]["rms"]:.4f}')
    for k, v in steps.items():
        if not (v['peak'] < 0.99):
            bad.append(f'{k} 削波了：峰值 {v["peak"]}')
        if v['peak'] > 0.98 and k not in ('clicks',):
            bad.append(f'{k} 峰值贴着满刻度：{v["peak"]}')
print('AUDIO OK' if not bad else 'AUDIO PROBLEM')
for b in bad:
    print('  -', b)
sys.exit(1 if bad else 0)
