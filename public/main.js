const vertices = []
const edges = [];
class vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set_velocity(x, y, z) {
        this.vel_x = x;
        this.vel_y = y;
        this.vel_z = z;
    }
    update_pos() {
        this.x += this.vel_x;
        this.y += this.vel_y;
        this.z += this.vel_z;
    }
}

class edge {
    constructor(id1, id2, col) {
        if (id1 > vertices.length-1 || id2 > vertices.length-1) {
            console.error("You are a fucking doofus!!! That id does NOT exist!");
        }
        this.id1 = id1;
        this.id2 = id2;
        this.col = col;
    }
}