"use strict";

var canvas, gl, program;
var positionsArray = [];
var normalsArray = [];
var texCoordsArray = [];
var numPositions = 12; // 4 faces * 3 vertices
var numTetraPositions = 12;
var framebuffer;
var flag = true;
var color = new Uint8Array(4);

var tetraVertices = [
    vec4(0.0, 0.0, 1.0, 1.0),  // Vertex 0 (top)
    vec4(0.0, 0.9428, -0.3333, 1.0),  // Vertex 1 (base front)
    vec4(-0.8165, -0.4714, -0.3333, 1.0),  // Vertex 2 (base left)
    vec4(0.8165, -0.4714, -0.3333, 1.0)   // Vertex 3 (base right)
];

// planet theme: Each tetrahedron face represents a planet
var tetraplanetNames = ["sun", "earth", "mars", "moon"];
var tetraplanetDescriptions = [
    "A massive star at the center of our solar system.",
    "Our home planet, rich with life and oceans.",
    "The red planet, known for its dusty surface.",
    "Earth's natural satellite, covered in craters."
];
var tetraplanetMusicFiles = [
    "assets/sounds/sun.mp3",
    "assets/sounds/earth.mp3",
    "assets/sounds/mars.mp3",
    "assets/sounds/moon.mp3"
];
var tetraplanetImageFiles = [
    "assets/textures/sun.jpg",
    "assets/textures/earth.jpg",
    "assets/textures/mars.jpg",
    "assets/textures/moon.jpg"
];

var currentAudio = new Audio();

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(0.0, 1.0, 1.0, 1.0);
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 10.0;

var xAxis = 0, yAxis = 1, zAxis = 2;
var axis = xAxis;
var theta = vec3(0.0, 0.0, 0.0);
var rotationSpeeds = [2.0, 2.0, 2.0]; // Degrees per frame
var rotationDirections = [1, 1, 1]; // 1 or -1 for direction
var thetaLoc;
var texture, bgTexture, image;

var cameraPosition = vec3(0.0, 0.0, 5.0);
var targetFace = Math.floor(Math.random() * 4) + 1;
var score = 0;
var countdown = 10;
var gameInterval = null;

window.onload = init;

// Define a triangular face of the tetrahedron
function triangle(a, b, c, tx, ty) {
    var dx = 1.0 / 4.0;
    var dy = 1.0 / 2.0;
    var texCoordMapped = [
        vec2(tx * dx, (ty + 1) * dy),
        vec2((tx + 1) * dx, (ty + 1) * dy),
        vec2((tx + 0.5) * dx, ty * dy)
    ];

    var t1 = subtract(tetraVertices[b], tetraVertices[a]);
    var t2 = subtract(tetraVertices[c], tetraVertices[b]);
    var normal = normalize(cross(t1, t2));

    positionsArray.push(tetraVertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoordMapped[0]);

    positionsArray.push(tetraVertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoordMapped[1]);

    positionsArray.push(tetraVertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoordMapped[2]);
}

// Construct the tetrahedron with 4 planet-themed faces
function colorTetrahedron() {
    positionsArray = [];
    normalsArray = [];
    texCoordsArray = [];
    numTetraPositions = 12;

    triangle(0, 1, 2, 0, 1); // Face 1: sun (red mask)
    triangle(0, 2, 3, 1, 1); // Face 2: earth (yellow mask)
    triangle(0, 3, 1, 2, 1); // Face 3: mars (mars mask)
    triangle(1, 3, 2, 0, 0); // Face 4: moon (green mask)
}

// Define a static background quad
function backgroundQuad() {
    var bgVertices = [
        vec4(-2, -2, -10, 1.0),
        vec4(2, -2, -10, 1.0),
        vec4(2, 2, -10, 1.0),
        vec4(-2, 2, -10, 1.0)
    ];
    var bgTexCoords = [vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 1)];
    var bgIndices = [0, 1, 2, 0, 2, 3];

    for (let i of bgIndices) {
        positionsArray.push(bgVertices[i]);
        normalsArray.push(vec3(0, 0, 1));
        texCoordsArray.push(bgTexCoords[i % 4]);
    }
}

function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2.0 isn't available");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    texture = gl.createTexture();
    image = new Image();
    image.src = "assets/textures/planet_texture.jpg";
    image.onerror = function () {
        console.warn("Failed to load planet_texture.jpg, using texture.jpg as fallback");
        image.src = "assets/textures/texture.jpg";
    };
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    };

    bgTexture = gl.createTexture();
    var bgImage = new Image();
    bgImage.src = "assets/textures/background.jpg";
    bgImage.onerror = function () {
        console.warn("Failed to load background.jpg, using planet_texture.jpg as fallback");
        bgImage.src = "assets/textures/planet_texture.jpg";
    };
    bgImage.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, bgTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    };

    var fbTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fbTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorTetrahedron();
    backgroundQuad();
    numPositions = numTetraPositions + 6;

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), lightPosition);
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

    var projectionMatrix = ortho(-2, 2, -2, 2, -20, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));

    thetaLoc = gl.getUniformLocation(program, "uModelViewMatrix");

    gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

    document.getElementById("ButtonX").onclick = function () { axis = xAxis; };
    document.getElementById("ButtonY").onclick = function () { axis = yAxis; };
    document.getElementById("ButtonZ").onclick = function () { axis = zAxis; };
    document.getElementById("ButtonT").onclick = function () { flag = !flag; };
    document.getElementById("reset-game").onclick = function () {
        score = 0;
        countdown = 10;
        targetFace = Math.floor(Math.random() * 4) + 1;
        document.getElementById("score").innerText = "Score: 0";
        document.getElementById("timer").innerText = "Time: 10";
        document.getElementById("target").innerText = "Target planet: " + tetraplanetNames[targetFace - 1];
        document.getElementById("result").innerText = "";
        document.getElementById("city-name").innerText = "—";
        document.getElementById("planet-description").innerText = "—";
        document.getElementById("music-title").innerText = "—";
        document.getElementById("city-image").src = "";
        theta = vec3(0.0, 0.0, 0.0);
        rotationSpeeds = [2.0, 2.0, 2.0];
        rotationDirections = [Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1, Math.random() > 0.5 ? 1 : -1];
        startGameTimer();
    };

    document.getElementById("play-music").addEventListener("click", function () {
        currentAudio.play().catch(err => console.log("Play failed:", err));
    });
    document.getElementById("pause-music").addEventListener("click", function () {
        currentAudio.pause();
    });

    canvas.addEventListener("mousedown", pickFace);
    window.addEventListener("keydown", moveCamera);

    document.getElementById("target").innerText = "Target planet: " + tetraplanetNames[targetFace - 1];
    startGameTimer();
    render();
}

// Handle mouse clicks to pick a planet face
function pickFace(event) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.uniform1i(gl.getUniformLocation(program, "uPickingMode"), true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < 4; i++) {
        gl.uniform1i(gl.getUniformLocation(program, "uColorIndex"), i + 1);
        gl.drawArrays(gl.TRIANGLES, i * 3, 3);
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = canvas.height - (event.clientY - rect.top);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.uniform1i(gl.getUniformLocation(program, "uPickingMode"), false);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1i(gl.getUniformLocation(program, "uColorIndex"), 0);
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    let clickedFace = 0;
    // Debug: Log color values to diagnose detection issues
    console.log("Picked color: R=" + color[0] + ", G=" + color[1] + ", B=" + color[2] + ", A=" + color[3]);

    if (color[0] === 255 && color[1] === 0 && color[2] === 0) {
        clickedFace = 1; // red (sun)
    } else if (color[0] === 255 && color[1] === 255 && color[2] === 0) {
        clickedFace = 2; // yellow (earth)
    } else if (color[0] === 255 && color[1] >= 125 && color[1] <= 129 && color[2] === 0) {
        clickedFace = 3; // mars (mars, tolerate 125-129 for G)
    } else if (color[0] === 0 && color[1] === 255 && color[2] === 0) {
        clickedFace = 4; // green (moon)
    }

    if (clickedFace >= 1 && clickedFace <= 4) {
        const mapping = [0, 1, 2, 3];
        const index = mapping[clickedFace - 1];
        const planet = tetraplanetNames[index];

        document.getElementById("city-name").innerText = planet;
        document.getElementById("planet-description").innerText = tetraplanetDescriptions[index];
        document.getElementById("city-image").src = tetraplanetImageFiles[index];
        document.getElementById("music-title").innerText = tetraplanetMusicFiles[index].split('/').pop();

        currentAudio.src = tetraplanetMusicFiles[index];
        currentAudio.play().catch(err => console.log("Audio error:", err));
    } else {
        console.log("No face detected for color: ", color);
    }

    const correct = clickedFace === targetFace;
    document.getElementById("result").innerText = correct ? "Correct!" : "Wrong! Target was " + tetraplanetNames[targetFace - 1];
    if (correct) score++;
    document.getElementById("score").innerText = "Score: " + score;
    targetFace = Math.floor(Math.random() * 4) + 1;
    document.getElementById("target").innerText = "Target planet: " + tetraplanetNames[targetFace - 1];
    countdown = 10;
    document.getElementById("timer").innerText = "Time: " + countdown;
}

// Move the camera with WASD or arrow keys
function moveCamera(event) {
    var step = 0.5;
    if (event.key === "ArrowUp" || event.key === "w") {
        cameraPosition[1] += step;
    } else if (event.key === "ArrowDown" || event.key === "s") {
        cameraPosition[1] -= step;
    } else if (event.key === "ArrowLeft" || event.key === "a") {
        cameraPosition[0] -= step;
    } else if (event.key === "ArrowRight" || event.key === "d") {
        cameraPosition[0] += step;
    }
}

// Start the 10-second countdown and 60-second game timer
function startGameTimer() {
    if (gameInterval) clearInterval(gameInterval);
    let totalTime = 60;
    gameInterval = setInterval(function () {
        countdown--;
        totalTime--;
        if (countdown <= 0) {
            document.getElementById("result").innerText = "Missed! Target was " + tetraplanetNames[targetFace - 1];
            targetFace = Math.floor(Math.random() * 4) + 1;
            document.getElementById("target").innerText = "Target planet: " + tetraplanetNames[targetFace - 1];
            countdown = 10;
        }
        if (totalTime <= 0) {
            clearInterval(gameInterval);
            document.getElementById("result").innerText = "Game Over! Final Score: " + score;
        }
        document.getElementById("timer").innerText = "Time: " + countdown;
    }, 1000);
}

// Render the static background and rotating tetrahedron
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render static background
    var bgModelViewMatrix = lookAt(cameraPosition, vec3(0.0, 0.0, -10.0), vec3(0.0, 1.0, 0.0));
    gl.uniformMatrix4fv(thetaLoc, false, flatten(bgModelViewMatrix));
    gl.bindTexture(gl.TEXTURE_2D, bgTexture);
    gl.uniform1i(gl.getUniformLocation(program, "uColorIndex"), -1);
    gl.drawArrays(gl.TRIANGLES, numTetraPositions, 6);

    // Update rotation for selected axis
    if (flag) {
        theta[axis] += rotationSpeeds[axis] * rotationDirections[axis];
    }

    // Render rotating tetrahedron
    var rotationMatrix = rotate(theta[axis], axis === xAxis ? vec3(1, 0, 0) : axis === yAxis ? vec3(0, 1, 0) : vec3(0, 0, 1));
    var tetraModelViewMatrix = lookAt(cameraPosition, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    tetraModelViewMatrix = mult(tetraModelViewMatrix, rotationMatrix);
    gl.uniformMatrix4fv(thetaLoc, false, flatten(tetraModelViewMatrix));
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (let i = 0; i < 4; i++) {
        gl.uniform1i(gl.getUniformLocation(program, "uColorIndex"), i);
        gl.drawArrays(gl.TRIANGLES, i * 3, 3);
    }

    requestAnimationFrame(render);
}