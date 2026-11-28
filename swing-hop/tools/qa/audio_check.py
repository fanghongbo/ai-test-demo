"""声音检查。无头浏览器没有喇叭，但 WebAudio 的整张图是真的在跑：这里启动声音，用音频模块自带的电平表（audio.meter）
量底噪和每一种效果，确认起得来、不静音、不削波；再量三样跟着规则走的东西——按住时越按越响、狼追近时的吼声和心跳、
暂停 / 音量 / 静音开关是不是真的起作用。

  python tools/qa/audio_check.py
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, AUDIO_FLAG, launch, open_page  # noqa: E402

RUN = """async (ones) => {
  const g = window.__game, A = g.audio(), out = { steps: {}, errors: [], info: {} };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tr = (label, fn) => { try { fn(); } catch (e) { out.errors.push(label + ': ' + e.message); } };
  const run = async (label, ms) => { out.steps[label] = await A.meter(ms); };
  const one = async (name, arg, ms, tail) => { tr(name, () => A.play(name, arg)); await run(name, ms); await wait(tail); };
  tr('start', () => A.start());
  await wait(1500);
  A.nextBird = A.nextChord = Infinity;                       // 关掉“隔一阵响一声”的鸟叫和换和弦：要量的是已知的声音
  const ctx = A.ctx;
  out.info = { started: !!ctx, state: ctx && ctx.state, rate: ctx && ctx.sampleRate, latency: ctx && +(ctx.baseLatency ?? 0).toFixed(4), now: ctx && +ctx.currentTime.toFixed(2) };
  await run('bed_title', 2500);
  for (const [name, arg, ms, tail] of ones) await one(name, arg, ms, tail);
  await run('bed_again', 2000);

  // 按住蓄力：气声起来；松开就停
  tr('chargeStart', () => A.chargeStart());
  await wait(700);
  await run('charging', 900);
  tr('chargeEnd', () => A.chargeEnd());
  await wait(700);

  // 风暴狼追到 12 米：吼声和心跳起来（每帧的 audio.update 是主循环按狼的真实距离调的）；把它打发远：吼声散掉
  g.retry(5);
  await wait(500);
  const c = g.course(); c.ensure(80);
  const n = c.nodes.findIndex((nd, i) => i >= 18 && nd.swing.kind !== 'cracked');
  g.warp(n, { wolf: 12 });
  await wait(1200);
  await run('wolf_near', 2000);
  g.wolf(70);
  await wait(2600);
  await run('wolf_far', 1500);
  g.wolf(400);                                                // 后面还要量暂停和音量：把狼打发到很远，别让它在这中间追上

  // 暂停：没声；继续：回来
  g.pause(true);
  await wait(900);
  await run('paused', 1200);
  g.pause(false);
  await wait(900);
  await run('resumed', 1500);

  // 音量、静音
  A.setVolume(0.3);
  await wait(900);
  await run('volume_0.3', 1500);
  A.setVolume(0.8);
  await wait(900);
  await run('volume_0.8', 1500);
  A.setOn(false);
  await wait(1300);
  await run('muted', 1500);
  A.setOn(true);
  await wait(1100);
  await run('unmuted', 1500);
  out.info.nowEnd = ctx && +ctx.currentTime.toFixed(2);
  out.info.wolf = g.state().wolf;
  return out;
}"""

# 每个音效：传给它的事件、它响多久（毫秒）、响完以后等尾巴散掉
ONES = [
    ('jump', 0.6, 450, 700),
    ('land', {'c': 0.5, 'kind': 'plain'}, 350, 700),
    ('perfect', {'c': 0.5, 'combo': 3, 'kind': 'plain'}, 1000, 900),
    ('slip', None, 520, 800),
    ('fall', None, 1200, 900),
    ('cloud', None, 600, 800),
    ('howl', None, 2000, 1200),
    ('creak', None, 600, 800),
    ('snap', None, 450, 700),
    ('caught', None, 1000, 900),
    ('over', None, 1200, 900),
    ('record', None, 1300, 900),
]

with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS + [AUDIO_FLAG])
    ctx, page, logs = open_page(browser)
    r = page.evaluate(RUN, ONES)
    browser.close()

steps, info = r['steps'], r['info']
print('audio context:', json.dumps(info))
for k, v in steps.items():
    print(f'  {k:12s} peak {v["peak"]:.4f}  rms {v["rms"]:.4f}')
bad = []
if r['errors']:
    bad.append('调用出错：' + '; '.join(r['errors']))
if logs:
    bad.append('console: ' + ' | '.join(logs[:4]))
if info.get('state') != 'running':
    bad.append(f'AudioContext 没在跑（{info.get("state")}）')
if not info.get('now') or not info.get('nowEnd') or info['nowEnd'] - info['now'] < 25:
    bad.append('音频时钟没走：量不了')

if not bad:
    bed = steps['bed_title']['rms']
    if bed < 0.003:
        bad.append(f'底噪太小，几乎是静音：{bed}')
    if abs(steps['bed_again']['rms'] - bed) > bed * 0.15:
        bad.append(f'同样的画面，底噪前后差太多（有声音没散干净）：{bed:.4f} 对 {steps["bed_again"]["rms"]:.4f}')
    for name, arg, ms, tail in ONES:
        s = steps[name]
        if s['rms'] < bed * 1.25:
            bad.append(f'{name} 太小，压不过底噪：{s["rms"]:.4f} 对底噪 {bed:.4f}')
    if steps['charging']['rms'] < bed * 1.15:
        bad.append(f'按住蓄力的时候气声没起来：{steps["charging"]["rms"]:.4f} 对底噪 {bed:.4f}')
    if steps['wolf_near']['rms'] < bed * 1.25:
        bad.append(f'狼追近了，吼声和心跳没起来：{steps["wolf_near"]["rms"]:.4f} 对底噪 {bed:.4f}')
    if steps['wolf_far']['rms'] > bed * 1.2:
        bad.append(f'狼离远了吼声没散：{steps["wolf_far"]["rms"]:.4f} 对底噪 {bed:.4f}')
    if steps['paused']['rms'] > max(0.0005, bed * 0.03):
        bad.append(f'暂停之后还有声音：{steps["paused"]["rms"]:.4f}')
    if steps['resumed']['rms'] < bed * 0.8:
        bad.append(f'继续以后声音没回来：{steps["resumed"]["rms"]:.4f}')
    if not steps['volume_0.3']['rms'] < steps['volume_0.8']['rms'] * 0.6:
        bad.append(f'音量调到 0.3 没有变轻：{steps["volume_0.3"]["rms"]:.4f} 对 {steps["volume_0.8"]["rms"]:.4f}')
    if steps['muted']['rms'] > max(0.0005, bed * 0.03):
        bad.append(f'静音之后还有声音：{steps["muted"]["rms"]:.4f}')
    if steps['unmuted']['rms'] < bed * 0.8:
        bad.append(f'取消静音没有恢复：{steps["unmuted"]["rms"]:.4f}')
    for k, v in steps.items():
        if not (v['peak'] < 0.99):
            bad.append(f'{k} 削波了：峰值 {v["peak"]}')
print('AUDIO OK' if not bad else 'AUDIO PROBLEM')
for b in bad:
    print('  -', b)
sys.exit(1 if bad else 0)
