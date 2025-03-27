// Dice geometry definitions and model creation
class DiceModels {
    constructor(gl) {
        this.gl = gl;
        this.models = {};
        this.initializeModels();
    }

    initializeModels() {
        // Initialize basic cube model (D6)
        this.models.d6 = this.createCubeModel();
        // TODO: Add other dice models (D4, D8, D10, D12, D20)
    }

    createCubeModel() {
        const vertices = [
            // Front face
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            // Back face
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            // Top face
            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            // Bottom face
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            // Right face
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,
        ];

        const normals = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ];

        const texCoords = [
            // Front face (1: [0, 0.5] to [1/3, 1])
            0.0, 0.5,
            1.0 / 3, 0.5,
            1.0 / 3, 1.0,
            0.0, 1.0,
            // Back face (6: [2/3, 0] to [1, 0.5])
            2.0 / 3, 0.0,
            2.0 / 3, 0.5,
            1.0, 0.5,
            1.0, 0.0,
            // Top face (2: [1/3, 0.5] to [2/3, 1])
            1.0 / 3, 0.5,
            1.0 / 3, 1.0,
            2.0 / 3, 1.0,
            2.0 / 3, 0.5,
            // Bottom face (5: [1/3, 0] to [2/3, 0.5])
            1.0 / 3, 0.0,
            2.0 / 3, 0.0,
            2.0 / 3, 0.5,
            1.0 / 3, 0.5,
            // Right face (3: [2/3, 0.5] to [1, 1])
            2.0 / 3, 0.5,
            2.0 / 3, 1.0,
            1.0, 1.0,
            1.0, 0.5,
            // Left face (4: [0, 0] to [1/3, 0.5])
            0.0, 0.0,
            1.0 / 3, 0.0,
            1.0 / 3, 0.5,
            0.0, 0.5,
        ];

        const indices = [
            0, 1, 2, 0, 2, 3,  // Front
            4, 5, 6, 4, 6, 7,  // Back
            8, 9, 10, 8, 10, 11, // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19, // Right
            20, 21, 22, 20, 22, 23  // Left
        ];

        // Create and bind vertex buffer
        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        // Create and bind normal buffer
        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        // Create and bind texture coordinate buffer
        const texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);

        // Create and bind index buffer
        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        return {
            vertexBuffer,
            normalBuffer,
            texCoordBuffer,
            indexBuffer,
            numIndices: indices.length
        };
    }

    getModel(type) {
        return this.models[type];
    }
}