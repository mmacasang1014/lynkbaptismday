// ---------- canvas ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// ---------- world ----------
const pathCX = W/2;
const churchTop = 40;
const churchBottom = 180;
const churchOffsetX = 22;
const doorRect = { x: pathCX-24+churchOffsetX, y: churchBottom-38, w:48, h:40 };

// gentle S-curve for the path — pinches to 0 right at the church door
function pathOffsetX(y){
  const t = Math.max(0, Math.min(1, (y-churchBottom)/(H-churchBottom)));
  return Math.sin(t*Math.PI*2.2)*14*t;
}
function pathHalfWidth(y){
  const t = Math.max(0, Math.min(1, (y-churchBottom)/(H-churchBottom)));
  return 26 + 20*t;
}

const trees = [];
function seedTrees(){
  trees.length = 0;
  const rows = [170,220,270,320,370,420];
  rows.forEach((y,i)=>{
    const side = i%2===0 ? -1 : 1;
    trees.push({x: pathCX + side*(70+Math.random()*30), y: y + (Math.random()*14-7), r: 15+Math.random()*6, type: Math.random()<0.5?'pine':'round'});
    trees.push({x: pathCX - side*(95+Math.random()*20), y: y + (Math.random()*14-7), r: 12+Math.random()*5, type: Math.random()<0.5?'pine':'round'});
  });
}
seedTrees();

const lampPosts = [ {y:255, side:-1}, {y:375, side:1} ];

const flowers = [];
for(let c=0;c<7;c++){
  const cy = 165 + Math.random()*295;
  const side = Math.random()>0.5?1:-1;
  const halfw = pathHalfWidth(cy);
  const off = pathOffsetX(cy);
  const cx = pathCX+off+side*(halfw+18+Math.random()*38);
  const baseColor = ['#D98C8C','#E7CE7A','#F2EAD6','#9FC98F'][Math.floor(Math.random()*4)];
  const clusterSize = 3+Math.floor(Math.random()*3);
  for(let i=0;i<clusterSize;i++){
    flowers.push({ x: cx+(Math.random()*16-8), y: cy+(Math.random()*16-8), c: baseColor });
  }
}

let drops = [
  {x: pathCX-16, y: 420, got:false, bob:0},
  {x: pathCX+22, y: 300, got:false, bob:Math.PI/3},
  {x: pathCX-10, y: 190, got:false, bob:Math.PI/1.5}
];

// hidden chest — tucked off the path, only opens once 2 blessings are collected
const chest = { x: pathCX+118 + 20, y: 312 + 100 };
let chestOpened = false, chestWarned = false, popupOpen = false;

// ---------- player ----------
const player = { x: pathCX-8, y: H-60, w:16, h:20, speed:2.1, dir:'down', frame:0, frameT:0, moving:false };
const keys = {};

function collected(){ return drops.filter(d=>d.got).length; }
