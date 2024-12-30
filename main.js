const canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
const ctx = canvas.getContext("2d");

const cube = {
    x: 250,
    y: canvas.height - 100,
    w: 30,
    h: 30,
    dy: 5,
    gravity: 0.5,
    jumpStrength: -10,
    onGround: false
}

const obj_spawnpoint = {
    x: canvas.width + 100,
    y: canvas.height - 100
}

const spike = {
    point1x: obj_spawnpoint.x + 15, //Startpunkt, Spitze
    point1y: obj_spawnpoint.y,
    point2x: obj_spawnpoint.x + cube.w, //rechte Ecke
    point2y: obj_spawnpoint.y + cube.h,
    point3x: obj_spawnpoint.x, //linke Ecke, Endpunkt
    point3y: obj_spawnpoint.y + cube.h
}

const spike_Hitbox = {
    x: (spike.point1x + spike.point3x) / 2 + 8, //15
    y: spike.point1y + 5, //5
    w: 10,
    h: 20
}

const spike_Hitbox2 = {
    x: (spike.point1x + spike.point3x) / 2 + 3, //10
    y: spike.point1y + 15, //15
    w: 20,
    h: 15
}

const box = {
    x: obj_spawnpoint.x,
    y: obj_spawnpoint.y,
    w: cube.w,
    h: cube.h
}

const boxes = [
    { x: obj_spawnpoint.x + 80, y: obj_spawnpoint.y, w: cube.w, h: cube.h },
    { x: obj_spawnpoint.x + 300, y: obj_spawnpoint.y - 30, w: cube.w, h: cube.h }
]

var toggle_Hitbox = false;

var speed = {
    speedx: 5.5
}

var box_top_y = 0;

function start() {
    canvas.focus();
    window.addEventListener("keypress", jumpPc, false);
    window.addEventListener("touchstart", jumpMobile, false);
    window.addEventListener("keydown", drawHitbox, false);
    setInterval(cyclic, 15)
}

function gameLogic() {
    // gravity
    cube.dy += cube.gravity;
    cube.y += cube.dy;

    // limit: 
    if (cube.y >= canvas.height - 100) {
        cube.y = canvas.height - 100;
        cube.dy = 0;
        cube.onGround = true;
    } else {
        cube.onGround = false;
    }

    //box jump
    box_jump();

    //spike movement <--
    spike.point1x -= speed.speedx;  //können hier auch += schreiben und speed.speedx auf -0.5 ändern, sieht vlt verständlicher aus
    spike.point2x -= speed.speedx;
    spike.point3x -= speed.speedx;
    spike_Hitbox.x -= speed.speedx;
    spike_Hitbox2.x -= speed.speedx;

    //box movement <--
    boxes.forEach(function (b) {
        b.x -= speed.speedx;
    })

    if (checkHitbox(cube.x, cube.y, cube.w, cube.h, spike_Hitbox, "top") || checkHitbox(cube.x, cube.y, cube.w, cube.h, spike_Hitbox2, "top")) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cube.y = 250;
        window.alert("Game Over");
        location.reload();
    }
    if (toggle_Hitbox === true) {
        drawSpike_Hitbox();
        drawSpike_Hitbox2();
    }
}

function jumpPc(e) {
    // pc
    if ((e.keyCode === 32 || e.code === "Space") && cube.onGround) {
        cube.dy = cube.jumpStrength;
        console.log(`Jump PC`);
    }
}

function jumpMobile(e) {
    // mobile
    e.preventDefault();
    if (cube.onGround) {
        cube.dy = cube.jumpStrength;
        console.log(`Jump Mobile`);
    }
}

function box_jump() {
    boxes.forEach(function (b) {
        if (checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "top")) {
            cube.onGround = true;
            cube.y = b.y - b.h;
            cube.dy = 0;
            console.log(`checkHitboxTop`)
        }
    })
}

function drawEnv() {
    // refresh canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function drawGround() {
    ctx.strokeStyle = "grey"
    ctx.beginPath();
    ctx.moveTo(0, obj_spawnpoint.y + cube.h);
    ctx.lineTo(canvas.width, obj_spawnpoint.y + cube.h);
    ctx.closePath();
    ctx.stroke();
}

function drawCube() {
    ctx.lineWidth = 1;
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(cube.x, cube.y, cube.w, cube.h);
}

function drawSpike() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(spike.point1x, spike.point1y);
    ctx.lineTo(spike.point2x, spike.point2y);
    ctx.lineTo(spike.point3x, spike.point3y);
    ctx.closePath();
    ctx.fillStyle = "ghostwhite";
    ctx.fill();
    ctx.stroke();
}

function drawSpike_Hitbox() {
    ctx.fillStyle = "red";
    ctx.fillRect(spike_Hitbox.x, spike_Hitbox.y, spike_Hitbox.w, spike_Hitbox.h);
}

function drawSpike_Hitbox2() {
    ctx.fillStyle = "red";
    ctx.fillRect(spike_Hitbox2.x, spike_Hitbox2.y, spike_Hitbox2.w, spike_Hitbox2.h);
}

// box_positions.forEach(function(positions) {
//     function drawBox(positions.x, positions.y);
// });
//hätte wahrscheinlich eh nicht funktioniert....

function drawBox(x, y, w, h) {
    ctx.fillStyle = "blue"
    ctx.fillRect(x, y, w, h);
}

function drawHitbox(e) {
    if (e.key === "h" || e.key === "H") {
        toggle_Hitbox = !toggle_Hitbox;
        console.log(`Toggle Hitbox: ${toggle_Hitbox}`);
    }
}

function checkHitbox(cubeX, cubeY, cubeW, cubeH, hitbox, side) {
    switch (side)  {
        case "top":
            return (
                cubeX + cubeW > hitbox.x &&  // checkt anfang der hitbox (cube: rechts über hitbox: links)
                cubeX < hitbox.x + hitbox.w &&  // checkt ende der hitbox (cube: links über hitbox: rechts)
                cubeY + cubeH > hitbox.y &&  // cube berührt hitbox (cube: unten auf hitbox: oben)
                cubeY + cubeH <= hitbox.y + hitbox.h // cube ist auf der richtigen höhe der hitbox (nicht vergessen: weniger y = höher)
            );
        case "bottom":
            return (
                cubeX + cubeW > hitbox.x &&  
                cubeX < hitbox.x + hitbox.w &&  
                cubeY >= hitbox.y &&  
                cubeY < hitbox.y + hitbox.h 
            );

        case "left":
            return (
                cubeX + cubeW > hitbox.x &&
                cubeX <= hitbox.x &&
                cubeY + cubeH > hitbox.y &&
                cubeY < hitbox.y + hitbox.h
            );

        case "right":
            return (
                cubeX + cubeW >= hitbox.x + hitbox.w &&  
                cubeX < hitbox.x + hitbox.w &&  
                cubeY + cubeH > hitbox.y &&  
                cubeY < hitbox.y + hitbox.h 
            );
    }   
}

function draw() {
    drawEnv();
    drawGround();
    drawCube();
    drawSpike();
    boxes.forEach(function (b) {
        drawBox(b.x, b.y, b.w, b.h); // funktioniert nur wenn alle Werte im Array(boxes) sind
    })
}

function cyclic() {
    draw();
    gameLogic();
}