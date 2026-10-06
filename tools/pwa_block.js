// 저장: 이 기기(브라우저 저장소)에 바로 쓴다. 홈 화면에 추가해서 쓰면 앱 전용 저장소라 잘 지워지지 않는다.
function save(){
  st.updatedAt=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}
}
// 브라우저에 "이 사이트 저장소는 지우지 말아 달라"고 요청 (지원하는 브라우저만)
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}

// 기록 백업: 파일로 내보내기 / 불러오기
async function exportRound(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  const name=`golf-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
  const blob=new Blob([JSON.stringify({app:'golf-bet',v:1,savedAt:d.toISOString(),state:st},null,1)],{type:'application/json'});
  try{
    const file=new File([blob],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'골프 정산 기록'});return;}
  }catch(e){if(e&&e.name==='AbortError')return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
function importRound(file){
  const rd=new FileReader();
  rd.onload=()=>{
    try{
      const data=JSON.parse(rd.result),raw=data&&data.state?data.state:data;
      if(!raw||!Array.isArray(raw.holes))throw 0;
      const snap=JSON.stringify(st);
      st=normalize(raw);save();renderSettings();render();
      toast('기록을 불러왔습니다',snap);
    }catch(e){toast('골프 정산 기록 파일이 아닙니다',null);}
  };
  rd.readAsText(file);
}

// 라운드 중 화면 꺼짐 방지 (지원하는 브라우저만, 앱이 화면에 있을 때만)
let wakeLock=null;
async function keepAwake(){
  try{if(document.visibilityState==='visible'&&navigator.wakeLock&&!wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}}catch(e){wakeLock=null;}
}
document.addEventListener('visibilitychange',keepAwake);
document.addEventListener('click',keepAwake,{once:true});
keepAwake();
