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
        console.log("New velocity")
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
    for (let s of sides) {
        cvs.ctx.strokeStyle = "#050";
        cvs.ctx.lineWidth = "10px";
        cvs.ctx.fillStyle = s.col;
        cvs.ctx.beginPath();
        let count = 0;
        for (let vI of s.ids) {
            let x = vertices[vI].x * 100;
            let y = vertices[vI].y * 100;
            let z = vertices[vI].z * 100;
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
        cvs.ctx.stroke();
    }
}

var update_int;
var cube;
const cvs = new canvas("#999");
window.addEventListener("load", e => {
    let v1 = new vertex( 1,  1,  1);
    let v2 = new vertex( 1,  1, -1);
    let v3 = new vertex( 1, -1, -1);
    let v4 = new vertex( 1, -1,  1);
    let v5 = new vertex(-1, -1,  1);
    let v6 = new vertex(-1,  1,  1);
    let v7 = new vertex(-1,  1, -1);
    let v8 = new vertex(-1, -1, -1);

    let s3 = new side([1, 6, 7, 2], "#0c0");
    let s1 = new side([0, 1, 2, 3], "#0c0");
    let s2 = new side([4, 5, 6, 7], "#0c0");
    let s5 = new side([2, 3, 4, 7], "#0c0");
    let s6 = new side([0, 1, 6, 5], "#0c0");
    let s4 = new side([0, 5, 4, 3], "#0c0");

    cube = new container([0, 1, 2, 3, 4, 5, 6, 7])
    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    update_int = setInterval(() =>{
        update();
    }, 1);
});
window.addEventListener("resize", e => {
    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    cvs.update_size();
});