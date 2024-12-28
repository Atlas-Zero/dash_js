const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const cube = {
    x: 250,
    y: 100,
    w: 30,
    h: 30,
    dy: 5,
    gravity: 0.5,
    jumpStrength: -10,
    onGround: false
}

const spike = {
    p1x: 1000,
    p1y: 730,
    p2x: 1015,
    p2y: 700,
    p3x: 1030,
    p3y: 730
}

var speed = {
    speedx: 5.5
}

function start() {
    canvas.focus();
    window.addEventListener("keypress", jumpPc, false);
    canvas.addEventListener("touchstart", jumpMobile, false);
    setInterval(cyclic, 15)
}

function gameLogic() {
    // gravity
    cube.dy += cube.gravity;
    cube.y += cube.dy;

    // limit: 
    if (cube.y >= 700) {
        cube.y = 700;
        cube.dy = 0;
        cube.onGround = true;
    } else {
        cube.onGround = false;
    }

    //spike movement <--
    spike.p1x -= speed.speedx;
    spike.p2x -= speed.speedx;
    spike.p3x -= speed.speedx;
}

function jumpPc(e) {
    // pc
    if ((e.keyCode === 32 || e.code === "Space") && cube.onGround) {
        cube.dy = cube.jumpStrength;
    }
}

function jumpMobile(e) {
    // mobile
    e.preventDefault();
    if (cube.onGround) {
        cube.dy = cube.jumpStrength;
    }
}

function drawEnv() {
    // refresh canvas
    canvas.width = canvas.width;
}

function drawCube() {
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(cube.x, cube.y, cube.w, cube.h);
}

function drawSpike() {

    ctx.beginPath();
    ctx.moveTo(spike.p1x, spike.p1y);
    ctx.lineTo(spike.p2x, spike.p2y);
    ctx.lineTo(spike.p3x, spike.p3y);
    ctx.lineTo(spike.p1x, spike.p1y);
    ctx.fillStyle = "ghostwhite";
    ctx.fill();
    ctx.stroke();
}

function cyclic() {
    drawEnv();
    drawCube();
    drawSpike();
    gameLogic();
}

