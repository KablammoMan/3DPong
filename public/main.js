const vertices = [];
const sides = [];
var focal_length = 60;
class vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vel_x = 0;
        this.vel_y = 0;
        this.vel_z = 0;
        vertices.push(this)
    }
    set_velocity(x, y, z) {
        this.vel_x = x;
        this.vel_y = y;
        this.vel_z = z;
    }
    add_velocity(x, y, z) {
        this.vel_x += x;
        this.vel_y += y;
        this.vel_z += z;
    }
    update_pos() {
        this.x += this.vel_x;
        this.y += this.vel_y;
        this.z += this.vel_z;
    }
}

class side {
    constructor(ids, col) {
        this.ids = ids;
        this.col = col;
        sides.push(this);
    }
}

class container {
    constructor(ids) {
        this.ids = ids;
    }
    set_velocity(x, y, z) {
        for (let vI of this.ids) {
            vertices[vI].set_velocity(x, y, z);
        }
    }
    add_velocity(x, y, z) {
        for (let vI of this.ids) {
            vertices[vI].add_velocity(x, y, z);
        }
    }
}

class canvas {
    constructor(col) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.backgroundColor = col;
        document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    update_size() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function update() {
    cvs.clear();
    for (let v of vertices) {
        v.update_pos();
    }
    // Fill Sides
    for (let s of sides) {
        cvs.ctx.fillStyle = s.col;
        cvs.ctx.beginPath();
        let count = 0;
        for (let vI of s.ids) {
            let x = vertices[vI].x;
            let y = vertices[vI].y;
            let z = vertices[vI].z;
            let px = (focal_length * x) / (focal_length + z);
            let py = (focal_length * y) / (focal_length + z);
            if (count == 0) {
                cvs.ctx.moveTo(cvs.canvas.width/2 + px, cvs.canvas.height/2 + py);
            } else {
                cvs.ctx.lineTo(cvs.canvas.width/2 + px, cvs.canvas.height/2 + py);
            }
            count++;
        }
        cvs.ctx.closePath();
        cvs.ctx.fill();
    }
    // Stroke Wireframe
    for (let s of sides) {
        cvs.ctx.strokeStyle = "#000";
        cvs.ctx.lineWidth = "10px";
        cvs.ctx.fillStyle = s.col;
        cvs.ctx.beginPath();
        let count = 0;
        for (let vI of s.ids) {
            let x = vertices[vI].x;
            let y = vertices[vI].y;
            let z = vertices[vI].z;
            let px = (focal_length * x) / (focal_length + z);
            let py = (focal_length * y) / (focal_length + z);
            if (count == 0) {
                cvs.ctx.moveTo(cvs.canvas.width/2 + px, cvs.canvas.height/2 + py);
            } else {
                cvs.ctx.lineTo(cvs.canvas.width/2 + px, cvs.canvas.height/2 + py);
            }
            count++;
        }
        cvs.ctx.closePath();
        cvs.ctx.stroke();
    }
}

var update_int;
var pong;
var ai;
var top, left, right, bottom;
const cvs = new canvas("#999");
window.addEventListener("load", e => {
    // Left Wall Vertices and Container
    let v0 = new vertex(-500, 500, -100);
    let v1 = new vertex(-600, 500, -100);
    let v2 = new vertex(-600, -500, -100);
    let v3 = new vertex(-500, -500, -100);
    let v4 = new vertex(-500, 500, 1000);
    let v5 = new vertex(-600, 500, 1000);
    let v6 = new vertex(-600, -500, 1000);
    let v7 = new vertex(-500, -500, 1000);

    let s0 = new side([0, 1, 2, 3], "#099"); // Front
    let s1 = new side([4, 5, 6, 7], "#099"); // Back
    let s2 = new side([0, 3, 7, 4], "#099"); // Right
    let s3 = new side([1, 2, 6, 5], "#099"); // Left
    let s4 = new side([1, 0, 4, 5], "#099"); // 
    let s5 = new side([2, 3, 7, 6], "#099");

    left = new container([0, 1, 2, 3, 4, 5, 6, 7]);

    // Right Wall Vertices, Sides and Container
    let v8 = new vertex(500, 500, -100);
    let v9 = new vertex(600, 500, -100);
    let v10 = new vertex(600, -500, -100);
    let v11 = new vertex(500, -500, -100);
    let v12 = new vertex(500, 500, 1000);
    let v13 = new vertex(600, 500, 1000);
    let v14 = new vertex(600, -500, 1000);
    let v15 = new vertex(500, -500, 1000);

    let s6 = new side([8, 9, 10, 11], "#099");
    let s7 = new side([12, 13, 14, 15], "#099");
    let s8 = new side([9, 10, 14, 13], "#099");
    let s9 = new side([8, 11, 15, 12], "#099");
    let s10 = new side([10, 11, 15, 14], "#099");
    let s11 = new side([9, 8, 12, 13], "#099");

    right = new container([8, 9, 10, 11, 12, 13, 14, 15]);

    // Top Wall Vertices, Sides and Container
    let v16 = new vertex(500, -500, -100);
    let v17 = new vertex(-500, -500, -100);
    let v18 = new vertex(-500, -600, -100);
    let v19 = new vertex(500, -600, -100);
    let v20 = new vertex(500, -500, 1000);
    let v21 = new vertex(-500, -500, 1000);
    let v22 = new vertex(-500, -600, 1000);
    let v23 = new vertex(500, -600, 1000);

    let s12 = new side([16, 17, 18, 19], "#099"); // Front
    let s13 = new side([20, 21, 22, 23], "#099"); // Back
    let s14 = new side([16, 19, 23, 20], "#099"); // Right
    let s15 = new side([17, 18, 22, 21], "#099"); // Left
    let s16 = new side([19, 18, 22, 23], "#099"); // Top
    let s17 = new side([16, 17, 21, 20], "#099"); // Bottom

    top = new container([16, 17, 18, 19, 20, 21, 22, 23]);

    // Bottom Wall Vertices, Sides and Container
    let v24 = new vertex(500, 500, -100);
    let v25 = new vertex(-500, 500, -100);
    let v26 = new vertex(-500, 600, -100);
    let v27 = new vertex(500, 600, -100);
    let v28 = new vertex(500, 500, 1000);
    let v29 = new vertex(-500, 500, 1000);
    let v30 = new vertex(-500, 600, 1000);
    let v31 = new vertex(500, 600, 1000);

    let s18 = new side([24, 25, 26, 27], "#099"); // Front
    let s19 = new side([28, 29, 30, 31], "#099"); // Back
    let s20 = new side([24, 27, 31, 28], "#099"); // Right
    let s21 = new side([25, 26, 30, 29], "#099"); // Left
    let s22 = new side([27, 26, 30, 31], "#099"); // Top
    let s23 = new side([24, 25, 29, 28], "#099"); // Bottom

    bottom = new container([24, 25, 26, 27, 28, 29, 30, 31])
    
    // AI Paddle Vertices, Sides and Container

    // Ball Vertices, Sides and Container
    let v32 = new vertex( 100,  100,  100);
    let v33 = new vertex( 100,  100, -100);
    let v34 = new vertex( 100, -100, -100);
    let v35 = new vertex( 100, -100,  100);
    let v36 = new vertex(-100, -100,  100);
    let v37 = new vertex(-100,  100,  100);
    let v38 = new vertex(-100,  100, -100);
    let v39 = new vertex(-100, -100, -100);

    let s24 = new side([33, 38, 39, 34], "#cc0");
    let s25 = new side([32, 33, 34, 35], "#cc0");
    let s26 = new side([36, 37, 38, 39], "#cc0");
    let s27 = new side([34, 35, 36, 39], "#cc0");
    let s28 = new side([32, 33, 38, 37], "#cc0");
    let s29 = new side([32, 37, 36, 35], "#cc0");

    pong = new container([32, 33, 34, 35, 36, 37, 38, 39]);


    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    update_int = setInterval(() =>{
        update();
    }, 1);
});
window.addEventListener("resize", e => {
    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    cvs.update_size();
});