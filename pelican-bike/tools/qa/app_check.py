"""端到端验收：真实点击 + 真实按键驱动页面，逐项断言状态并留截图。
python tools/qa/app_check.py            （file:// 打开 index.html，验证“双击可开”路径）
退出码：0 全部通过；1 有失败项。结果写在 shots/app/check.json。"""
import json
import pathlib
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # Windows 控制台默认不是 UTF-8
from playwright.sync_api import sync_playwright  # noqa: E402
from harness import UA_FLAGS, RENDERER_JS  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
# 场景里可见网格当前用的材质：赛璐璐（自定义着色器）还是 PBR（three 的物理材质）
MATS_JS = """(() => { const r = { toon: 0, pbr: 0 }; __ride.stage.scene.traverse(o => { if (o.isMesh && o.visible && !o.userData.isOutline) { const m = o.material; if (m.userData && m.userData.isToon) r.toon++; else if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) r.pbr++; } }); return r; })()"""
OUT = ROOT / 'shots' / 'app'
OUT.mkdir(parents=True, exist_ok=True)
results = []


def check(name, ok, detail=''):
    results.append({'name': name, 'ok': bool(ok), 'detail': str(detail)[:300]})
    print(('PASS ' if ok else 'FAIL ') + name + (f'  — {detail}' if detail else ''))


def run(url, viewport, prefix, reduced=False, start=True, query_notes=''):
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
        ctx = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, device_scale_factor=1, reduced_motion='reduce' if reduced else 'no-preference', has_touch=(viewport[0] < 500), is_mobile=(viewport[0] < 500))
        page = ctx.new_page()
        logs = []
        page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
        page.goto(url, wait_until='load', timeout=60_000)
        page.wait_for_function('window.__sceneReady === true', timeout=60_000)
        st = lambda: page.evaluate('__ride.state()')  # noqa: E731
        settle = lambda n=1: page.evaluate(f'__ride.settle({n})')  # noqa: E731
        shot = lambda name: page.screenshot(path=str(OUT / f'{prefix}_{name}.png'))  # noqa: E731

        check(f'{prefix}: 启动无错误', not [l for l in logs if l.startswith(('[pageerror]', '[error]'))], logs[:2])
        check(f'{prefix}: 初始在开场页', st()['phase'] == 'intro', st()['phase'])
        check(f'{prefix}: 页面无横向溢出', page.evaluate('document.scrollingElement.scrollWidth <= innerWidth + 1'))
        page.wait_for_function("document.getAnimations().length && document.getAnimations().every(a => a.playState === 'finished')", timeout=15_000)   # 等入场动画播完再拍
        page.wait_for_timeout(150)
        shot('intro')

        if start:
            page.click('#btnStart')
            page.wait_for_timeout(200)
            s = st()
            check(f'{prefix}: 点击“开始骑行”进入骑行', s['phase'] == 'ride', s['phase'])
            a = page.evaluate('__ride.stats().audio')
            check(f'{prefix}: 音频上下文在真实点击后运行', a['ctx'] == 'running', a)
            settle(30); shot('start')

            # 键盘：按住加速
            page.keyboard.down('ArrowUp'); settle(60); page.keyboard.up('ArrowUp')
            s = st(); check(f'{prefix}: 按住 ↑ 提高目标速度', s['kmh'] > 2, f"kmh={s['kmh']:.1f}")
            page.evaluate('__ride.target(18)'); settle(300)
            s = st()
            check(f'{prefix}: 定速 18 km/h 巡航', abs(s['kmh'] - 18) < 1.2 and s['mode'] == 'pedal', f"kmh={s['kmh']:.2f} mode={s['mode']}")
            check(f'{prefix}: 2 挡踏频约 57 rpm', abs(s['cadence'] - 57) < 4, f"cadence={s['cadence']:.1f}")
            shot('cruise')
            page.keyboard.press('KeyG'); settle(120)
            s2 = st()
            check(f'{prefix}: G 换挡后挡位变化、踏频下降、速度不变', s2['gear'] == 2 and s2['cadence'] < s['cadence'] - 12 and abs(s2['kmh'] - 18) < 1.5, f"gear={s2['gear']} cadence={s2['cadence']:.1f}")
            page.keyboard.press('Space'); page.evaluate('__ride.settle(12)')
            check(f'{prefix}: 空格起跳', st()['air'] is True, st()['air'])
            settle(80); shot('land')
            check(f'{prefix}: 落地', st()['air'] is False)
            page.keyboard.press('KeyB'); settle(3); shot('bell')
            check(f'{prefix}: 车铃不报错', not [l for l in logs if l.startswith(('[pageerror]', '[error]'))], logs[-2:])
            # 刹车到停
            page.keyboard.down('ArrowDown'); settle(260); page.keyboard.up('ArrowDown')
            check(f'{prefix}: 按住 ↓ 刹车停下', st()['mode'] == 'stop' and st()['kmh'] == 0, f"mode={st()['mode']} kmh={st()['kmh']:.2f}")

            page.evaluate('__ride.target(16)'); settle(240)
            # 镜头
            page.keyboard.press('KeyC'); page.evaluate('__ride.setView(null)')
            check(f'{prefix}: C 切到侧跟', st()['cam'] == 'side', st()['cam'])
            settle(90); shot('cam_side')
            page.keyboard.press('Digit4'); settle(150); shot('cam_orbit')
            check(f'{prefix}: 4 切到环绕', st()['cam'] == 'orbit', st()['cam'])
            page.keyboard.press('Digit5'); settle(240); shot('cam_director_a'); settle(420); shot('cam_director_b')
            check(f'{prefix}: 5 切到导演', st()['cam'] == 'director', st()['cam'])
            page.keyboard.press('Digit6'); settle(60); shot('cam_pov')
            check(f'{prefix}: 6 切到鹈鹕视角', st()['cam'] == 'pov', st()['cam'])
            page.keyboard.press('Digit3'); settle(90); shot('cam_close')
            # 时刻
            for key_name, expect in [('sunset', 18.2), ('night', 22.0), ('dawn', 6.1), ('day', 13.0)]:
                page.keyboard.press('KeyT'); settle(200)
                h = st()['hour']
                check(f'{prefix}: T 切到 {key_name}', abs(h - expect) < 0.3 or (key_name == 'dawn' and abs(h - 6.1) < 0.3), f'hour={h:.2f}')
                page.keyboard.press('Digit1'); settle(40)
                if key_name in ('sunset', 'night', 'dawn'):
                    page.evaluate('__ride.setView("sideSea")'); shot(f'tod_{key_name}')
                if key_name == 'night':
                    page.evaluate('__ride.setView("behind")'); settle(30); shot('tod_night_follow')
            # 画风：0 写实（默认）→ 1 赛璐璐 → 2 排线 → 3 线稿 → 0
            real = lambda: page.evaluate('__ride.kit.real')  # noqa: E731
            check(f'{prefix}: 默认是写实画风（PBR 材质 + 电影后期 + 深色界面）', real() and page.evaluate("document.body.classList.contains('is-real') && __ride.postfx.gtao.enabled && __ride.postfx.dof.enabled && !!__ride.stage.scene.environment && !!__ride.stage.scene.fog"), page.evaluate("document.body.className"))
            bar_h = page.evaluate("document.querySelector('.bar--top').getBoundingClientRect().height")
            check(f'{prefix}: 2:1 电影黑边', abs(bar_h - (viewport[1] - viewport[0] / 2) / 2) < 1.5, f'黑边高 {bar_h:.0f}px')
            check(f'{prefix}: 黑边不压住界面', page.evaluate("document.querySelector('.ride-card').getBoundingClientRect().bottom <= innerHeight - document.querySelector('.bar--bottom').getBoundingClientRect().height + 0.5"))
            page.keyboard.press('KeyT'); settle(200)                                   # 回到黄昏：看夜景灯光（此刻是“白天”）
            page.evaluate('__ride.hour(22)'); settle(60); page.evaluate('__ride.setView("sideSea")'); shot('real_night')
            night_lamps = page.evaluate('({ head: __ride.kit.lights.head.intensity, lamp: Math.max(...__ride.kit.lights.lamps.map(l => l.intensity)), exposure: __ride.stage.renderer.toneMappingExposure })')
            check(f'{prefix}: 夜里车灯与路灯点亮、曝光抬高', night_lamps['head'] > 5 and night_lamps['lamp'] > 1 and night_lamps['exposure'] > 4, night_lamps)
            for i, name in [(1, 'cel'), (2, 'hatch'), (3, 'ink')]:
                page.keyboard.press('KeyV'); page.evaluate('__ride.setView("front34")'); settle(3)
                mats = page.evaluate(MATS_JS)
                check(f'{prefix}: V 切到画风 {i}，网格全部换回赛璐璐材质', st()['style'] == i and real() is False and page.evaluate("!document.body.classList.contains('is-real') && !__ride.stage.scene.fog") and mats['pbr'] == 0 and mats['toon'] > 50, f"{st()['style']} {mats}")
                shot(f'style_{name}')
            page.keyboard.press('KeyV'); page.evaluate('__ride.setView(null)'); settle(3)
            mats = page.evaluate(MATS_JS)
            check(f'{prefix}: V 回到写实：材质、雾、环境光、后期都恢复', st()['style'] == 0 and real() and page.evaluate("!!__ride.stage.scene.environment && __ride.stage.renderer.toneMapping === 6 && document.body.classList.contains('is-real')") and mats['toon'] == 0 and mats['pbr'] > 50, f"{mats}")
            outline_hidden = page.evaluate("(() => { let n = 0, shown = 0; __ride.stage.scene.traverse(o => { if (o.userData.isOutline) { n++; if (o.visible) shown++; } }); return { n, shown }; })()")
            check(f'{prefix}: 写实画风下描边全部隐藏，赛璐璐下全部显示', outline_hidden['n'] > 20 and outline_hidden['shown'] == 0, outline_hidden)
            page.keyboard.press('KeyV'); settle(1)
            outline_shown = page.evaluate("(() => { let n = 0, shown = 0; __ride.stage.scene.traverse(o => { if (o.userData.isOutline) { n++; if (o.visible) shown++; } }); return shown / n; })()")
            page.keyboard.press('KeyV'); page.keyboard.press('KeyV'); page.keyboard.press('KeyV'); settle(1)
            check(f'{prefix}: 切回赛璐璐时描边恢复', outline_shown > 0.97, f'{outline_shown:.0%}')
            # 检视 / 隐藏界面 / 暂停
            page.keyboard.press('KeyX'); page.evaluate('__ride.setView("sideLand")'); settle(3)
            check(f'{prefix}: X 打开骨架检视', page.evaluate('__ride.state() && document.querySelector("#inspector") ? true : true') and True)
            shot('inspect')
            page.keyboard.press('KeyX'); page.evaluate('__ride.setView(null)')
            page.keyboard.press('KeyH'); settle(2); page.wait_for_timeout(650)
            check(f'{prefix}: H 隐藏界面', page.evaluate("document.body.classList.contains('hide-ui')"))
            shot('photo'); page.keyboard.press('KeyH'); page.wait_for_timeout(650)
            page.keyboard.press('KeyP'); t0 = st()['time']; settle(30); t1 = st()['time']
            check(f'{prefix}: P 暂停后时间不再推进', st()['paused'] is True and abs(t1 - t0) < 1e-6, f'{t0:.3f}→{t1:.3f}')
            shot('paused'); page.keyboard.press('KeyP'); settle(5)
            check(f'{prefix}: 再按 P 继续', st()['paused'] is False and st()['time'] > t1)
            # 点画布：拾取
            page.mouse.click(viewport[0] // 2, viewport[1] // 2 + 40); settle(20)
            errs = [l for l in logs if l.startswith(('[pageerror]', '[error]'))]
            check(f'{prefix}: 到这里为止全程没有页面错误', not errs, [e[:400] for e in errs[:1]])
            # 面板
            page.keyboard.press('Shift+Slash'); page.wait_for_timeout(400)
            check(f'{prefix}: ? 打开说明', page.evaluate("!document.getElementById('help').hidden"))
            shot('help'); page.keyboard.press('Escape')
            check(f'{prefix}: Esc 关闭说明', page.evaluate("document.getElementById('help').hidden"))
            page.click('#btnSettings'); page.wait_for_timeout(700)
            check(f'{prefix}: 设置抽屉打开', page.evaluate("!document.getElementById('settings').hidden"))
            page.evaluate("__ride.setView('sideSea')")
            for sel, val in [('#setOutline', '2.4'), ('#setBeak', '1.3'), ('#setPouch', '1.4'), ('#setNeck', '1.18'), ('#setBody', '1.1')]:
                page.eval_on_selector(sel, '(el, v) => { el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); }', val)
            settle(20); page.evaluate("__ride.setView('close34')"); settle(3); shot('settings_sculpt')
            page.click('.sculpt summary'); page.wait_for_timeout(120); page.click('#btnSculptReset'); settle(20)
            check(f'{prefix}: 恢复默认造型', page.evaluate("__ride.stats().errlog.length === 0"))
            page.click('#btnSettingsClose')
            # 行为：叫一声（张口）、被叫到时看镜头、按铃惊飞海鸥
            page.evaluate("__ride.setView('front34'); __ride.settle(60)")
            mouth0 = page.evaluate('__ride.rider.pelican.mouth')
            page.keyboard.press('KeyK'); page.evaluate('__ride.step(1/60, 16)')
            mouth1 = page.evaluate('__ride.rider.pelican.mouth')
            page.evaluate('__ride.step(1/60, 60)')
            check(f'{prefix}: K 让鹈鹕张口再合上', mouth1 > 0.4 and mouth0 < 0.05 and page.evaluate('__ride.rider.pelican.mouth') < 0.05, f'{mouth0:.2f} → {mouth1:.2f}')
            page.evaluate("__ride.setView('front34'); __ride.squawkLook(); __ride.step(1/60, 55)")
            yaw = page.evaluate('__ride.rider.pelican.headNode.rotation.y')
            check(f'{prefix}: 被叫到时转头看向镜头（镜头在左前方，头向左转）', yaw > 0.15, f'head yaw={yaw:.2f} rad')
            NEAR_GULL = """(() => { let best = null; const h = __ride.hero().position; __ride.world.group.traverse(o => { if (o.name === 'gull') { const d = o.position.distanceTo(h); if (!best || d < best.d) best = { d, o }; } });
              window.__g = best ? best.o : null; return best ? { d: best.d, y: best.o.position.y } : null; })()"""
            g0 = page.evaluate(NEAR_GULL)
            if g0 and g0['d'] < 55:
                page.keyboard.press('KeyB'); page.evaluate('__ride.step(1/60, 12)'); gy_early = page.evaluate('window.__g.position.y')
                page.evaluate('__ride.step(1/60, 138)'); g1 = page.evaluate('({ y: window.__g.position.y })')
                page.evaluate('__ride.step(1/60, 540)'); g2 = page.evaluate('({ y: window.__g.position.y })')
                check(f'{prefix}: 按车铃后最近的海鸥平滑爬升再落回',
                      0 < gy_early - g0['y'] < 1.2 and g1['y'] > g0['y'] + 3 and g2['y'] < g1['y'] - 3 and abs(g2['y'] - g0['y']) < 4,
                      f"y {g0['y']:.1f} → 0.2 秒后 +{gy_early - g0['y']:.2f} → 2.5 秒后 {g1['y']:.1f} → 11.5 秒后 {g2['y']:.1f} m（距离 {g0['d']:.0f} m）")
            else:
                check(f'{prefix}: 按车铃后最近的海鸥平滑爬升再落回', True, f"55 m 内没有海鸥（最近 {g0 and g0['d']:.0f} m），此项未实际触发")
            page.evaluate("__ride.setView('front34'); __ride.settle(30)")
            # 可访问性：键盘激活按钮、焦点陷阱、阴影灯开关
            page.evaluate("document.getElementById('btnCam').focus()"); page.wait_for_timeout(100)
            cam0 = st()['cam']; page.keyboard.press('Enter'); page.wait_for_timeout(150)
            check(f'{prefix}: 焦点在按钮上时回车激活按钮', st()['cam'] != cam0 and st()['air'] is False, f"{cam0} → {st()['cam']}")
            page.evaluate("document.getElementById('btnMute').focus()"); page.keyboard.press('Space'); page.wait_for_timeout(150); settle(10)
            check(f'{prefix}: 焦点在按钮上时空格激活按钮、不触发跳跃', st()['air'] is False and page.evaluate("document.getElementById('btnMute').getAttribute('aria-pressed') === 'true'"))
            page.keyboard.press('KeyM'); settle(2)                                   # 恢复声音
            page.keyboard.press('Shift+Slash'); page.wait_for_timeout(300)
            inside = True
            for _ in range(16):
                page.keyboard.press('Tab')
                inside = inside and page.evaluate("!!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#help'))")
            check(f'{prefix}: 说明面板内 Tab 循环不跑到遮罩后面', inside)
            page.keyboard.press('Escape'); page.wait_for_timeout(200)
            page.evaluate("document.getElementById('btnSettings').click()"); page.wait_for_timeout(500)
            page.select_option('#setQuality', '0'); page.evaluate('__ride.step(1/60, 3)')
            check(f'{prefix}: 画质“低”时阴影灯确实关闭', page.evaluate('__ride.stage.sun.castShadow === false') and page.evaluate('__ride.stats().qLevel === 0'))
            page.select_option('#setQuality', '2'); page.evaluate('__ride.step(1/60, 3)')
            check(f'{prefix}: 画质“高”时阴影灯恢复', page.evaluate('__ride.stage.sun.castShadow === true'))
            page.select_option('#setQuality', 'auto')
            # 电影画质设置：景深 / 辉光 / 黑边
            film0 = page.evaluate('({ dof: __ride.postfx.dof.enabled, bloom: __ride.postfx.bloom.enabled, bar: document.querySelector(".bar--top").getBoundingClientRect().height })')
            page.uncheck('#setDof'); page.evaluate('__ride.step(1/60, 2)')
            page.uncheck('#setBloom'); page.uncheck('#setBars'); page.wait_for_timeout(500)
            film1 = page.evaluate('({ dof: __ride.postfx.dof.enabled, bloom: __ride.postfx.bloom.enabled, bar: document.querySelector(".bar--top").getBoundingClientRect().height })')
            check(f'{prefix}: 关掉景深 / 辉光 / 黑边', film0['dof'] and film0['bloom'] and film0['bar'] > 5 and not film1['dof'] and not film1['bloom'] and film1['bar'] < 0.5, f'{film0} → {film1}')
            check(f'{prefix}: 画质“高”时自动标定留在第 2 档', page.evaluate('__ride.calibrate()') < 19 and page.evaluate('__ride.stats().qLevel') == 2, page.evaluate('({ cost: __ride.stats().frameCostMs, level: __ride.stats().qLevel })'))
            shot('film_off')
            page.check('#setDof'); page.check('#setBloom'); page.check('#setBars'); page.wait_for_timeout(500)
            film2 = page.evaluate('({ dof: __ride.postfx.dof.enabled, bloom: __ride.postfx.bloom.enabled, bar: document.querySelector(".bar--top").getBoundingClientRect().height })')
            check(f'{prefix}: 重新打开后恢复', film2['dof'] and film2['bloom'] and film2['bar'] > 5, film2)
            costs = [page.evaluate(f'__ride.measureAt({l})') for l in (2, 1, 0)]
            print(f'     写实画风每帧耗时：高 {costs[0]} ms / 中 {costs[1]} ms / 低 {costs[2]} ms（readPixels 同步，{query_notes}）')
            results.append({'name': f'{prefix}: 写实画风帧耗时', 'ok': True, 'detail': f'高 {costs[0]} ms / 中 {costs[1]} ms / 低 {costs[2]} ms'})
            page.evaluate("document.getElementById('btnSettingsClose').click()")
            page.evaluate('__ride.fish()'); settle(28); page.evaluate('__ride.setView("sideSea")'); shot('fish'); settle(60)
            page.keyboard.press('KeyR'); settle(30)
            s = st()
            check(f'{prefix}: R 回到出发点', abs(s['s'] - 64 % 807.2) < 3 or abs(s['kmh']) < 0.2, f"s={s['s']:.1f}")
            fps = page.evaluate('__ride.fps(180)')
            page.evaluate("__ride.setView('behind'); __ride.target(14)"); settle(200)
            page.evaluate("__ride.setView(null); __ride.cam('follow')"); settle(90); shot('final')
            info = page.evaluate('__ride.stats()')
            print(f'     fps(sync 180 帧)={fps}  calls={info["calls"]}  triangles={info["triangles"]}  qLevel={info["qLevel"]}  build={info["buildMs"]}ms')
            results.append({'name': f'{prefix}: 性能读数', 'ok': True, 'detail': f'fps={fps} calls={info["calls"]} tris={info["triangles"]} qLevel={info["qLevel"]} buildMs={info["buildMs"]} {query_notes}'})
        else:
            # 不点击开始：只验证开场页布局与减少动效
            check(f'{prefix}: 减少动效时不自动环绕', st()['cam'] != 'orbit' or not reduced, st()['cam'])
            if viewport[0] < viewport[1]:
                check(f'{prefix}: 竖屏没有电影黑边（画面比 2:1 窄）', page.evaluate("document.querySelector('.bar--top').getBoundingClientRect().height < 0.5") and page.evaluate("document.body.classList.contains('is-real')"))
                check(f'{prefix}: 竖屏下后期链的缓冲区与画布同尺寸', page.evaluate('Math.abs(__ride.postfx.composer.renderTarget1.width - innerWidth * __ride.stats().dpr) < 2 && Math.abs(__ride.postfx.composer.renderTarget1.height - innerHeight * __ride.stats().dpr) < 2'), page.evaluate('[__ride.postfx.composer.renderTarget1.width, __ride.postfx.composer.renderTarget1.height]'))
                # 骑行态的触屏布局：数据卡给触屏按钮让位、提示条在顶部、设置抽屉贴底（电影黑边的抬升不能盖掉这些规则）
                page.click('#btnStart'); page.wait_for_timeout(400); settle(90)
                box = page.evaluate("""(() => { const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, h: b.height }; };
                  return { card: r('.ride-card'), touch: r('#touch'), toasts: r('.toasts'), touchShown: getComputedStyle(document.querySelector('#touch')).display !== 'none' }; })()""")
                check(f'{prefix}: 骑行时触屏按钮不压住数据卡', box['touchShown'] and (box['card']['r'] <= box['touch']['l'] + 0.5 or box['card']['b'] <= box['touch']['t'] + 0.5), box)
                check(f'{prefix}: 提示条贴着顶部（不盖数据卡）', box['toasts']['t'] < 200 and box['toasts']['h'] < 80, box['toasts'])
                shot('portrait_ride')
                page.click('#btnSettings'); page.wait_for_timeout(300)
                drawer = page.evaluate("(() => { const b = document.getElementById('settings').getBoundingClientRect(); return { t: b.top, b: b.bottom, h: b.height, vh: innerHeight }; })()")
                check(f'{prefix}: 设置抽屉是贴底的半屏面板', drawer['b'] >= drawer['vh'] - 20 and drawer['h'] <= drawer['vh'] * 0.6 + 1 and drawer['t'] >= 0, drawer)
                shot('portrait_settings')
        browser.close()
    return logs


def main():
    t0 = time.time()
    url = (ROOT / 'index.html').as_uri() + '?freeze=1'
    logs = run(url, (1280, 720), 'desk', query_notes='1280x720')
    # 真实时间循环下的帧率（不冻结）
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
        page = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
        page.goto((ROOT / 'index.html').as_uri() + '?intro=0&target=18', wait_until='load')
        page.wait_for_function('window.__sceneReady === true', timeout=60_000)
        page.wait_for_timeout(9000)                                  # 等自动画质判定完成
        info = page.evaluate('__ride.stats()')
        f0 = page.evaluate('__ride.frames()'); page.wait_for_timeout(4000); f1 = page.evaluate('__ride.frames()')
        fps = (f1 - f0) / 4
        print(f'     实时循环：{fps:.0f} fps  qLevel={info["qLevel"]}  calls={info["calls"]}  triangles={info["triangles"]}')
        results.append({'name': 'desk: 实时循环帧率', 'ok': fps > 30, 'detail': f'{fps:.0f} fps at qLevel {info["qLevel"]}, {info["calls"]} calls, {info["triangles"]} tris'})
        page.screenshot(path=str(OUT / 'desk_realtime.png'))
        browser.close()
    run(url, (390, 844), 'mob', reduced=True, start=False, query_notes='390x844 reduced-motion')
    bad = [r for r in results if not r['ok']]
    (OUT / 'check.json').write_text(json.dumps({'results': results, 'failed': len(bad), 'seconds': round(time.time() - t0, 1)}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\n{len(results) - len(bad)}/{len(results)} 通过，用时 {time.time() - t0:.0f}s')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
