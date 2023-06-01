const ids = []
class vertex {
    constructor(x, y, z) {
        let rand = Math.floor(Math.random() * 1000000000);
        while (ids.includes(rand)) {
            rand = Math.floor(Math.random() * 1000000000);
        }
        this.id = rand;
        ids.push(rand);
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

