const canvas = document.getElementById("mainCanvas");
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;
const ctx = canvas.getContext("2d");

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

const obj_spawnpoint = {
    x: canvas.width,
    y: canvas.height
}

// toggle hitboxes for debugging
var toggle_Hitbox = false; // h || H

var rotate_Box = true; // j || J

var damage = true; // g || G

var box_top_y = 0;

var buttons = true;

var colorArray = [
    { color: "ghostwhite" },
    { color: "red" },
    { color: "blue" },
    { color: "cyan" },
    { color: "green" },
    { color: "yellow" },
    { color: "purple" },
    { color: "pink" }
];

let colorIndex = 0;

let gameStarted = false;

function drawStartScreen() {

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = "#111"; // Background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white"; // Text color
    ctx.textAlign = "center";

    // Title
    let fontSize = canvas.height * 0.08;
    ctx.font = `${fontSize}px Berlin Sans FB Demi`;
    ctx.fillText("Welcome to  D A S H", canvas.width / 2, canvas.height / 2.25);

    // Button Start
    buttonStart();

    // //Button Change Color
    buttonChangeColor();
}



function start() {
    canvas.focus();
    window.addEventListener("keypress", jumpPc);
    window.addEventListener("touchstart", jumpMobile);
    window.addEventListener("keydown", showHitbox);
    window.addEventListener("keydown", toggleBoxRotation);
    window.addEventListener("keydown", toggleDamage);
    setInterval(cyclic, 16);// ~60 FPS
    setInterval(randSpike, 1500); // random chance for spike every 1.5 seconds
    setInterval(randBox, 3000); // Generate a box every 3 seconds
    // setInterval(generateBox, 3000);
    setInterval(addSpeed, 10000); // add speed every 10 seconds
    setInterval(counter, 1000); // clock
}
// define (change in) speed
let speed = 4.5;
function addSpeed() {
    speed = Math.min(speed * 1.125, 36); // cap speed at 36
    console.log("Added speed. Current speed:", speed)
}

/////////////////// game logic
function gameLogic() {
    updateCube();
    updateSpikes();
    updateBox();
}

if (toggle_Hitbox === true) {
    drawSpike_Hitbox();
    drawSpike_Hitbox2();
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

    // move back to start position
    if (cube.x < canvas.width * 0.2) {
        cube.x += speed / 6;
    }

    // increment rotation if jumping
    if (!cube.onGround) {
        cube.rotation += cube.rotationSpeed;

        // cap rotation at 90 degrees
        if (cube.rotation >= Math.PI / 2) {
            cube.rotation = Math.PI / 2;
        }
    }

    // push cube
    flying_Box();

    //out of frame
    if (cube.x + cube.w < -10) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cube.y = canvas.width - 70;
        cube.x = 100;
        window.alert("Game Over");
        location.reload();
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
        if (damage === true) {
            if (checkHitbox(cube.x, cube.y, cube.w, cube.h, spike.hitbox1, "top") || checkHitbox(cube.x, cube.y, cube.w, cube.h, spike.hitbox2, "left")) {
                window.alert("Game Over");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cube.y = canvas.height - 250; // set cube on top so game cant get stuck on reload
                location.reload();
            }
        };
    }
}
function updateBox() {
    //box movement <--
    boxes.forEach(b => {
        b.x -= speed;
        if (rotate_Box === true) {
            b.rotation += b.rotationSpeed; // Update rotation
        }
        boxes.forEach((b, index) => {
            b.x -= speed;

            if (b.x + b.w < 0) {
                boxes.splice(index, 1);
                console.log("Box removed, remaining:", boxes.length);
            }
        });
    })
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

// randomly generate boxes
function randBox() {
    if (speed < 14 && Math.random() < 0.5) { // 50% chance to generate a spike
        generateBox();
        console.log("Spike generated, total boxes:", boxes.length);
    }
    if (speed >= 14 && Math.random() < 0.6) {
        generateBox();
        console.log("Spike generated, total boxes:", boxes.length);
    }
    if (speed >= 28 && Math.random() < 0.8) {
        generateBox();
        console.log("Spike generated, total boxes:", boxes.length);
    }
}

/////////////////// game logic end

// array to hold all spikes
const spikes = [];

function generateSpike() {
    const spikeBaseX = obj_spawnpoint.x;
    const spikeBaseY = obj_spawnpoint.y * 0.852; // base Y position of the spike
    const spikeHeight = 30; // height of the spike

    const newSpike = {
        point1x: spikeBaseX,
        point1y: spikeBaseY,
        point2x: spikeBaseX + 15,
        point2y: spikeBaseY - spikeHeight,
        point3x: spikeBaseX + 30,
        point3y: spikeBaseY,
        hitbox1: {
            x: spikeBaseX + 10, //15
            y: spikeBaseY - 25, //25
            w: 10,
            h: 20
        },
        hitbox2: {
            x: spikeBaseX + 5, //10
            y: spikeBaseY - 15, //15
            w: 20,
            h: 15
        }
    }
    spikes.push(newSpike);

    // limit spikes to 5 at a time
    if (spikes.length > 5) {
        spikes.pop();
        console.log("Spike limit reached, removing oldest spike");
    }
}

const boxes = [];

function generateBox() {
    const boxHeight = 30; // height of the spike
    const boxBaseX = obj_spawnpoint.x; // start off-screen on the right
    const boxMinY = cube.y; // Minimum Y position for the box
    const boxMaxY = cube.y - (1.5 * boxHeight); // Maximum Y position for the box

    for (let i = 0; i < 1; i++) {
        const randomY = Math.random() * (boxMaxY - boxMinY) + boxMinY; // Generate random Y within range
        if (rotate_Box === true) {
            const newBox = {
                x: boxBaseX,
                y: randomY,
                w: cube.w,
                h: cube.h,
                rotation: 0, // Initial rotation angle
                rotationSpeed: Math.PI / 60 // Random rotation speed
            };
            boxes.push(newBox);
        }
        else {
            const newBox = {
                x: boxBaseX,
                y: randomY,
                w: cube.w,
                h: cube.h
            }
            boxes.push(newBox);
        }


        //limit boxes to 3 at a time
        if (boxes.length > 3) {
            boxes.pop();
            console.log("Box limit reached, removing oldest box");
        }
    }
}
function jumpPc(e) {
    // pc
    // if (!gameStarted) {
    //     gameStarted = true;
    //     return; // exit to avoid an immediate jump
    // }

    if ((e.keyCode === 32 || e.code === "Space") && cube.onGround) {
        cube.dy = cube.jumpStrength;
        console.log(`Jump PC`);
    }
}

function jumpMobile(e) {
    // mobile
    // e.preventDefault();
    // if (!gameStarted) {
    //     gameStarted = true;
    //     return;
    // }
    if (cube.onGround) {
        cube.dy = cube.jumpStrength;
        console.log(`Jump Mobile`);
    }
}

function flying_Box() {
    boxes.forEach(function (b) {
        if (checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "top")
            || checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "left")
            || checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "bottom")
            || checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "right")) {
            cube.x -= speed;
            cube.x = b.x - cube.w;
            console.log(`checkHitboxLeft`)
        }
    })
}

/////////////// wird gerade nicht verwendet
function box_jump() {
    boxes.forEach(function (b) {
        if (checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "top")) {
            cube.onGround = true;
            cube.y = b.y - cube.h;
            cube.dy = 0;
            cube.rotation = 0;
            console.log(`checkHitboxTop`)
        }
    })
}

function cube_front_box() {
    boxes.forEach(function (b) {
        if (checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "left")) {
            cube.x -= speed;
            cube.x = b.x - cube.w;
            console.log(`checkHitboxLeft`)
        }
    })
}

function cube_under_box() {
    boxes.forEach(function (b) {
        if (checkHitbox(cube.x, cube.y, cube.w, cube.h, b, "bottom")) {
            cube.y = b.y + b.h;
            console.log(`checkHitboxBottom`)
        }
    })
}
/////////////// 

function checkHitbox(cubeX, cubeY, cubeW, cubeH, hitbox, side) {
    switch (side) {
        case "top":
            return (
                cubeX + cubeW > hitbox.x + 10 &&  // checkt anfang der hitbox (cube: rechts über hitbox: links) // + 10 damit top hitbox nicht bei seiten gecheckt wird
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

// a simple, yet beautiful counter
let time = 0
function counter() {
    if (gameStarted) {
        time = -~time
        document.getElementById("timer").innerHTML = `Survived for: ${time}s`;
    }
}

function drawEnv() {
    // refresh canvas
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
    ctx.fillStyle = cubeColor;
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

function drawSpike_Hitbox() {
    ctx.fillStyle = "red";
    ctx.fillRect(spikes.hitbox1.x, spikes.hitbox1.y, spikes.hitbox1.w, spikes.hitbox1.h);
}

function drawSpike_Hitbox2() {
    ctx.fillStyle = "red";
    ctx.fillRect(spikes.hitbox2.x, spikes.hitbox2.y, spikes.hitbox2.w, spikes.hitbox2.h);
}
function showHitbox(e) {
    if (e.key === "h" || e.key === "H") {
        toggle_Hitbox = !toggle_Hitbox;
        console.log(`Toggle Hitbox: ${toggle_Hitbox}`);
    }
}

function toggleBoxRotation(e) {
    if (e.key === "j" || e.key === "J") {
        rotate_Box = !rotate_Box;
        console.log(`Toggle Box Rotation: ${rotate_Box}`);
    }
}

function toggleDamage(e) {
    if (e.key === "g" || e.key === "G") {
        damage = !damage;
        console.log(`Toggle Damage: ${damage}`);
    }
}

function drawBox() {
    boxes.forEach(function (b) {
        ctx.save();

        // Translate canvas to the box's center
        let centerX = b.x + b.w / 2;
        let centerY = b.y + b.h / 2;
        ctx.translate(centerX, centerY);

        // Rotate canvas
        if (rotate_Box === true) {
            ctx.rotate(-b.rotation);
        }
        // Draw the box at the new rotated state
        ctx.fillStyle = "red";
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);

        ctx.restore();
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

function buttonStart() {
    if (buttons === true) { // without the "if" statement the button would start multiple games at once
        const buttonStartWidth = 200;
        const buttonStartHeight = 80;
        const buttonStartX = canvas.width / 2 - buttonStartWidth / 2;
        const buttonStartY = canvas.height / 2;

        // Button styling
        ctx.fillStyle = "grey";
        ctx.fillRect(buttonStartX, buttonStartY, buttonStartWidth, buttonStartHeight);

        let fontSize2 = canvas.height * 0.03;
        ctx.fillStyle = "white";
        ctx.font = `${fontSize2}px Cascadia Mono`;
        ctx.fillText("START", canvas.width / 2, buttonStartY + buttonStartHeight / 1.7);


        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseStartX = e.clientX - rect.left;
            const mouseStartY = e.clientY - rect.top;

            if (
                mouseStartX >= buttonStartX &&
                mouseStartX <= buttonStartX + buttonStartWidth &&
                mouseStartY >= buttonStartY &&
                mouseStartY <= buttonStartY + buttonStartHeight
            ) {
                // remove button listener
                gameStarted = true; //so you cant get back to menu on click
                start();
                buttons = false;
                canvas.removeEventListener("click", buttonStart)
                console.log("Game Started");
            }
        })
    }
}

function buttonChangeColor() {
    const buttonColorWidth = 300;
    const buttonColorHeight = 80;
    const buttonColorX = canvas.width / 2 - buttonColorWidth / 2;
    const buttonColorY = canvas.height / 2 + buttonColorHeight * 1.5;

    const menuCube = {
        x: buttonColorX * 1.68,
        y: buttonColorY * 1.03,
        w: 45,
        h: 45
    }

    // Button styling
    ctx.fillStyle = "grey";
    ctx.fillRect(buttonColorX, buttonColorY, buttonColorWidth, buttonColorHeight);

    let fontSize2 = canvas.height * 0.03;
    ctx.fillStyle = "white";
    ctx.font = `${fontSize2}px Cascadia Mono`;
    ctx.fillText("Change Color: ", canvas.width / 2.1, buttonColorY + buttonColorHeight / 1.7);

    ctx.fillStyle = colorArray[colorIndex].color;
    ctx.fillRect(menuCube.x, menuCube.y, menuCube.w, menuCube.h);


    canvas.addEventListener("click", function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseColorX = e.clientX - rect.left;
        const mouseColorY = e.clientY - rect.top;

        if (
            mouseColorX >= buttonColorX &&
            mouseColorX <= buttonColorX + buttonColorWidth &&
            mouseColorY >= buttonColorY &&
            mouseColorY <= buttonColorY + buttonColorHeight
        ) {
            // cycle through colors in array
            colorIndex = (colorIndex + 1) % colorArray.length; //cycle
            console.log("Color Changed: " + colorArray[colorIndex].color);

            cubeColor = colorArray[colorIndex].color;
            ctx.fillStyle = colorArray[colorIndex].color;
            ctx.fillRect(menuCube.x, menuCube.y, menuCube.w, menuCube.h);
        }
    });
}

function cyclic() {

    if (gameStarted == false) {
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

    updateBox();
    drawBox();
}
