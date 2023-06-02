const vertices = [];
const edges = [];
const sides = [];
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

class edge {
    constructor(id1, id2) {
        if (id1 > vertices.length-1 || id2 > vertices.length-1) {
            console.error("You are a fucking doofus!!! That id does NOT exist!");
        } else {
            this.id1 = id1;
            this.id2 = id2;
            edges.push(this);
        }
    }
}

class side {
    constructor(ids, col) {
        this.ids = ids;
        this.col = col;
        sides.push(this);
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
    for (let v of vertices) {
        v.update_pos();
    }
    for (let s of sides) {
        for (let eI of s.ids) {
            for (let v of edges[eI]) {

            }
        }
    }
}

var update_int;
const cvs = new canvas("#999");
window.addEventListener("load", e => {
    update_int = setInterval(() =>{
        update();
    }, 1);
});
window.addEventListener("resize", e => {
    cvs.update_size();
});