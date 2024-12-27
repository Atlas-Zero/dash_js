const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");

const cube = {
    x: 250,
    y: 500,
    w: 30,
    h: 30
}

function gameLogic() {
    canvas.focus()
    canvas.addEventListener("keydown", jump, false)
}

function jump(self) {
    if (self.code === " ") {
        console.log("pressed space")
    };
}

function drawCube() {
    ctx.fillStyle = "ghostwhite";
    ctx.fillRect(cube.x, cube.y, cube.w, cube.h);
}

function cyclic() {
    drawCube();
    gameLogic();
}
setInterval(cyclic, 15)