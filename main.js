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

function start() {
    canvas.focus();
    window.addEventListener("keypress", jump, false);
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
}

function jump(e) {
    if ((e.keyCode === 32 || e.code === "Space") && cube.onGround) { 
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

function cyclic() {
    drawEnv();
    drawCube();
    gameLogic();
}

