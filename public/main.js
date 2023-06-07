const vertices = [];
const sides = [];
const containers = [];
const keypress = {};
const ball_size = 50;
const paddle_size = 100;
const p_thickness = 20;
const area_length = 1000;
const ai_speed_multi = 2;
const p_speed_multi = 2;
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
    change_pos(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
    }
    get_velocity() {
        return [this.vel_x, this.vel_y, this.vel_z]
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
    constructor(vids, sids, name) {
        this.vids = vids;
        this.sids = sids;
        this.name = name;
        containers.push(this);
    }
    set_velocity(x, y, z) {
        for (let vI of this.vids) {
            vertices[vI].set_velocity(x, y, z);
        }
    }
    add_velocity(x, y, z) {
        for (let vI of this.vids) {
            vertices[vI].add_velocity(x, y, z);
        }
    }
    change_pos(x, y, z) {
        for (let vI of this.vids) {
            vertices[vI].change_pos(x, y, z);
        }
    }
    get_velocity() {
        return vertices[this.vids[0]].get_velocity();
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


function render() {
    for (let c of containers) {
        // Determine what sides to render
        let render = [
            true,  // 0 Front (always true)
            false, // 1 Back (always false)
            false, // 2 Right
            false, // 3 Left
            false, // 4 Top
            false  // 5 Bottom
        ]

        let cam_x = 0, cam_y = 0;
        let cam_z = -1 * focal_length;

        if (vertices[sides[c.sids[2]].ids[0]].x < cam_x) {
            render[2] = true;
        }
        if (vertices[sides[c.sids[3]].ids[0]].x > cam_x) {
            render[3] = true;
        }
        if (vertices[sides[c.sids[5]].ids[0]].y < cam_y) {
            render[5] = true;
        }
        if (vertices[sides[c.sids[4]].ids[0]].y > cam_y) {
            render[4] = true;
        }
        if (vertices[sides[c.sids[0]].ids[0]].z <= cam_z) {
            render = [false, false, false, false, false, false]; // DO NOT RENDER IF BEHIND CAMERA
        }
        
        // Fill
        for (let sC = 0; sC < c.sids.length; sC++) {
            if (render[sC]) {
                let sI = c.sids[sC];
                let s = sides[sI];
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
        }
        // Stroke
        for (let sC = 0; sC < c.sids.length; sC++) {
            if (render[sC]) {
                let sI = c.sids[sC];
                let s = sides[sI];
                cvs.ctx.strokeStyle = "#000";
                cvs.ctx.lineWidth = "10px";
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
    }
}

function collision(ball, cont, face) {
    for (let bC = 0; bC < ball.sids.length; bC++) {
        let sI = ball.sids[bC];
        let bS = sides[sI];

        let bF = vertices[sides[ball.sids[0]].ids[0]].z;
        let bB = vertices[sides[ball.sids[1]].ids[0]].z;
        let bR = vertices[sides[ball.sids[2]].ids[0]].x;
        let bL = vertices[sides[ball.sids[3]].ids[0]].x;
        let bT = vertices[sides[ball.sids[4]].ids[0]].y;
        let bb = vertices[sides[ball.sids[5]].ids[0]].y;

        let cF = vertices[sides[cont.sids[0]].ids[0]].z;
        let cB = vertices[sides[cont.sids[1]].ids[0]].z;
        let cR = vertices[sides[cont.sids[2]].ids[0]].x;
        let cL = vertices[sides[cont.sids[3]].ids[0]].x;
        let cT = vertices[sides[cont.sids[4]].ids[0]].y;
        let cb = vertices[sides[cont.sids[5]].ids[0]].y;

        if (bC == 0 && face == "F") {
            let cI = cont.sids[1];
            let cS = sides[cI];
            if (
                vertices[bS.ids[0]].z <= vertices[cS.ids[0]].z &&
                (
                    (bR > cL && bR < cR && bb > cT && bb < cb && bF < cB && bF > cF) ||
                    (bL > cL && bL < cR && bb > cT && bb < cb && bF < cB && bF > cF) ||
                    (bR > cL && bR < cR && bT > cT && bT < cb && bF < cB && bF > cF) ||
                    (bL > cL && bL < cR && bT > cT && bT < cb && bF < cB && bF > cF)
                )
            ) {
                return true;
            } else {
                return false;
            }
        }
        if (bC == 1 && face == "B") {
            let cI = cont.sids[0];
            let cS = sides[cI];
            if (
                vertices[bS.ids[0]].z >= vertices[cS.ids[0]].z &&
                (
                    (bR > cL && bR < cR && bb > cT && bb < cb && bB < cB && bB > cF) ||
                    (bL > cL && bL < cR && bb > cT && bb < cb && bB < cB && bB > cF) ||
                    (bR > cL && bR < cR && bT > cT && bT < cb && bB < cB && bB > cF) ||
                    (bL > cL && bL < cR && bT > cT && bT < cb && bB < cB && bB > cF)
                )
            ) {
                return true;
            } else {
                return false;
            }
        }
        if (bC == 2 && face == "R") {
            let cI = cont.sids[3];
            let cS = sides[cI];
            if (vertices[bS.ids[0]].x >= vertices[cS.ids[0]].x) {
                return true;
            } else {
                return false;
            }
        }
        if (bC == 3 && face == "L") {
            let cI = cont.sids[2];
            let cS = sides[cI];
            if (vertices[bS.ids[0]].x <= vertices[cS.ids[0]].x) {
                return true;
            } else {
                return false;
            }
        }
        if (bC == 4 && face == "T") {
            let cI = cont.sids[5];
            let cS = sides[cI];
            if (vertices[bS.ids[0]].y <= vertices[cS.ids[0]].y) {
                return true;
            } else {
                return false;
            }
        }
        if (bC == 5 && face == "b") {
            let cI = cont.sids[4];
            let cS = sides[cI];
            if (vertices[bS.ids[0]].y >= vertices[cS.ids[0]].y) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function update() {
    cvs.clear();
    for (let v of vertices) {
        v.update_pos();
    }

    if ((keypress["w"] || keypress["arrowup"]) && vertices[sides[player.sids[4]].ids[0]].y > vertices[sides[topw.sids[5]].ids[0]].y) {
        player.change_pos(0, -1 * p_speed_multi, 0);
    }
    if ((keypress["a"] || keypress["arrowleft"]) && vertices[sides[player.sids[3]].ids[0]].x > vertices[sides[leftw.sids[2]].ids[0]].x) {
        player.change_pos(-1 * p_speed_multi, 0, 0);
    }
    if ((keypress["s"] || keypress["arrowdown"]) && vertices[sides[player.sids[5]].ids[0]].y < vertices[sides[bottomw.sids[4]].ids[0]].y) {
        player.change_pos(0, 1 * p_speed_multi, 0);
    }
    if ((keypress["d"] || keypress["arrowright"]) && vertices[sides[player.sids[2]].ids[0]].x < vertices[sides[rightw.sids[3]].ids[0]].x) {
        player.change_pos(1 * p_speed_multi, 0, 0);
    }
    if (vertices[sides[ai.sids[4]].ids[0]].y < vertices[sides[topw.sids[5]].ids[0]].y) {
        ai.change_pos(0, (vertices[sides[topw.sids[5]].ids[0]].y - vertices[sides[ai.sids[4]].ids[0]].y), 0);
    }
    if (vertices[sides[ai.sids[3]].ids[0]].x < vertices[sides[leftw.sids[2]].ids[0]].x) {
        ai.change_pos((vertices[sides[leftw.sids[2]].ids[0]].x - vertices[sides[ai.sids[3]].ids[0]].x), 0, 0);
    }
    if (vertices[sides[ai.sids[5]].ids[0]].y > vertices[sides[bottomw.sids[4]].ids[0]].y) {
        ai.change_pos(0, -(vertices[sides[ai.sids[5]].ids[0]].y - vertices[sides[bottomw.sids[4]].ids[0]].y), 0);
    }
    if (vertices[sides[ai.sids[2]].ids[0]].x > vertices[sides[rightw.sids[3]].ids[0]].x) {
        ai.change_pos(-(vertices[sides[ai.sids[2]].ids[0]].x - vertices[sides[rightw.sids[3]].ids[0]].x), 0, 0);
    }

    render();

    let ball_vel = pong.get_velocity()
    if (collision(pong, leftw, "L") || collision(pong, rightw, "R")) {
        pong.set_velocity(-ball_vel[0], ball_vel[1], ball_vel[2]);
    }
    ball_vel = pong.get_velocity()
    if (collision(pong, topw, "T") || collision(pong, bottomw, "b")) {
        pong.set_velocity(ball_vel[0], -ball_vel[1], ball_vel[2]);
    }
    ball_vel = pong.get_velocity()
    if (collision(pong, player, "F") || collision(pong, ai, "B")) {
        pong.set_velocity(ball_vel[0], ball_vel[1], -ball_vel[2]);
    }

    let bl_x = 0;
    let bl_y = 0;
    let ai_x = 0;
    let ai_y = 0;
    for (let vI of ai.vids) {
        ai_x += vertices[vI].x;
        ai_y += vertices[vI].y;
    }
    for (let vI of pong.vids) {
        bl_x += vertices[vI].x;
        bl_y += vertices[vI].y;
    }
    ai_x /= ai.vids.length;
    ai_y /= ai.vids.length;
    bl_x /= pong.vids.length;
    bl_y /= pong.vids.length;
    if (bl_x < ai_x) {
        ai.change_pos(-1 * ai_speed_multi, 0, 0);
    }
    if (bl_x > ai_x) {
        ai.change_pos(1 * ai_speed_multi, 0, 0);
    }
    if (bl_y < ai_y) {
        ai.change_pos(0, -1 * ai_speed_multi, 0);
    }
    if (bl_y > ai_y) {
        ai.change_pos(0, 1 * ai_speed_multi, 0);
    }
}

var update_int;
var pong;
var ai;
var player;
var topw, leftw, rightw, bottomw;
const cvs = new canvas("#999");
window.addEventListener("load", e => {
    // Left Wall Vertices and Container
    let v0 = new vertex(-500, 500, -100);
    let v1 = new vertex(-600, 500, -100);
    let v2 = new vertex(-600, -500, -100);
    let v3 = new vertex(-500, -500, -100);
    let v4 = new vertex(-500, 500, -100 + area_length);
    let v5 = new vertex(-600, 500, -100 + area_length);
    let v6 = new vertex(-600, -500, -100 + area_length);
    let v7 = new vertex(-500, -500, -100 + area_length);

    let s0 = new side([0, 1, 2, 3], "#099"); // Front
    let s1 = new side([4, 5, 6, 7], "#099"); // Back
    let s2 = new side([0, 3, 7, 4], "#099"); // Right
    let s3 = new side([1, 2, 6, 5], "#099"); // Left
    let s4 = new side([2, 3, 7, 6], "#099"); // Top
    let s5 = new side([1, 0, 4, 5], "#099"); // Bottom

    leftw = new container([0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 2, 3, 4, 5], "left");
    
    // Right Wall Vertices, Sides and Container
    let v8 = new vertex(500, 500, -100);
    let v9 = new vertex(600, 500, -100);
    let v10 = new vertex(600, -500, -100);
    let v11 = new vertex(500, -500, -100);
    let v12 = new vertex(500, 500, -100 + area_length);
    let v13 = new vertex(600, 500, -100 + area_length);
    let v14 = new vertex(600, -500, -100 + area_length);
    let v15 = new vertex(500, -500, -100 + area_length);
    
    let s6 = new side([8, 9, 10, 11], "#099"); // Front
    let s7 = new side([12, 13, 14, 15], "#099"); // Back
    let s8 = new side([9, 10, 14, 13], "#099"); // Right
    let s9 = new side([8, 11, 15, 12], "#099"); // Left
    let s10 = new side([10, 11, 15, 14], "#099"); // Top
    let s11 = new side([9, 8, 12, 13], "#099"); // Bottom

    rightw = new container([8, 9, 10, 11, 12, 13, 14, 15], [6, 7, 8, 9, 10, 11], "right");

    // Top Wall Vertices, Sides and Container
    let v16 = new vertex(500, -500, -100);
    let v17 = new vertex(-500, -500, -100);
    let v18 = new vertex(-500, -600, -100);
    let v19 = new vertex(500, -600, -100);
    let v20 = new vertex(500, -500, -100 + area_length);
    let v21 = new vertex(-500, -500, -100 + area_length);
    let v22 = new vertex(-500, -600, -100 + area_length);
    let v23 = new vertex(500, -600, -100 + area_length);

    let s12 = new side([16, 17, 18, 19], "#099"); // Front
    let s13 = new side([20, 21, 22, 23], "#099"); // Back
    let s14 = new side([16, 19, 23, 20], "#099"); // Right
    let s15 = new side([17, 18, 22, 21], "#099"); // Left
    let s16 = new side([19, 18, 22, 23], "#099"); // Top
    let s17 = new side([16, 17, 21, 20], "#099"); // Bottom

    topw = new container([16, 17, 18, 19, 20, 21, 22, 23], [12, 13, 14, 15, 16, 17], "top");

    // Bottom Wall Vertices, Sides and Container
    let v24 = new vertex(500, 500, -100);
    let v25 = new vertex(-500, 500, -100);
    let v26 = new vertex(-500, 600, -100);
    let v27 = new vertex(500, 600, -100);
    let v28 = new vertex(500, 500, -100 + area_length);
    let v29 = new vertex(-500, 500, -100 + area_length);
    let v30 = new vertex(-500, 600, -100 + area_length);
    let v31 = new vertex(500, 600, -100 + area_length);

    let s18 = new side([24, 25, 26, 27], "#099"); // Front
    let s19 = new side([28, 29, 30, 31], "#099"); // Back
    let s20 = new side([24, 27, 31, 28], "#099"); // Right
    let s21 = new side([25, 26, 30, 29], "#099"); // Left
    let s22 = new side([24, 25, 29, 28], "#099"); // Top
    let s23 = new side([27, 26, 30, 31], "#099"); // Bottom

    bottomw = new container([24, 25, 26, 27, 28, 29, 30, 31], [18, 19, 20, 21, 22, 23], "bottom");
    
    // AI Paddle Vertices, Sides and Container
    let v32 = new vertex(paddle_size, paddle_size, -100 + area_length - p_thickness);
    let v33 = new vertex(-paddle_size, paddle_size, -100 + area_length - p_thickness);
    let v34 = new vertex(-paddle_size, -paddle_size, -100 + area_length - p_thickness);
    let v35 = new vertex(paddle_size, -paddle_size, -100 + area_length - p_thickness);
    let v36 = new vertex(paddle_size, paddle_size, -100 + area_length);
    let v37 = new vertex(-paddle_size, paddle_size, -100 + area_length);
    let v38 = new vertex(-paddle_size, -paddle_size, -100 + area_length);
    let v39 = new vertex(paddle_size, -paddle_size, -100 + area_length);

    let s24 = new side([32, 33, 34, 35], "#c00"); // Front
    let s25 = new side([36, 37, 38, 39], "#c00"); // Back
    let s26 = new side([32, 35, 39, 36], "#c00"); // Right
    let s27 = new side([33, 34, 38, 37], "#c00"); // Left
    let s28 = new side([35, 34, 38, 39], "#c00"); // Top
    let s29 = new side([32, 33, 37, 36], "#c00"); // Bottom

    ai = new container([32, 33, 34, 35, 36, 37, 38, 39], [24, 25, 26, 27, 28, 29], "ai");
    
    // Ball Vertices, Sides and Container
    let v40 = new vertex(ball_size, ball_size, ball_size + area_length/2);
    let v41 = new vertex(ball_size, ball_size, -ball_size + area_length/2);
    let v42 = new vertex(ball_size, -ball_size, -ball_size + area_length/2);
    let v43 = new vertex(ball_size, -ball_size, ball_size + area_length/2);
    let v44 = new vertex(-ball_size, -ball_size, ball_size + area_length/2);
    let v45 = new vertex(-ball_size, ball_size, ball_size + area_length/2);
    let v46 = new vertex(-ball_size, ball_size, -ball_size + area_length/2);
    let v47 = new vertex(-ball_size, -ball_size, -ball_size + area_length/2);

    let s30 = new side([41, 46, 47, 42], "#cc0"); // Front
    let s31 = new side([40, 45, 44, 43], "#cc0"); // Back
    let s32 = new side([40, 41, 42, 43], "#cc0"); // Right
    let s33 = new side([44, 45, 46, 47], "#cc0"); // Left
    let s34 = new side([42, 43, 44, 47], "#cc0"); // Top
    let s35 = new side([40, 41, 46, 45], "#cc0"); // Bottom

    pong = new container([40, 41, 42, 43, 44, 45, 46, 47], [30, 31, 32, 33, 34, 35], "ball");

    // Player Paddle Vertices, Sides and Container
    let v48 = new vertex(100, 100, -100);
    let v49 = new vertex(-100, 100, -100);
    let v50 = new vertex(-100, -100, -100);
    let v51 = new vertex(100, -100, -100);
    let v52 = new vertex(100, 100, -100 + p_thickness);
    let v53 = new vertex(-100, 100, -100 + p_thickness);
    let v54 = new vertex(-100, -100, -100 + p_thickness);
    let v55 = new vertex(100, -100, -100 + p_thickness);

    let s36 = new side([48, 49, 50, 51], "#0c0"); // Front
    let s37 = new side([52, 53, 54, 55], "#0c0"); // Back
    let s38 = new side([48, 51, 55, 52], "#0c0"); // Right
    let s39 = new side([49, 50, 54, 53], "#0c0"); // Left
    let s40 = new side([51, 50, 54, 55], "#0c0"); // Top
    let s41 = new side([48, 49, 53, 52], "#0c0"); // Bottom

    player = new container([48, 49, 50, 51, 52, 53, 54, 55], [36, 37, 38, 39, 40, 41], "player")

    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    update_int = setInterval(() =>{
        update();
    }, 1);
});
window.addEventListener("resize", e => {
    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    cvs.update_size();
});
window.addEventListener("keydown", e => {
    keypress[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", e => {
    keypress[e.key.toLowerCase()] = false;
});