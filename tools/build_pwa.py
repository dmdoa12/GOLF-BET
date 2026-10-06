# golf/golf-bet.html(아티팩트판) -> pwa/index.html(홈 화면 앱판) 변환
import sys
src=open('tools/source.html').read()
lines=src.split('\n')
start=next(i for i,l in enumerate(lines) if l.startswith('// 페이지를 연 시점의 기기 기록 시각'))
end=next(i for i,l in enumerate(lines) if l.startswith("window.addEventListener('pagehide',()=>cloud.flush());"))
new_block=open('tools/pwa_block.js').read().rstrip('\n')
lines[start:end+1]=new_block.split('\n')
s='\n'.join(lines)
def R(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:80])
    s=s.replace(a,b)
R('<span id="savest" class="savest">${cloud.label()}</span>','<span id="savest" class="savest">이 기기에 저장됨</span>')
R("// 계정 저장(db)은 로그인 창이 떠서 껐다. 기록은 이 기기 브라우저 저장소에만 둔다.\n// cloud.init();",
"// 오프라인 실행용 서비스 워커\nif('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});")
R('<title>골프 내기 계산기</title>',open('tools/pwa_head.html').read().rstrip('\n'))
R('''      <button class="danger" type="button" data-act="reset">새 라운드 시작 (전체 초기화)</button>`;''',open('tools/pwa_backup.html').read().rstrip('\n'))
R("""    case 'evenprizes':""","""    case 'export':exportRound();return;
    case 'import':document.getElementById('importFile').click();return;
    case 'evenprizes':""")
R("  undoSnap=snap;\n  document.getElementById('toastMsg').textContent=msg;","  undoSnap=snap;\n  document.getElementById('toastUndo').hidden=!snap;\n  document.getElementById('toastMsg').textContent=msg;")
assert 'cloud' not in s
open('index.html','w').write(s)
print('built',len(s))
