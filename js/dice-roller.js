// dice-roller.js
class DiceRoller {
    constructor(gl, camera, shaderProgram) {
        this.gl = gl;
        this.camera = camera; // Camera object with viewMatrix and projectionMatrix
        this.shaderProgram = shaderProgram; // Pre-initialized shader program
        this.physics = new Physics(); // From physics.js
        this.textureManager = new TextureManager(gl); // From texture-manager.js
        this.dice = []; // Array to store all dice
        this.lastTime = 0;

        // Initialize the shader program uniforms and attributes
        this.initShaderProgram();

        // Initialize cube geometry for d6
        this.initCubeGeometry();

        // Load textures
        this.textureManager.loadDiceTextures().then(() => {
            console.log('Textures loaded successfully');
        }).catch(err => {
            console.error('Failed to load textures:', err);
        });

        // Start the animation loop
        this.animate(0);
    }

    initShaderProgram() {
        // Use the provided shader program
        this.gl.useProgram(this.shaderProgram);

        // Get uniform locations (based on the vertex and fragment shaders in index.html)
        this.shaderProgram.modelViewMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'modelViewMatrix');
        this.shaderProgram.projectionMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'projectionMatrix');
        this.shaderProgram.ambientProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'ambientProduct');
        this.shaderProgram.diffuseProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'diffuseProduct');
        this.shaderProgram.specularProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'specularProduct');
        this.shaderProgram.shininessUniform = this.gl.getUniformLocation(this.shaderProgram, 'shininess');
        this.shaderProgram.lightPositionUniform = this.gl.getUniformLocation(this.shaderProgram, 'lightPosition');
        this.shaderProgram.textureUniform = this.gl.getUniformLocation(this.shaderProgram, 'texture');
        this.shaderProgram.useTextureUniform = this.gl.getUniformLocation(this.shaderProgram, 'useTexture');

        // Set up lighting (simplified for now)
        const lightPosition = vec4(0.0, 5.0, 5.0, 1.0);
        const ambientProduct = mult(vec4(0.2, 0.2, 0.2, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const diffuseProduct = mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const specularProduct = mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const shininess = 100.0;

        this.gl.uniform4fv(this.shaderProgram.lightPositionUniform, flatten(lightPosition));
        this.gl.uniform4fv(this.shaderProgram.ambientProductUniform, flatten(ambientProduct));
        this.gl.uniform4fv(this.shaderProgram.diffuseProductUniform, flatten(diffuseProduct));
        this.gl.uniform4fv(this.shaderProgram.specularProductUniform, flatten(specularProduct));
        this.gl.uniform1f(this.shaderProgram.shininessUniform, shininess);
        this.gl.uniform1i(this.shaderProgram.useTextureUniform, 1); // Enable texture
    }

    initCubeGeometry() {
        // Vertices for a cube (d6) with position, normal, and texture coordinates
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        // Define the 8 corners of the cube
        const points = [
            vec4(-0.5, -0.5, 0.5, 1.0), // 0
            vec4(0.5, -0.5, 0.5, 1.0),  // 1
            vec4(0.5, 0.5, 0.5, 1.0),   // 2
            vec4(-0.5, 0.5, 0.5, 1.0),  // 3
            vec4(-0.5, -0.5, -0.5, 1.0),// 4
            vec4(0.5, -0.5, -0.5, 1.0), // 5
            vec4(0.5, 0.5, -0.5, 1.0),  // 6
            vec4(-0.5, 0.5, -0.5, 1.0)  // 7
        ];

        // Define the normals for each face
        const faceNormals = [
            vec4(0.0, 0.0, 1.0, 0.0),  // Front
            vec4(0.0, 0.0, -1.0, 0.0), // Back
            vec4(0.0, 1.0, 0.0, 0.0),  // Top
            vec4(0.0, -1.0, 0.0, 0.0), // Bottom
            vec4(1.0, 0.0, 0.0, 0.0),  // Right
            vec4(-1.0, 0.0, 0.0, 0.0)  // Left
        ];

        // Define texture coordinates for each face
        const tex = [
            vec2(0.0, 0.0),
            vec2(1.0, 0.0),
            vec2(1.0, 1.0),
            vec2(0.0, 1.0)
        ];

        // Helper function to add a face
        function quad(a, b, c, d, normal) {
            const idx = vertices.length / 4;
            vertices.push(points[a], points[b], points[c], points[d]);
            normals.push(normal, normal, normal, normal);
            texCoords.push(tex[0], tex[1], tex[2], tex[3]);
            indices.push(idx, idx + 1, idx + 2, idx, idx + 2, idx + 3);
        }

        // Define the six faces of the cube
        quad(0, 1, 2, 3, faceNormals[0]); // Front
        quad(5, 4, 7, 6, faceNormals[1]); // Back
        quad(3, 2, 6, 7, faceNormals[2]); // Top
        quad(4, 5, 1, 0, faceNormals[3]); // Bottom
        quad(1, 5, 6, 2, faceNormals[4]); // Right
        quad(4, 0, 3, 7, faceNormals[5]); // Left

        // Create buffers
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(vertices), this.gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(normals), this.gl.STATIC_DRAW);

        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(texCoords), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        this.numIndices = indices.length;
    }

    addDice(type) {
        const dice = {
            type: type,
            position: [Math.random() * 2 - 1, 3, Math.random() * 2 - 1], // Random x, z; start at y=3
            rotation: mat4(), // Identity matrix for rotation
            velocity: [0, 0, 0],
            angularVelocity: [0, 0, 0],
            size: 1.0, // Size of the dice
            isRolling: false
        };

        this.dice.push(dice);
        console.log('Dice added:', dice);

        // Start the roll
        this.physics.roll(dice);
    }

    clearDice() {
        this.dice = [];
        console.log('All dice cleared');
    }

    rollAllDice() {
        this.dice.forEach(dice => {
            this.physics.roll(dice);
        });
    }

    animate(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.dice.forEach(dice => {
            if (dice.isRolling) {
                this.physics.update(dice, deltaTime);
            }

            const modelMatrix = mat4();
            translate(modelMatrix, modelMatrix, dice.position);
            mult(modelMatrix, modelMatrix, dice.rotation);

            const modelViewMatrix = mat4();
            mult(modelViewMatrix, this.camera.viewMatrix, modelMatrix);

            console.log('Dice position:', dice.position, 'type:', 'vec3');
            console.log('Model matrix:', modelMatrix);
            console.log('Model-view matrix:', modelViewMatrix);

            this.renderDice(dice, modelViewMatrix);
        });

        requestAnimationFrame((t) => this.animate(t));
    }

    renderDice(dice, modelViewMatrix) {
        this.gl.useProgram(this.shaderProgram);

        // Bind buffers
        const positionLoc = this.gl.getAttribLocation(this.shaderProgram, 'vPosition');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(positionLoc, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);

        const normalLoc = this.gl.getAttribLocation(this.shaderProgram, 'vNormal');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(normalLoc, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(normalLoc);

        const texCoordLoc = this.gl.getAttribLocation(this.shaderProgram, 'vTexCoord');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(texCoordLoc);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Bind texture
        const textureBound = this.textureManager.bindTexture(dice.type);
        console.log('Texture bound:', textureBound);

        // Set uniforms
        this.gl.uniformMatrix4fv(this.shaderProgram.modelViewMatrixUniform, false, flatten(modelViewMatrix));
        this.gl.uniformMatrix4fv(this.shaderProgram.projectionMatrixUniform, false, flatten(this.camera.projectionMatrix));
        this.gl.uniform1i(this.shaderProgram.useTextureUniform, 1);

        // Draw the dice
        this.gl.drawElements(this.gl.TRIANGLES, this.numIndices, this.gl.UNSIGNED_SHORT, 0);
        console.log('Drawing dice with', this.numIndices, 'indices');
    }
}