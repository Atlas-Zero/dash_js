const canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;
const ctx = canvas.getContext("2d");


function start() {
    canvas.focus();
    window.addEventListener("keypress", jumpPc);
    window.addEventListener("touchstart", jumpMobile);
    setInterval(cyclic, 16); // Reduced interval for better performance (~33 FPS)
    setInterval(randSpike, 1500); // Generate spikes every 1.5 seconds
}

const speed = { speedx: 5.5 }; // Define speed object

const cube = {
    // player cube
    x: 100,
    y: 500,
    w: 20,
    h: 20,
    dy: 5,
    gravity: 0.5,
    jumpStrength: -10,
    onGround: false
};

const spikes = []; // Array to hold all spikes

function generateSpike() {
    const spikeBaseX = canvas.width; // Start off-screen on the right
    const spikeBaseY = canvas.height - 200; // Base Y position of the spike
    const spikeHeight = 30; // Height of the spike

    const newSpike = {
        point1x: spikeBaseX,
        point1y: spikeBaseY,
        point2x: spikeBaseX + 15,
        point2y: spikeBaseY - spikeHeight,
        point3x: spikeBaseX + 30,
        point3y: spikeBaseY,
        hitbox1: { x: spikeBaseX + 10, y: spikeBaseY - spikeHeight + 5, w: 10, h: spikeHeight - 10 },
        hitbox2: { x: spikeBaseX + 5, y: spikeBaseY - spikeHeight / 2, w: 20, h: 15 }
    };

    spikes.push(newSpike);

    if (spikes.length > 20) { // Limit spikes to 20 at a time
        spikes.shift();
        console.log("Spike limit reached, removing oldest spike");
    }
}

function updateSpikes() {
    for (let i = spikes.length - 1; i >= 0; i--) {
        const spike = spikes[i];

        // Move spike left
        spike.point1x -= speed.speedx;
        spike.point2x -= speed.speedx;
        spike.point3x -= speed.speedx;
        spike.hitbox1.x -= speed.speedx;
        spike.hitbox2.x -= speed.speedx;

        // Remove spike if it goes off-screen
        if (spike.point3x < 0) {
            spikes.splice(i, 1);
            console.log("Spike removed, remaining:", spikes.length);
        }

        // Check for collisions
        if (checkHitbox(cube.x, cube.y, spike.hitbox1) || checkHitbox(cube.x, cube.y, spike.hitbox2)) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cube.y = 250;
            window.alert("Game Over");
            location.reload();
        }
    }
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

function cubeMovement() {
    // gravity
    cube.y += cube.dy;
    cube.dy += cube.gravity;

    // limit: 
    if (cube.y >= canvas.height - 200) {
        cube.dy = 0;
        cube.y = canvas.height - 200;
        cube.onGround = true;
    } else {
        cube.onGround = false;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCube() {
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(cube.x, cube.y, cube.w, cube.h);
}

function cyclic() {
    drawEnv();
    drawCube();
    drawSpikes();
    cubeMovement();
    updateSpikes();
}

function randSpike() {
    // Randomly generate spikes
    if (Math.random() < 0.3) { // 30% chance to generate a spike
        generateSpike();
        console.log("Spike generated, total spikes:", spikes.length);
    }
}

let toggle_Hitbox = false; // Toggle hitboxes for debugging

function checkHitbox(cubeX, cubeY, hitbox) {
    return (
        cubeX + cube.w > hitbox.x &&  // cube: right edge --> hitbox: left edge
        cubeX < hitbox.x + hitbox.w &&  // cube: left edge --> hitbox: right edge
        cubeY + cube.h > hitbox.y &&  // cube: bottom edge --> hitbox: top edge
        cubeY < hitbox.y + hitbox.h // cube: top edge --> hitbox: bottom edge
    );
}
