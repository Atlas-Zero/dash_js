const canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;
const ctx = canvas.getContext("2d");

let gameStarted = false;

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
    ctx.fillStyle = "#111"; // background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white"; // text color
    ctx.textAlign = "center";

    fontSize = canvas.height * 0.08;
    fontSize2 = canvas.height * 0.03;
    ctx.font = `${fontSize}px Berlin Sans FB Demi`;
    ctx.fillText("Welcome to  D A S H", canvas.width / 2, canvas.height / 2.25);
    ctx.font = `${fontSize2}px Cascadia Mono`;
    ctx.fillText("Press Space or Tap to Start", canvas.width / 2, canvas.height / 2);
}

function start() {
    canvas.focus();
    window.addEventListener("keypress", jumpPc);
    window.addEventListener("touchstart", jumpMobile);
    setInterval(cyclic, 16); // ~60 FPS
    setInterval(randSpike, 1500); // random chance for spike every 1.5 seconds
    setInterval(addSpeed, 10000); // add speed every 10 seconds
    setInterval(counter, 1000); // clock
}


// player cube
const cube = {
    x: canvas.width * 0.2,
    y: canvas.height - 500,
    w: 30,
    h: 30,
    dy: 5,
    gravity: 0.75,
    jumpStrength: -10,
    onGround: false,
    rotation: 0,
    rotationSpeed: Math.PI / 60
}

function updateCube() {
    // gravity
    cube.y += cube.dy;
    cube.dy += cube.gravity;

    // limit: 
    if (cube.y >= canvas.height - 100) {
        cube.dy = 0;
        cube.y = canvas.height - 100;
        cube.onGround = true;
        cube.rotation = 0;
    } else {
        cube.onGround = false;
    }

    // increment rotation if jumping
    if (!cube.onGround) {
        cube.rotation += cube.rotationSpeed;

        // cap rotation at 90 degrees
        if (cube.rotation >= Math.PI / 2) {
            cube.rotation = Math.PI / 2;
        }
    }
}

// define (change in) speed
let speed = 4;
function addSpeed() {
    speed = Math.min(speed * 1.2, 36); // cap speed at 36
    console.log("Added speed. Current speed:", speed)
}

// array to hold all spikes
const spikes = []; 

function generateSpike() {
    const spikeBaseX = canvas.width; // start off-screen on the right
    const spikeBaseY = canvas.height - 100 + cube.h; // base Y position of the spike
    const spikeHeight = 30; // height of the spike
    
    const newSpike = {
        point1x: spikeBaseX,
        point1y: spikeBaseY,
        point2x: spikeBaseX + 15,
        point2y: spikeBaseY - spikeHeight,
        point3x: spikeBaseX + 30,
        point3y: spikeBaseY,
        hitbox1: { x: spikeBaseX + 10, y: spikeBaseY - spikeHeight + 5, w: 10, h: spikeHeight - 10 },
        hitbox2: { x: spikeBaseX + 5, y: spikeBaseY - spikeHeight / 2, w: 20, h: 15 }
    }
    
    spikes.push(newSpike);
    
    // limit spikes to 5 at a time
    if (spikes.length > 5) { 
        spikes.pop();
        console.log("Spike limit reached, removing oldest spike");
    }
}

function updateSpikes() {
    for (let i = spikes.length - 1; i >= 0; i--) {
        const spike = spikes[i];
        
        // move spike left
        spike.point1x -= speed;
        spike.point2x -= speed;
        spike.point3x -= speed;
        spike.hitbox1.x -= speed;
        spike.hitbox2.x -= speed;
        
        // remove spike if it goes off-screen
        if (spike.point3x < 0) {
            spikes.splice(i, 1);
            console.log("Spike removed, remaining:", spikes.length);
        }
        
        // check for collisions
        if (checkHitbox(cube.x, cube.y, spike.hitbox1) || checkHitbox(cube.x, cube.y, spike.hitbox2)) {
            window.alert("Game Over");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            location.reload();
        }
    }
}

// randomly generate spikes
function randSpike() {
    if (speed < 14 && Math.random() < 0.5) { // 50% chance to generate a spike
        generateSpike();
        console.log("Spike generated, total spikes:", spikes.length);
    }
    if (speed >= 14 && Math.random() < 0.6) {
        generateSpike();
        console.log("Spike generated, total spikes:", spikes.length);
    }
    if (speed >= 28 && Math.random() < 0.8) {
        generateSpike();
        console.log("Spike generated, total spikes:", spikes.length);
    }
}

// toggle hitboxes for debugging
let toggle_Hitbox = false; 

function checkHitbox(cubeX, cubeY, hitbox) {
    return (
        cubeX + cube.w > hitbox.x &&  // cube: right edge --> hitbox: left edge
        cubeX < hitbox.x + hitbox.w &&  // cube: left edge --> hitbox: right edge
        cubeY + cube.h > hitbox.y &&  // cube: bottom edge --> hitbox: top edge
        cubeY < hitbox.y + hitbox.h // cube: top edge --> hitbox: bottom edge
    );
}

function jumpPc(e) {
    // pc
    if (!gameStarted) {
        gameStarted = true;
        return; // exit to avoid an immediate jump
    }

    // jump
    if ((e.keyCode === 32 || e.code === "Space") && cube.onGround) {
        cube.dy = cube.jumpStrength;
    }
}

function jumpMobile(e) {
    // mobile
    e.preventDefault();
    if (!gameStarted) {
        gameStarted = true;
        return;
    }
    if (cube.onGround) {
        cube.dy = cube.jumpStrength;
    }
}

function drawCube() {
    ctx.save();

    // translate canvas to cube's center
    let centerX = cube.x + cube.w / 2;
    let centerY = cube.y + cube.h / 2;
    ctx.translate(centerX, centerY);

    // rotate canvas
    ctx.rotate(cube.rotation);

    // draw the cube at the new rotated state
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(-cube.w / 2, -cube.h / 2, cube.w, cube.h);

    ctx.restore();
}

function drawSpikes() {
    spikes.forEach(spike => {
        ctx.beginPath();
        ctx.moveTo(spike.point1x, spike.point1y);
        ctx.lineTo(spike.point2x, spike.point2y);
        ctx.lineTo(spike.point3x, spike.point3y);
        ctx.closePath();
        ctx.fillStyle = "ghostwhite";
        ctx.fill();
        ctx.stroke();

        if (toggle_Hitbox) {
            ctx.fillStyle = "red";
            ctx.fillRect(spike.hitbox1.x, spike.hitbox1.y, spike.hitbox1.w, spike.hitbox1.h);
            ctx.fillRect(spike.hitbox2.x, spike.hitbox2.y, spike.hitbox2.w, spike.hitbox2.h);
        }
    });
}

// a simple, yet beautiful counter
let time = 0
function counter() {
    if (gameStarted) {
    time = -~time
    document.getElementById("timer").innerHTML = `Survived for: ${time}s`;    
    }
}

function drawEnv() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const background = {
    image: new Image(),
    x: 0,
    speed: 1.2
}

const floor = {
    image: new Image(),
    x: 0,
}

// sources 
background.image.src = "background.jpg";
floor.image.src = "floor.jpg";

function updateBackground(speed) {
    // move background 
    background.x -= speed * background.speed;

    if (background.x <= -canvas.width) {
        background.x = 0;
    }
}

function updatefloor(speed) {
    // move the floor
    floor.x -= speed;

    // reset position 
    if (floor.x <= -canvas.width) {
        floor.x = 0;
    }
}

function drawBackground() {
    // draw twice for seamless loop
    ctx.drawImage(background.image, background.x, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.image, background.x + canvas.width, 0, canvas.width, canvas.height * 0.85);
}

function drawFloor() {
    ctx.drawImage(floor.image, floor.x, canvas.height * 0.852, canvas.width, canvas.height);
    ctx.drawImage(floor.image, floor.x + canvas.width, canvas.height * 0.852, canvas.width, canvas.height);
}

function cyclic() {

    if (!gameStarted) {
        drawStartScreen();
        return;
    }

    drawEnv();

    updateBackground(speed);
    drawBackground();

    updatefloor(speed);
    drawFloor();

    updateCube();
    drawCube();
    
    updateSpikes();
    drawSpikes();
}
