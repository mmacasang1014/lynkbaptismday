// ---------- update ----------
function update(){
  const p = player;
  let dx=0, dy=0;
  if(keys['up']) dy -= 1;
  if(keys['down']) dy += 1;
  if(keys['left']) dx -= 1;
  if(keys['right']) dx += 1;

  if(joyVec.x || joyVec.y){ dx = joyVec.x; dy = joyVec.y; }

  const mag = Math.hypot(dx,dy);
  if(mag > 1){ dx/=mag; dy/=mag; }

  p.moving = mag > 0.06;
  if(p.moving){
    p.frameT++;
    if(p.frameT % 14 === 0) playFootstep();
  }

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx<0) p.dir='left'; else if(dx>0) p.dir='right';
  } else {
    if(dy<0) p.dir='up'; else if(dy>0) p.dir='down';
  }

  let nx = p.x + dx*p.speed;
  let ny = p.y + dy*p.speed;

  // bounds: stay within scene, but blocked by church wall unless entering door
  nx = Math.max(4, Math.min(W-p.w-4, nx));

  const inDoorX = nx+p.w/2 > doorRect.x && nx+p.w/2 < doorRect.x+doorRect.w;
  const wallLimit = churchBottom+2;
  if(ny < wallLimit && !inDoorX){
    ny = wallLimit;
  }
  ny = Math.max(churchTop-10, Math.min(H-p.h-4, ny));

  p.x = nx; p.y = ny;

  // collect drops
  drops.forEach(d=>{
    if(d.got) return;
    const ddx = (p.x+8)-d.x, ddy=(p.y+10)-d.y;
    if(Math.sqrt(ddx*ddx+ddy*ddy) < 16){
      d.got = true;
      document.querySelectorAll('.drop')[drops.indexOf(d)].classList.add('on');
      playCollect();
      showToast(collected()<3 ? `Blessing gathered — ${collected()}/3` : `All blessings gathered! Head to the door.`);
    }
  });

  // door check
  if(p.y < doorRect.y+doorRect.h && p.y+p.h > doorRect.y && inDoorX){
    if(collected()===3){
      playDoorOpen();
      winGame();
    } else {
      // gently stop them right at threshold
      p.y = wallLimit;
      showToast(`Gather all 3 blessings first (${collected()}/3)`);
    }
  }

  // hidden chest check
  const chDist = Math.hypot((p.x+8)-chest.x, (p.y+10)-chest.y);
  if(!chestOpened && chDist < 20){
    if(collected() === 2){
      chestOpened = true;
      playChestOpen();
      showChestPopup();
    } else if(!chestWarned){
      chestWarned = true;
      showToast("It's locked.");
    }
  } else if(chDist > 34){
    chestWarned = false;
  }
}

let toastTimer=null;
function showToast(msg){
  const b = document.getElementById('bubble');
  b.textContent = msg;
  b.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> b.classList.remove('show'), 1600);
}

function loop(){
  drawBackground();
  drawChest();
  drawDrops();
  drawChurch();
  drawPlayer();
  if(!gameWon && !popupOpen){ update(); }
  requestAnimationFrame(loop);
}

// ---------- win ----------
let gameWon=false;
function winGame(){
  if(gameWon) return;
  gameWon = true;
  setTimeout(playWin, 350);
  document.getElementById('win').classList.add('show');
}

function showChestPopup(){
  popupOpen = true;
  document.getElementById('chestPopup').classList.add('show');
}
function hideChestPopup(){
  popupOpen = false;
  document.getElementById('chestPopup').classList.remove('show');
}

function showMapPopup(){
  document.getElementById('mapPopup').classList.add('show');
}
function hideMapPopup(){
  document.getElementById('mapPopup').classList.remove('show');
}

function resetGame(){
  gameWon=false;
  chestOpened=false;
  chestWarned=false;
  popupOpen=false;
  drops.forEach(d=>d.got=false);
  document.querySelectorAll('.drop').forEach(el=>el.classList.remove('on'));
  player.x = pathCX-8; player.y = H-60; player.dir='down';
  seedTrees();
  document.getElementById('win').classList.remove('show');
  document.getElementById('chestPopup').classList.remove('show');
  document.getElementById('mapPopup').classList.remove('show');
  document.getElementById('dialogue').style.display='none';
  document.getElementById('intro').style.display='flex';
  hideGameControls();
}

function showGameControls(){
  document.getElementById('joystick').style.display='block';
  document.getElementById('muteBtn').style.display='flex';
}
function hideGameControls(){
  document.getElementById('joystick').style.display='none';
  document.getElementById('muteBtn').style.display='none';
}
