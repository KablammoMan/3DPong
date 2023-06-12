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

class text {
    constructor(x, y, font, text) {
        this.x = x;
        this.y = y;
        this.ax = -cvs.canvas.width/2 + this.x;
        this.ay = -cvs.canvas.width/2 + this.y;
        this.font = font;
        this.text = text;
        texts.push(this);
    }
    update_text(text) {
        this.text = text;
    }
    update_pos() {
        this.ax = -cvs.canvas.width/2 + this.x;
        this.ay = -cvs.canvas.height/2 + this.y;
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


const vertices = [];
const sides = [];
const containers = [];
const texts = [];
const keypress = {};
const ball_size = 50;
const paddle_size = 100;
const p_thickness = 20;
const area_length = 1000;
const ai_speed_multi = 5;
const p_speed_multi = 5;
const x_bounce_multi = 0.1; // Increase Amount per X bounce
const y_bounce_multi = 0.1; // Increase Amount per Y bounce
const z_bounce_multi = 0.1; // Increase Amount per Z bounce
const cvs = new canvas("#999");
var focal_length = 60;
var p_score = 0;
var a_score = 0;
var end = false;
var rebound_player;
var update_int;
var pong;
var ai;
var player;
var topw, leftw, rightw, bottomw;
var topi, lefti, righti, bottomi;
var scoreText;


function render() {
    // Render 3D Shapes
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

    // Render Text
    for (let t of texts) {
        cvs.ctx.font = t.font;
        cvs.ctx.fillStyle = "#000";
        cvs.ctx.fillText(t.text, cvs.canvas.width/2 + t.ax, cvs.canvas.height/2 + t.ay);
    }
}

function collision(ball, cont) {
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

    if (//  X    ||    X    ||    Y    ||    Y    ||    Z    ||    Z
        (bR > cL && bR < cR && bb > cT && bb < cb && bF < cB && bF > cF) || // Front Right Bottom
        (bL > cL && bL < cR && bb > cT && bb < cb && bF < cB && bF > cF) || // Front Left  Bottom
        (bR > cL && bR < cR && bT > cT && bT < cb && bF < cB && bF > cF) || // Front Right Top
        (bL > cL && bL < cR && bT > cT && bT < cb && bF < cB && bF > cF) || // Front Left  Top
        (bR > cL && bR < cR && bb > cT && bb < cb && bB < cB && bB > cF) || // Back  Right Bottom
        (bL > cL && bL < cR && bb > cT && bb < cb && bB < cB && bB > cF) || // Back  Left  Bottom
        (bR > cL && bR < cR && bT > cT && bT < cb && bB < cB && bB > cF) || // Back  Right Top
        (bL > cL && bL < cR && bT > cT && bT < cb && bB < cB && bB > cF)    // Back  Left  Top
    ) {
        return true;
    } else {
        return false;
    }
}

function reset() {
    // Reset Game Variables
    vertices.splice(0, vertices.length);
    sides.splice(0, sides.length);
    containers.splice(0, containers.length);
    texts.splice(0, texts.length);
    end = false;

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

    // Indicator Right
    let v32 = new vertex(500, 500, -ball_size + area_length/2);
    let v33 = new vertex(500, 500, -ball_size + area_length/2);
    let v34 = new vertex(500, -500, -ball_size + area_length/2);
    let v35 = new vertex(500, -500, -ball_size + area_length/2);
    let v36 = new vertex(500, 500, ball_size + area_length/2);
    let v37 = new vertex(500, 500, ball_size + area_length/2);
    let v38 = new vertex(500, -500, ball_size + area_length/2);
    let v39 = new vertex(500, -500, ball_size + area_length/2);

    let s24 = new side([32, 33, 34, 35], "#0cc"); // Front
    let s25 = new side([36, 37, 38, 39], "#0cc"); // Back
    let s26 = new side([32, 35, 39, 36], "#0cc"); // Right
    let s27 = new side([33, 34, 38, 37], "#0cc"); // Left
    let s28 = new side([35, 34, 38, 39], "#0cc"); // Top
    let s29 = new side([32, 33, 37, 36], "#0cc"); // Bottom

    righti = new container([32, 33, 34, 35, 36, 37, 38, 39], [24, 25, 26, 27, 28, 29], "righti");

    // Indicator Left
    let v40 = new vertex(-500, 500, -ball_size + area_length/2);
    let v41 = new vertex(-500, 500, -ball_size + area_length/2);
    let v42 = new vertex(-500, -500, -ball_size + area_length/2);
    let v43 = new vertex(-500, -500, -ball_size + area_length/2);
    let v44 = new vertex(-500, 500, ball_size + area_length/2);
    let v45 = new vertex(-500, 500, ball_size + area_length/2);
    let v46 = new vertex(-500, -500, ball_size + area_length/2);
    let v47 = new vertex(-500, -500, ball_size + area_length/2);

    let s30 = new side([40, 41, 42, 43], "#0cc"); // Front
    let s31 = new side([44, 45, 46, 47], "#0cc"); // Back
    let s32 = new side([40, 43, 47, 44], "#0cc"); // Right
    let s33 = new side([41, 42, 46, 45], "#0cc"); // Left
    let s34 = new side([43, 42, 46, 47], "#0cc"); // Top
    let s35 = new side([40, 41, 45, 44], "#0cc"); // Bottom

    lefti = new container([40, 41, 42, 43, 44, 45, 46, 47], [30, 31, 32, 33, 34, 35], "lefti");

    // Indicator Top
    let v48 = new vertex(500, -500, -ball_size + area_length/2);
    let v49 = new vertex(-500, -500, -ball_size + area_length/2);
    let v50 = new vertex(-500, -500, -ball_size + area_length/2);
    let v51 = new vertex(500, -500, -ball_size + area_length/2);
    let v52 = new vertex(500, -500, ball_size + area_length/2);
    let v53 = new vertex(-500, -500, ball_size + area_length/2);
    let v54 = new vertex(-500, -500, ball_size + area_length/2);
    let v55 = new vertex(500, -500, ball_size + area_length/2);

    let s36 = new side([48, 49, 50, 51], "#0cc"); // Front
    let s37 = new side([52, 53, 54, 55], "#0cc"); // Back
    let s38 = new side([48, 51, 55, 52], "#0cc"); // Right
    let s39 = new side([49, 50, 54, 53], "#0cc"); // Left
    let s40 = new side([51, 50, 54, 55], "#0cc"); // Top
    let s41 = new side([48, 49, 53, 52], "#0cc"); // Back

    topi = new container([48, 49, 50, 51, 52, 53, 54, 55], [36, 37, 38, 39, 40, 41], "topi");

    // Indicator Bottom
    let v56 = new vertex(500, 500, -ball_size + area_length/2);
    let v57 = new vertex(-500, 500, -ball_size + area_length/2);
    let v58 = new vertex(-500, 500, -ball_size + area_length/2);
    let v59 = new vertex(500, 500, -ball_size + area_length/2);
    let v60 = new vertex(500, 500, ball_size + area_length/2);
    let v61 = new vertex(-500, 500, ball_size + area_length/2);
    let v62 = new vertex(-500, 500, ball_size + area_length/2);
    let v63 = new vertex(500, 500, ball_size + area_length/2);

    let s42 = new side([56, 57, 58, 59], "#0cc"); // Front
    let s43 = new side([60, 61, 62, 63], "#0cc"); // Back
    let s44 = new side([56, 59, 63, 60], "#0cc"); // Right
    let s45 = new side([57, 58, 62, 61], "#0cc"); // Left
    let s46 = new side([59, 58, 62, 63], "#0cc"); // Top
    let s47 = new side([56, 57, 61, 60], "#0cc"); // Back

    bottomi = new container([56, 57, 58, 59, 60, 61, 62, 63], [42, 43, 44, 45, 46, 47], "bottomi");

    
    // AI Paddle Vertices, Sides and Container
    let v64 = new vertex(paddle_size, paddle_size, -100 + area_length - p_thickness);
    let v65 = new vertex(-paddle_size, paddle_size, -100 + area_length - p_thickness);
    let v66 = new vertex(-paddle_size, -paddle_size, -100 + area_length - p_thickness);
    let v67 = new vertex(paddle_size, -paddle_size, -100 + area_length - p_thickness);
    let v68 = new vertex(paddle_size, paddle_size, -100 + area_length);
    let v69 = new vertex(-paddle_size, paddle_size, -100 + area_length);
    let v70 = new vertex(-paddle_size, -paddle_size, -100 + area_length);
    let v71 = new vertex(paddle_size, -paddle_size, -100 + area_length);

    let s48 = new side([64, 65, 66, 67], "#c00"); // Front
    let s49 = new side([68, 69, 70, 71], "#c00"); // Back
    let s50 = new side([64, 67, 71, 68], "#c00"); // Right
    let s51 = new side([65, 66, 70, 69], "#c00"); // Left
    let s52 = new side([67, 66, 70, 71], "#c00"); // Top
    let s53 = new side([64, 65, 69, 68], "#c00"); // Bottom

    ai = new container([64, 65, 66, 67, 68, 69, 70, 71], [48, 49, 50, 51, 52, 53], "ai");
    
    // Ball Vertices, Sides and Container
    let v72 = new vertex(ball_size, ball_size, ball_size + area_length/2);
    let v73 = new vertex(ball_size, ball_size, -ball_size + area_length/2);
    let v74 = new vertex(ball_size, -ball_size, -ball_size + area_length/2);
    let v75 = new vertex(ball_size, -ball_size, ball_size + area_length/2);
    let v76 = new vertex(-ball_size, -ball_size, ball_size + area_length/2);
    let v77 = new vertex(-ball_size, ball_size, ball_size + area_length/2);
    let v78 = new vertex(-ball_size, ball_size, -ball_size + area_length/2);
    let v79 = new vertex(-ball_size, -ball_size, -ball_size + area_length/2);

    let s54 = new side([73, 78, 79, 74], "#cc0"); // Front
    let s55 = new side([72, 77, 76, 75], "#cc0"); // Back
    let s56 = new side([72, 73, 74, 75], "#cc0"); // Right
    let s57 = new side([76, 77, 78, 79], "#cc0"); // Left
    let s58 = new side([74, 75, 76, 79], "#cc0"); // Top
    let s59 = new side([72, 73, 78, 77], "#cc0"); // Bottom

    pong = new container([72, 73, 74, 75, 76, 77, 78, 79], [54, 55, 56, 57, 58, 59], "ball");

    // Player Paddle Vertices, Sides and Container
    let v80 = new vertex(100, 100, -100);
    let v81 = new vertex(-100, 100, -100);
    let v82 = new vertex(-100, -100, -100);
    let v83 = new vertex(100, -100, -100);
    let v84 = new vertex(100, 100, -100 + p_thickness);
    let v85 = new vertex(-100, 100, -100 + p_thickness);
    let v86 = new vertex(-100, -100, -100 + p_thickness);
    let v87 = new vertex(100, -100, -100 + p_thickness);

    let s60 = new side([80, 81, 82, 83], "#0c0"); // Front
    let s61 = new side([84, 85, 86, 87], "#0c0"); // Back
    let s62 = new side([80, 83, 87, 84], "#0c0"); // Right
    let s63 = new side([81, 82, 86, 85], "#0c0"); // Left
    let s64 = new side([83, 82, 86, 87], "#0c0"); // Top
    let s65 = new side([80, 81, 85, 84], "#0c0"); // Bottom

    player = new container([80, 81, 82, 83, 84, 85, 86, 87], [60, 61, 62, 63, 64, 65], "player");

    focal_length = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 2);
    let init_x = 0;
    let init_y = 0;
    let init_z = Math.floor(Math.random() * 11) - 5;
    while (Math.abs(init_x) == Math.abs(init_y)) {
        init_x = Math.floor(Math.random() * 11) - 5;
        init_y = Math.floor(Math.random() * 11) - 5;
    }
    let posneg = Math.floor(Math.random() * 2);
    if (posneg == 0) {
        if (init_x == 0) {
            init_x = -1;
        }
        if (init_y == 0) {
            init_y = -1;
        }
        if (init_z == 0) {
            init_z = -1;
        }
    } else {
        if (init_x == 0) {
            init_x = 1;
        }
        if (init_y == 0) {
            init_y = 1;
        }
        if (init_z == 0) {
            init_z = 1;
        }
    }
    pong.set_velocity(init_x, init_y, init_z);
    righti.set_velocity(0, 0, init_z);
    lefti.set_velocity(0, 0, init_z);
    topi.set_velocity(0, 0, init_z);
    bottomi.set_velocity(0, 0, init_z);
    if (init_z < 0) {
        rebound_player = true;
    } else {
        rebound_player = false;
    }

    scoreText = new text(100, 100, "100px Consolas", "YOU: 0 | AI: 0");

    update_int = setInterval(() =>{
        update();
    }, 1);
}

function update() {
    cvs.clear();
    for (let v of vertices) {
        v.update_pos();
    }
    for (let t of texts) {
        t.update_pos();
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



    if (vertices[sides[pong.sids[0]].ids[0]].z < vertices[sides[player.sids[0]].ids[0]].z) {
        a_score++;
        end = true;
    }
    if (vertices[sides[pong.sids[1]].ids[0]].z > vertices[sides[ai.sids[1]].ids[0]].z) {
        p_score++;
        end = true;
    }
    scoreText.update_text(`YOU: ${p_score} | AI: ${a_score}`);

    render();

    let ball_vel = pong.get_velocity()
    if (collision(pong, leftw) || collision(pong, rightw)) {
        pong.set_velocity(-(ball_vel[0] + (ball_vel[0]/Math.abs(ball_vel[0])) * x_bounce_multi), ball_vel[1], ball_vel[2]);
    }
    ball_vel = pong.get_velocity()
    if (collision(pong, topw) || collision(pong, bottomw)) {
        pong.set_velocity(ball_vel[0], -(ball_vel[1] + (ball_vel[1]/Math.abs(ball_vel[1])) * y_bounce_multi), ball_vel[2]);
    }
    ball_vel = pong.get_velocity()
    if ((collision(pong, player) && (rebound_player)) || (collision(pong, ai) && (!rebound_player))) {
        pong.set_velocity(ball_vel[0], ball_vel[1], -(ball_vel[2] + (ball_vel[2]/Math.abs(ball_vel[2])) * z_bounce_multi));
        righti.set_velocity(0, 0, -(ball_vel[2] + (ball_vel[2]/Math.abs(ball_vel[2])) * z_bounce_multi));
        lefti.set_velocity(0, 0, -(ball_vel[2] + (ball_vel[2]/Math.abs(ball_vel[2])) * z_bounce_multi));
        topi.set_velocity(0, 0, -(ball_vel[2] + (ball_vel[2]/Math.abs(ball_vel[2])) * z_bounce_multi));
        bottomi.set_velocity(0, 0, -(ball_vel[2] + (ball_vel[2]/Math.abs(ball_vel[2])) * z_bounce_multi));
        rebound_player = !(rebound_player);
    }

    if (end) {
        clearInterval(update_int);
        reset();
        return;
    }

    let bl_x = 0;
    let bl_y = 0;
    let ai_x = 0;
    let ai_y = 0;
    let pl_x = 0;
    let pl_y = 0;
    for (let vI of ai.vids) {
        ai_x += vertices[vI].x;
        ai_y += vertices[vI].y;
    }
    for (let vI of player.vids) {
        pl_x += vertices[vI].x;
        pl_y += vertices[vI].y;
    }
    for (let vI of pong.vids) {
        bl_x += vertices[vI].x;
        bl_y += vertices[vI].y;
    }
    ai_x /= ai.vids.length;
    ai_y /= ai.vids.length;
    pl_x /= player.vids.length;
    pl_y /= player.vids.length;
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

    // Uncomment if player should also be controlled by AI
    // if (bl_x < pl_x) {
    //     player.change_pos(-1 * p_speed_multi, 0, 0);
    // }
    // if (bl_x > pl_x) {
    //     player.change_pos(1 * p_speed_multi, 0, 0);
    // }
    // if (bl_y < pl_y) {
    //     player.change_pos(0, -1 * p_speed_multi, 0);
    // }
    // if (bl_y > pl_y) {
    //     player.change_pos(0, 1 * p_speed_multi, 0);
    // }
}


window.addEventListener("load", e => {
    reset();
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