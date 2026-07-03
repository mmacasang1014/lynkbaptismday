// ---------- drawing helpers ----------
function drawBackground(){
  // fallback fill while the image loads
  ctx.fillStyle = '#6FA84A';
  ctx.fillRect(0,0,W,H);
  if(mapBgImg.complete && mapBgImg.naturalWidth){
    // image is 360 wide once scaled; align its bottom (with the built-in
    // flower arch) to the canvas bottom, letting the top run under the church
    const dw = 360, dh = dw * (mapBgImg.naturalHeight/mapBgImg.naturalWidth);
    ctx.drawImage(mapBgImg, 0, H-dh, dw, dh);
  }
}

function quadPoint(p0x,p0y,p1x,p1y,p2x,p2y,s){
  const mt = 1-s;
  return {
    x: mt*mt*p0x + 2*mt*s*p1x + s*s*p2x,
    y: mt*mt*p0y + 2*mt*s*p1y + s*s*p2y
  };
}

function drawEntranceArch(){
  const ay = H-6;
  const off = pathOffsetX(ay);
  const acx = pathCX+off;
  const postH = 44, spread = 30;
  const p0x=acx-spread, p0y=ay-postH+4;
  const p1x=acx,        p1y=ay-postH-16;
  const p2x=acx+spread, p2y=ay-postH+4;

  ctx.fillStyle = '#6B4A2A';
  ctx.fillRect(p0x-3, ay-postH, 6, postH);
  ctx.fillRect(p2x-3, ay-postH, 6, postH);
  ctx.strokeStyle = '#6B4A2A';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(p0x,p0y);
  ctx.quadraticCurveTo(p1x,p1y,p2x,p2y);
  ctx.stroke();

  const cols = ['#D98C8C','#E7CE7A','#F2EAD6','#9FC98F'];
  for(let i=0;i<11;i++){
    const s = i/10;
    const p = quadPoint(p0x,p0y,p1x,p1y,p2x,p2y,s);
    ctx.fillStyle = cols[i%cols.length];
    ctx.beginPath(); ctx.arc(p.x, p.y-2, 2, 0, 7); ctx.fill();
  }
  // flowers climbing the posts
  [p0x,p2x].forEach(px=>{
    for(let i=0;i<4;i++){
      ctx.fillStyle = cols[(i+2)%cols.length];
      ctx.beginPath(); ctx.arc(px+(i%2===0?-3:3), ay-10-i*10, 1.8, 0, 7); ctx.fill();
    }
  });
}

function drawLampPost(lp){
  const halfw = pathHalfWidth(lp.y);
  const off = pathOffsetX(lp.y);
  const x = pathCX+off+lp.side*(halfw+15);
  const y = lp.y;
  ctx.fillStyle = '#4A3320';
  ctx.fillRect(x-1.5, y-24, 3, 24);
  const g = ctx.createRadialGradient(x, y-30, 1, x, y-30, 15);
  g.addColorStop(0, 'rgba(255,225,150,0.65)');
  g.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x-15, y-45, 30, 30);
  ctx.fillStyle = '#3B2412';
  ctx.fillRect(x-3, y-31, 6, 8);
  ctx.fillStyle = '#E7CE7A';
  ctx.fillRect(x-2, y-30, 4, 6);
  ctx.fillStyle = '#4A3320';
  ctx.beginPath();
  ctx.moveTo(x-4, y-31); ctx.lineTo(x, y-36); ctx.lineTo(x+4, y-31);
  ctx.closePath(); ctx.fill();
}

function drawChurch(){
  const cx = pathCX+churchOffsetX;
  const groundY = churchBottom+6;

  // soft ambient glow behind the whole church (makes it read as the "goal")
  const ambient = ctx.createRadialGradient(cx, churchTop+45, 8, cx, churchTop+45, 130);
  ambient.addColorStop(0, 'rgba(255,248,220,0.35)');
  ambient.addColorStop(1, 'rgba(255,248,220,0)');
  ctx.fillStyle = ambient;
  ctx.fillRect(cx-130, churchTop-40, 260, 220);

  const ready = collected()===3;
  const img = ready ? churchOpenImg : churchClosedImg;
  if(img.complete && img.naturalWidth){
    const scaleOffset = !ready ? 1 : 0.8;
    const xPosOffset = !ready ? 0 : -6;
    const yPosOffset = !ready ? 0 : 9;
    const dw = 178 * scaleOffset, dh = dw * (img.naturalHeight/img.naturalWidth);
    ctx.drawImage(img, cx-dw/2 + 20 + xPosOffset, groundY-dh + yPosOffset, dw, dh);
  }

  // door glow hint when ready
  if(ready){
    const g = ctx.createRadialGradient(cx,doorRect.y+20,2,cx,doorRect.y+20,30);
    g.addColorStop(0,'rgba(255,235,160,0.6)');
    g.addColorStop(1,'rgba(255,235,160,0)');
    ctx.fillStyle=g;
    ctx.fillRect(cx-30,doorRect.y-14,60,60);
  }
}

function drawDrops(){
  drops.forEach(d=>{
    if(d.got) return;
    d.bob += 0.06;
    const yy = d.y + Math.sin(d.bob)*3;
    ctx.save();
    ctx.translate(d.x, yy);
    ctx.beginPath();
    ctx.moveTo(0,-9);
    ctx.bezierCurveTo(7,2, 7,10, 0,10);
    ctx.bezierCurveTo(-7,10, -7,2, 0,-9);
    ctx.fillStyle = '#8FC7E6';
    ctx.fill();
    ctx.strokeStyle = '#2F5372';
    ctx.lineWidth=1.3;
    ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.ellipse(-2,0,1.6,3,0,0,7); ctx.fill();
    ctx.restore();
  });
}

function drawChest(){
  const cx = chest.x, cy = chest.y;
  ctx.save();
  ctx.translate(cx, cy);
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0,11,13,3,0,0,7); ctx.fill();

  // base box
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(-12,-2,24,13);
  ctx.fillStyle = '#7c5533';
  ctx.fillRect(-12,-2,24,4);
  // gold trim
  ctx.fillStyle = '#C9A227';
  ctx.fillRect(-12,5,24,2);
  ctx.fillRect(-2,-2,4,13);

  if(chestOpened){
    // glow burst behind open lid
    const g = ctx.createRadialGradient(0,-8,1,0,-8,26);
    g.addColorStop(0,'rgba(255,240,170,0.75)');
    g.addColorStop(1,'rgba(255,240,170,0)');
    ctx.fillStyle=g;
    ctx.fillRect(-26,-34,52,36);
    // open lid, tilted back
    ctx.save();
    ctx.translate(0,-2);
    ctx.rotate(-2.3);
    ctx.fillStyle = '#8a5a34';
    ctx.fillRect(-12,-10,24,10);
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(-12,-3,24,2);
    ctx.restore();
  } else {
    // closed curved lid
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.moveTo(-12,-2);
    ctx.quadraticCurveTo(0,-15,12,-2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a2e17';
    ctx.lineWidth = 1;
    ctx.stroke();
    // lock
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(-3,-8,6,7);
    ctx.fillStyle = '#4a2e17';
    ctx.fillRect(-1,-6,2,3);
  }
  ctx.restore();
}

const PLAYER_ROWS = { down:0, up:1, left:2, right:3 };
const PLAYER_CELL_W = 67, PLAYER_CELL_H = 132;
function drawPlayer(){
  const p = player;
  const x = Math.round(p.x), y = Math.round(p.y);
  // shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x+8,y+20,7,2.4,0,0,7); ctx.fill();

  if(playerSheet.complete && playerSheet.naturalWidth){
    const row = PLAYER_ROWS[p.dir] ?? 0;
    let frame = 1; // neutral standing frame
    if(p.moving){
      const cycle = Math.floor(p.frameT/9) % 4; // 0,1,2,1 walk pattern
      frame = cycle===3 ? 1 : cycle;
    }
    const dw = 26, dh = 50; // drawn size, bigger than the hitbox for visibility
    const dx = x + p.w/2 - dw/2;
    const dy = y + p.h - dh + 4; // anchor feet near the hitbox bottom
    ctx.drawImage(
      playerSheet,
      frame*PLAYER_CELL_W, row*PLAYER_CELL_H, PLAYER_CELL_W, PLAYER_CELL_H,
      dx, dy, dw, dh
    );
  }
}
