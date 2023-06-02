const vertices: Array<vertex> = [];
const edges: Array<edge> = [];
const sides: Array<side> = [];
class vertex {
    x: number;
    y: number;
    z: number;
    vel_x: number;
    vel_y: number;
    vel_z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vel_x = 0;
        this.vel_y = 0;
        this.vel_z = 0;
        vertices.push(this)
    }
    set_velocity(x: number, y: number, z: number) {
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
    id1: number;
    id2: number;
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
    ids: Array<number>;
    constructor(ids, col) {
        this.ids = ids;
        sides.push(this);
    }
}

class canvas {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    constructor(col: string) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    update_size() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    clear() {
        this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function update(can: canvas) {
    for (let v of vertices) {
        v.update_pos();
    }
    for (let s of sides) {
        for (let e of s.ids) {
            
        }
    }
}

var update_int;
const cvs = new canvas("#999");
window.addEventListener("load", e => {
    update_int = setInterval(() =>{
        update(cvs);
    }, 1);
});
window.addEventListener("resize", e => {
    cvs.update_size();
});