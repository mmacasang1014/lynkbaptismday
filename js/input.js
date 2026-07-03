// ---------- input ----------
const keyMap = {
  ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
  w:'up', s:'down', a:'left', d:'right',
  W:'up', S:'down', A:'left', D:'right'
};
window.addEventListener('keydown', e=>{
  if(keyMap[e.key]){ keys[keyMap[e.key]] = true; e.preventDefault(); }
});
window.addEventListener('keyup', e=>{
  if(keyMap[e.key]){ keys[keyMap[e.key]] = false; }
});

// fixed joystick, anchored bottom-left
const joyVec = {x:0, y:0};
let joyActive = false, joyOrigin = {x:0,y:0};
const joystickEl = document.getElementById('joystick');
const joyKnobEl = document.getElementById('joyKnob');
const stageEl = document.getElementById('stage');
const JOY_MAX = 34;

function stagePoint(e){
  const r = stageEl.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function joyBaseCenter(){
  const jr = joystickEl.getBoundingClientRect();
  const sr = stageEl.getBoundingClientRect();
  return { x: jr.left - sr.left + jr.width/2, y: jr.top - sr.top + jr.height/2 };
}
canvas.style.touchAction = 'none';

joystickEl.addEventListener('pointerdown', e=>{
  joyActive = true;
  joyOrigin = joyBaseCenter();
  joystickEl.classList.add('active');
  joystickEl.setPointerCapture(e.pointerId);
  e.preventDefault();
});
joystickEl.addEventListener('pointermove', e=>{
  if(!joyActive) return;
  const p = stagePoint(e);
  const dx = p.x - joyOrigin.x, dy = p.y - joyOrigin.y;
  const dist = Math.min(Math.hypot(dx,dy), JOY_MAX);
  const ang = Math.atan2(dy,dx);
  const kx = Math.cos(ang)*dist, ky = Math.sin(ang)*dist;
  joyKnobEl.style.transform = `translate(${kx}px,${ky}px)`;
  const norm = dist < 5 ? 0 : dist/JOY_MAX;
  joyVec.x = Math.cos(ang)*norm;
  joyVec.y = Math.sin(ang)*norm;
  e.preventDefault();
});
function endJoy(){
  joyActive = false;
  joystickEl.classList.remove('active');
  joyKnobEl.style.transform = 'translate(0px,0px)';
  joyVec.x = 0; joyVec.y = 0;
}
joystickEl.addEventListener('pointerup', endJoy);
joystickEl.addEventListener('pointercancel', endJoy);
joystickEl.addEventListener('pointerleave', endJoy);

document.getElementById('startBtn').addEventListener('click', ()=>{
  document.getElementById('intro').style.display='none';
  document.getElementById('dialogue').style.display='flex';
  initAudio();
});
document.getElementById('dlgBeginBtn').addEventListener('click', ()=>{
  document.getElementById('dialogue').style.display='none';
  showGameControls();
});
document.getElementById('againBtn').addEventListener('click', resetGame);
document.getElementById('muteBtn').addEventListener('click', toggleMute);
document.getElementById('chestContinueBtn').addEventListener('click', hideChestPopup);
document.getElementById('mapBtn').addEventListener('click', showMapPopup);
document.getElementById('mapCloseBtn').addEventListener('click', hideMapPopup);
