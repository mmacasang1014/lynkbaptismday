// ---------- sound ----------
let actx = null, masterGain = null, limiter = null, muted = false, ambientNodes = null, bgmTimer = null;

function initAudio(){
  if(actx) return;
  try{
    actx = new (window.AudioContext||window.webkitAudioContext)();
    limiter = actx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
    limiter.connect(actx.destination);
    masterGain = actx.createGain();
    masterGain.gain.value = muted ? 0 : 0.6;
    masterGain.connect(limiter);
    startAmbient();
  }catch(e){ /* audio unavailable, game still playable */ }
}

function toggleMute(){
  muted = !muted;
  if(masterGain) masterGain.gain.linearRampToValueAtTime(muted?0:0.6, actx.currentTime+0.1);
  document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
  if(!actx) initAudio();
}

function blip(freq, dur, type, vol, delay){
  if(!actx) return;
  delay = delay||0;
  const t0 = actx.currentTime + delay;
  const osc = actx.createOscillator();
  const g = actx.createGain();
  osc.type = type||'sine';
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol!=null?vol:0.15, t0+0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(g); g.connect(masterGain);
  osc.start(t0); osc.stop(t0+dur+0.03);
}

function playFootstep(){ blip(100+Math.random()*24, 0.06, 'square', 0.03); }

function playCollect(){
  blip(659,0.12,'triangle',0.11);
  blip(880,0.16,'triangle',0.10,0.08);
  blip(1175,0.22,'triangle',0.08,0.16);
}

function playDoorOpen(){
  blip(130,0.55,'sawtooth',0.06);
  blip(196,0.65,'sine',0.05,0.12);
}

function playWin(){
  [523.25,659.25,784.0,987.77].forEach((f,i)=> blip(f,0.55,'triangle',0.1,i*0.13));
}

function playChestOpen(){
  [784.0,987.77,1174.66].forEach((f,i)=> blip(f,0.4,'triangle',0.09,i*0.1));
}

// simple, clean angelic backdrop: just a slow, sparse bell phrase — no continuous drone
function startAmbient(){
  if(!actx) return;
  const melody = [523.25, 659.25, 587.33, 392.00];
  let i = 0;
  function nextNote(){
    if(!actx) return;
    if(!muted) blip(melody[i % melody.length], 1.1, 'sine', 0.045);
    i++;
    bgmTimer = setTimeout(nextNote, 3200);
  }
  bgmTimer = setTimeout(nextNote, 3000);
}
