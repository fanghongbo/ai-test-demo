"""浸泡测试：长时间推进 + 反复重建 / 切换，检查数值稳定与资源是否只增不减。
python tools/qa/soak.py        退出码 1 表示有失败项。"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

results = []


def check(name, ok, detail=''):
    results.append({'name': name, 'ok': bool(ok), 'detail': str(detail)[:400]})
    print(('PASS ' if ok else 'FAIL ') + name + (f'  — {detail}' if detail else ''))


MEM = """(() => { const r = __ride.stage.renderer.info, m = performance.memory || {};
  let meshes = 0, lines = 0; __ride.stage.scene.traverse(o => { if (o.isMesh) meshes++; else if (o.isLine) lines++; });
  return { geometries: r.memory.geometries, textures: r.memory.textures, programs: r.programs ? r.programs.length : -1, meshes, lines, heapMB: m.usedJSHeapSize ? +(m.usedJSHeapSize / 1048576).toFixed(1) : null,
           toasts: document.getElementById('toasts').children.length, dpr: __ride.stage.pixelRatio }; })()"""

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto((ROOT / 'index.html').as_uri() + '?intro=0&freeze=1&quality=2', wait_until='load')
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.evaluate('__ride.target(22)')

    # ——— 1. 五分钟仿真：随机操作 ———
    m0 = page.evaluate(MEM)
    keys = ['Space', 'KeyB', 'KeyG', 'KeyC', 'KeyT', 'KeyV', 'KeyX', 'KeyH', 'KeyP', 'KeyM', 'KeyN', 'KeyK', 'ArrowUp', 'ArrowDown', 'KeyY', 'Digit5', 'Digit6', 'Digit1']
    import random
    random.seed(3)
    bad = []
    for block in range(60):                                   # 60 段 × 300 帧 = 18000 帧 = 5 分钟
        page.evaluate('__ride.step(1/60, 300)')
        k = random.choice(keys)
        if k in ('ArrowUp', 'ArrowDown'):
            page.keyboard.down(k); page.evaluate('__ride.step(1/60, 90)'); page.keyboard.up(k)
        else:
            page.keyboard.press(k)
        if k == 'KeyP':                                        # 暂停后马上继续，避免后面都在暂停
            page.evaluate('__ride.step(1/60, 10)'); page.keyboard.press('KeyP')
        if block % 7 == 3:                                     # 偶尔点画面、鱼跃、重建造型
            page.evaluate('__ride.fish()')
        if block % 11 == 5:
            page.evaluate('__ride.sculpt({ beak: 0.9 + Math.random() * 0.35, pouch: 0.8 + Math.random() * 0.5, neck: 0.9 + Math.random() * 0.25, body: 0.95 + Math.random() * 0.1 })')
        if block % 13 == 7:
            page.evaluate("(() => { const p = document.getElementById('btnSettings'); p.click(); document.getElementById('btnSettingsClose').click(); })()")
        s = page.evaluate('__ride.state()')
        if not all(isinstance(v, (int, float, str, bool)) and (not isinstance(v, float) or v == v and abs(v) != float('inf')) for v in s.values()):
            bad.append((block, s))
    st = page.evaluate('__ride.state()')
    check('五分钟仿真后状态全部为有限数', not bad and page.evaluate('__ride.stats().errlog.length === 0'), bad[:1] or page.evaluate('__ride.stats().errlog'))
    check('五分钟后仍在骑行且里程累计合理', 0 < st['kmh'] <= 45.01 and st['distance'] > 60, f"kmh={st['kmh']:.1f} distance={st['distance']:.0f} m s={st['s']:.1f}")
    # 相机没有飞走：与主体的距离在合理范围内（导演/鹈鹕视角除外）
    page.evaluate("__ride.cam('follow'); __ride.step(1/60, 400)")
    dist = page.evaluate("__ride.stage.camera.position.distanceTo(__ride.hero().position)")
    check('跟拍镜头与主体距离在 6–12 m', 6 < dist < 12, f'{dist:.2f} m')
    page.evaluate("__ride.cam('close'); __ride.step(1/60, 200)")
    dist = page.evaluate("__ride.stage.camera.position.distanceTo(__ride.hero().position)")
    check('特写镜头与主体距离在 2–5 m', 2 < dist < 5, f'{dist:.2f} m')
    hp = page.evaluate('__ride.hero().position.toArray()')
    check('主体坐标为有限数', all(isinstance(v, (int, float)) and v == v for v in hp), hp)
    m1 = page.evaluate(MEM)
    print('     资源 前/后:', m0, '→', m1)

    # ——— 2. 反复重建鹈鹕：几何体与材质数量不应累积 ———
    page.evaluate("__ride.sculpt({ beak: 1, pouch: 1, neck: 1, body: 1 }); __ride.step(1/60, 2)")
    a = page.evaluate(MEM)
    for i in range(40):
        page.evaluate(f'__ride.sculpt({{ beak: 0.8 + {(i % 6) * 0.1:.2f}, pouch: 0.7 + {(i % 8) * 0.09:.2f}, neck: 0.85 + {(i % 5) * 0.08:.2f}, body: 0.9 + {(i % 3) * 0.05:.2f} }}); __ride.step(1/60, 1)')
    page.evaluate("__ride.sculpt({ beak: 1, pouch: 1, neck: 1, body: 1 }); __ride.step(1/60, 2)")
    b = page.evaluate(MEM)
    check('40 次重建鹈鹕后几何体数不增长', b['geometries'] <= a['geometries'] + 2, f"{a['geometries']} → {b['geometries']}")
    check('40 次重建鹈鹕后贴图数不增长', b['textures'] <= a['textures'] + 1, f"{a['textures']} → {b['textures']}")
    check('40 次重建鹈鹕后着色器程序数不增长', b['programs'] <= a['programs'] + 1, f"{a['programs']} → {b['programs']}")
    check('40 次重建鹈鹕后网格数不增长', b['meshes'] <= a['meshes'] + 1, f"{a['meshes']} → {b['meshes']}")
    if a['heapMB'] is not None and b['heapMB'] is not None:
        check('重建后 JS 堆没有明显膨胀（< 24 MB）', b['heapMB'] - a['heapMB'] < 24, f"{a['heapMB']} MB → {b['heapMB']} MB")

    # ——— 3. 鹈鹕视角反复切换：隐藏的头部部件必须恢复 ———
    vis0 = page.evaluate("(() => { const n = {}; __ride.hero().traverse(o => { if (['skull','eyeL','eyeR','helmet','helmetTrim','crest'].includes(o.name)) n[o.name] = o.visible; }); return n; })()")
    for i in range(12):
        page.evaluate("__ride.cam('pov'); __ride.step(1/60, 3)")
        if i == 5:
            page.evaluate("__ride.sculpt({ beak: 1.1, pouch: 1.1, neck: 1, body: 1 })")      # 视角里重建
            page.evaluate("__ride.step(1/60, 3)")
    hidden = page.evaluate("(() => { const n = {}; __ride.hero().traverse(o => { if (['skull','eyeL','eyeR','helmet','helmetTrim','crest'].includes(o.name)) n[o.name] = o.visible; }); return n; })()")
    check('鹈鹕视角下头部自遮挡件被隐藏', all(v is False for v in hidden.values()) and len(hidden) == 6, hidden)
    page.evaluate("__ride.cam('follow'); __ride.step(1/60, 3)")
    vis1 = page.evaluate("(() => { const n = {}; __ride.hero().traverse(o => { if (['skull','eyeL','eyeR','helmet','helmetTrim','crest'].includes(o.name)) n[o.name] = o.visible; }); return n; })()")
    check('离开鹈鹕视角后头部部件全部恢复', all(v is True for v in vis1.values()) and len(vis1) == 6, vis1)

    # ——— 4. 边界 dt ———
    for dt in (0, 1e-6, 0.05, 0.05):
        page.evaluate(f'__ride.step({dt}, 5)')
    s = page.evaluate('__ride.state()')
    check('dt 为 0 / 极小 / 上限时状态仍为有限数', all((not isinstance(v, float)) or (v == v and abs(v) != float('inf')) for v in s.values()), s)
    check('全程无页面错误', not [l for l in logs if l.startswith(('[pageerror]', '[error]'))], logs[:3])
    check('提示条没有无限堆积', page.evaluate("document.getElementById('toasts').children.length") <= 3)
    browser.close()

bad = [r for r in results if not r['ok']]
(ROOT / 'shots' / 'app').mkdir(parents=True, exist_ok=True)
(ROOT / 'shots' / 'app' / 'soak.json').write_text(json.dumps({'results': results, 'failed': len(bad)}, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'\n{len(results) - len(bad)}/{len(results)} 通过')
sys.exit(1 if bad else 0)
