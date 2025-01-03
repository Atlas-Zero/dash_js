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
    y: 0,
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
    if (cube.y >= (canvas.height * 0.852) - cube.h) {
        cube.dy = 0;
        cube.y = (canvas.height * 0.852) - cube.h;
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
let speed = 4.5;
function addSpeed() {
    speed = Math.min(speed * 1.125, 36); // cap speed at 36
    console.log("Added speed. Current speed:", speed)
}

// array to hold all spikes
const spikes = []; 

function generateSpike() {
    const spikeBaseX = canvas.width; // start off-screen on the right
    const spikeBaseY = canvas.height  * 0.852; // base Y position of the spike
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
    x1: 0,
    x2: 0,
    x3: 0,
    x4: 0,
    x5: 0,
    layer1: new Image(),
    layer2: new Image(),
    layer3: new Image(),
    layer4: new Image(),
    layer5: new Image(),
    speed1: 0.1,
    speed2: 0.2,
    speed3: 0.3,
    speed4: 0.4,
    speed5: 0.5
}

const floor = {
    x: 0,
    image: new Image()
}

// sources 
background.layer1.src = "./img/1.png";
background.layer2.src = "./img/2.png";
background.layer3.src = "./img/3.png";
background.layer4.src = "./img/4.png";
background.layer5.src = "./img/5.png";
floor.image.src = "./img/floor.jpg";

function updateBackground(speed) {
    // move all layers 
    background.x1 -= speed * background.speed1;
    background.x2 -= speed * background.speed2;
    background.x3 -= speed * background.speed3;
    background.x4 -= speed * background.speed4;
    background.x5 -= speed * background.speed5;

    // reset for looping effect
    if (background.x1 <= -canvas.width) {
        background.x1 = 0;
    }
    if (background.x2 <= -canvas.width) {
        background.x2 = 0;
    }
    if (background.x3 <= -canvas.width) {
        background.x3 = 0;
    }
    if (background.x4 <= -canvas.width) {
        background.x4 = 0;
    }
    if (background.x5 <= -canvas.width) {
        background.x5 = 0;
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

function drawBackground() {
    // draw twice for seamless loop
    ctx.drawImage(background.layer1, background.x1, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.layer1, background.x1 + canvas.width, 0, canvas.width, canvas.height * 0.85);

    ctx.drawImage(background.layer2, background.x2, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.layer2, background.x2 + canvas.width, 0, canvas.width, canvas.height * 0.85);

    ctx.drawImage(background.layer3, background.x3, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.layer3, background.x3 + canvas.width, 0, canvas.width, canvas.height * 0.85);

    ctx.drawImage(background.layer4, background.x4, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.layer4, background.x4 + canvas.width, 0, canvas.width, canvas.height * 0.85);

    ctx.drawImage(background.layer5, background.x5, 0, canvas.width, canvas.height * 0.85);
    ctx.drawImage(background.layer5, background.x5 + canvas.width, 0, canvas.width, canvas.height * 0.85);
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
