const canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
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
    point1x: canvas.width - 200, //Startpunkt
    point1y: canvas.height - 70,
    point2x: canvas.width - 185, //Spitze
    point2y: canvas.height - 100,
    point3x: canvas.width - 170, //Endpunkt
    point3y: canvas.height - 70
}

const spike_Hitbox = {
    x: canvas.width - 185,
    y: canvas.height - 95,
    w: 10,
    h: 20
}

const spike_Hitbox2 = {
    x: canvas.width - 190,
    y: canvas.height - 85,
    w: 20,
    h: 15
}

var speed = {
    speedx: 5.5
}

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

    //spike movement <--
    spike.point1x -= speed.speedx;  //können hier auch += schreiben und speed.speedx auf -0.5 ändern, sieht vlt verständlicher aus
    spike.point2x -= speed.speedx;
    spike.point3x -= speed.speedx;
    spike_Hitbox.x -= speed.speedx;
    spike_Hitbox2.x -= speed.speedx;

    if (checkHitbox(cube.x, cube.y, spike_Hitbox) || checkHitbox(cube.x, cube.y, spike_Hitbox2)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cube.y = 250;
        window.alert("Game Over");
        location.reload();
    }
    if (toggle_Hitbox === true){
        drawSpike_Hitbox();
        drawSpike_Hitbox2();
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function drawCube() {
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(cube.x, cube.y, cube.w, cube.h);
}

function drawSpike() {

    ctx.beginPath();
    ctx.moveTo(spike.point1x, spike.point1y);
    ctx.lineTo(spike.point2x, spike.point2y);
    ctx.lineTo(spike.point3x, spike.point3y);
    ctx.closePath();
    ctx.fillStyle = "ghostwhite";
    ctx.fill();
    ctx.stroke();
}

function drawSpike_Hitbox() { //wieder einfügen um die Hitbox zu sehen (im cyclic nicht vergessen :,) )
    ctx.fillStyle = "red";
    ctx.fillRect(spike_Hitbox.x, spike_Hitbox.y, spike_Hitbox.w, spike_Hitbox.h);
}

function drawSpike_Hitbox2() { //wieder einfügen um die Hitbox zu sehen (im cyclic nicht vergessen :,) )
    ctx.fillStyle = "red";
    ctx.fillRect(spike_Hitbox2.x, spike_Hitbox2.y, spike_Hitbox2.w, spike_Hitbox2.h);
}

var toggle_Hitbox = false;

function drawHitbox(e){
    if (e.key === "h" || e.key === "H") {
        toggle_Hitbox = !toggle_Hitbox;
        console.log(`Toggle Hitbox: ${toggle_Hitbox}`);
    }
}

function checkHitbox(cubeX, cubeY, hitbox) {
    return (
        cubeX + cube.w > hitbox.x &&  // cube: rechts --> hitbox: links
        cubeX < hitbox.x + hitbox.w &&  // cube: links --> hitbox rechts (wird eigentlich nicht gebraucht)
        cubeY + cube.h > hitbox.y &&  // cube: unten --> hitbox: oben
        cubeY < hitbox.y + hitbox.h // cube: oben --> hitbox unten (wird eigentlich nicht gebraucht)
    );
}

function cyclic() {
    drawEnv();
    drawCube();
    drawSpike();
    gameLogic();
}