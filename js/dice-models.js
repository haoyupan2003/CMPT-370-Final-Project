// dice-models.js
class DiceModels {
    constructor(gl) {
        this.gl = gl;
        this.models = {};
        this.initializeModels();
    }

    initializeModels() {
        this.models.d4 = this.createTetrahedronModel();
        this.models.d6 = this.createCubeModel();
        this.models.d8 = this.createOctahedronModel();
        this.models.d10 = this.createD10Model();
        this.models.d12 = this.createDodecahedronModel();
        this.models.d20 = this.createIcosahedronModel();
    }

    createTetrahedronModel() {
        const vertices = [
            0.0, 0.0, 1.0,
            0.0, 0.943, -0.333,
            -0.816, -0.471, -0.333,
            0.816, -0.471, -0.333
        ];

        const normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            -0.816, -0.471, -0.333,
            -0.816, -0.471, -0.333,
            -0.816, -0.471, -0.333,
            0.816, -0.471, -0.333,
            0.816, -0.471, -0.333,
            0.816, -0.471, -0.333,
            0.0, 0.943, -0.333,
            0.0, 0.943, -0.333,
            0.0, 0.943, -0.333
        ];

        const texCoords = [
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0
        ];

        const indices = [
            0, 1, 2,
            0, 2, 3,
            0, 3, 1,
            1, 3, 2
        ];

        // Face normals (one per face, in the same order as indices)
        const faceNormals = [
            [0.0, 0.0, 1.0],        // Face 0 (value 1)
            [-0.816, -0.471, -0.333], // Face 1 (value 2)
            [0.816, -0.471, -0.333],  // Face 2 (value 3)
            [0.0, 0.943, -0.333]     // Face 3 (value 4)
        ];

        // Face values (1 to 4 for D4)
        const faceValues = [1, 2, 3, 4];

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createCubeModel() {
        const vertices = [
            -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
            -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
        ];

        const normals = [
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        ];

        const texCoords = [
            0.0, 0.5, 1.0 / 3, 0.5, 1.0 / 3, 1.0, 0.0, 1.0,
            2.0 / 3, 0.0, 2.0 / 3, 0.5, 1.0, 0.5, 1.0, 0.0,
            1.0 / 3, 0.5, 1.0 / 3, 1.0, 2.0 / 3, 1.0, 2.0 / 3, 0.5,
            1.0 / 3, 0.0, 2.0 / 3, 0.0, 2.0 / 3, 0.5, 1.0 / 3, 0.5,
            2.0 / 3, 0.5, 2.0 / 3, 1.0, 1.0, 1.0, 1.0, 0.5,
            0.0, 0.0, 1.0 / 3, 0.0, 1.0 / 3, 0.5, 0.0, 0.5,
        ];

        const indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23
        ];

        // Face normals (one per face)
        const faceNormals = [
            [0.0, 0.0, 1.0],   // Front (value 1)
            [0.0, 0.0, -1.0],  // Back (value 6)
            [0.0, 1.0, 0.0],   // Top (value 2)
            [0.0, -1.0, 0.0],  // Bottom (value 5)
            [1.0, 0.0, 0.0],   // Right (value 3)
            [-1.0, 0.0, 0.0]   // Left (value 4)
        ];

        // Face values (1 to 6 for D6)
        const faceValues = [1, 6, 2, 5, 3, 4];

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createOctahedronModel() {
        const vertices = [
            0.0, 0.0, 1.0,
            0.0, 0.0, -1.0,
            -1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, 1.0, 0.0
        ];

        const normals = [
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
        ];

        const texCoords = [
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
            0.5, 1.0, 0.0, 0.0, 1.0, 0.0
        ];

        const indices = [
            0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2,
            1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2
        ];

        const faceNormals = [
            [0.577, -0.577, 0.577],  // Face 0 (value 1)
            [0.577, -0.577, 0.577],  // Face 1 (value 2)
            [0.577, 0.577, 0.577],   // Face 2 (value 3)
            [0.577, 0.577, 0.577],   // Face 3 (value 4)
            [-0.577, 0.577, -0.577], // Face 4 (value 5)
            [-0.577, 0.577, -0.577], // Face 5 (value 6)
            [-0.577, -0.577, -0.577],// Face 6 (value 7)
            [-0.577, -0.577, -0.577] // Face 7 (value 8)
        ];

        const faceValues = [1, 2, 3, 4, 5, 6, 7, 8];

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createD10Model() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const a = 0.5;
        const b = 0.5 / phi;
        const c = 0.5 * phi;

        const vertices = [
            0.0, 0.0, a, 0.0, 0.0, -a,
            b, b, c, -b, b, c,
            b, -b, c, -b, -b, c,
            c, b, -b, -c, b, -b,
            c, -b, -b, -c, -b, -b,
            b, c, b, -b, c, b
        ];

        const normals = new Array(vertices.length).fill(0.0); // Simplified
        const texCoords = new Array(vertices.length / 3 * 2).fill(0.5); // Simplified
        const indices = [
            0, 2, 4, 0, 4, 5, 0, 5, 3, 0, 3, 2,
            0, 10, 2, 0, 2, 6, 0, 6, 8, 0, 8, 4,
            0, 4, 10, 0, 11, 5, 0, 5, 9, 0, 9, 7,
            0, 7, 3, 0, 3, 11, 1, 2, 10, 1, 10, 6,
            1, 6, 8, 1, 8, 4, 1, 4, 2, 1, 5, 11,
            1, 11, 7, 1, 7, 9, 1, 9, 5, 1, 3, 2
        ];

        const faceNormals = new Array(10).fill([0, 0, 1]); // Simplified
        const faceValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createDodecahedronModel() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const a = 0.5;
        const b = 0.5 / phi;
        const c = 0.5 * phi;

        const vertices = [
            a, a, a, a, a, -a, a, -a, a, a, -a, -a,
            -a, a, a, -a, a, -a, -a, -a, a, -a, -a, -a,
            b, c, 0, -b, c, 0, b, -c, 0, -b, -c, 0,
            0, b, c, 0, -b, c, 0, b, -c, 0, -b, -c,
            c, 0, b, -c, 0, b, c, 0, -b, -c, 0, -b
        ];

        const normals = new Array(vertices.length).fill(0.0); // Simplified
        const texCoords = new Array(vertices.length / 3 * 2).fill(0.5); // Simplified
        const indices = [
            0, 8, 12, 16, 2, 0, 2, 10, 13, 12,
            2, 16, 18, 3, 10, 3, 18, 14, 1, 8,
            1, 14, 15, 5, 9, 5, 15, 19, 7, 11,
            7, 19, 17, 4, 9, 4, 17, 13, 0, 8,
            12, 13, 17, 19, 15, 16, 12, 15, 14, 18,
            9, 4, 5, 11, 7, 10, 3, 1, 8, 0
        ];

        const faceNormals = new Array(12).fill([0, 0, 1]); // Simplified
        const faceValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createIcosahedronModel() {
        const phi = (1 + Math.sqrt(5)) / 2;
        const a = 0.5;
        const b = 0.5 * phi;

        const vertices = [
            0.0, a, b, 0.0, a, -b, 0.0, -a, b, 0.0, -a, -b,
            a, b, 0.0, a, -b, 0.0, -a, b, 0.0, -a, -b, 0.0,
            b, 0.0, a, b, 0.0, -a, -b, 0.0, a, -b, 0.0, -a
        ];

        const normals = new Array(vertices.length).fill(0.0); // Simplified
        const texCoords = new Array(vertices.length / 3 * 2).fill(0.5); // Simplified
        const indices = [
            0, 4, 8, 0, 8, 10, 0, 10, 6, 0, 6, 4, 0, 1, 4,
            1, 9, 4, 1, 5, 9, 1, 3, 5, 1, 6, 3, 1, 0, 6,
            2, 8, 5, 2, 5, 7, 2, 7, 11, 2, 11, 10, 2, 10, 8,
            3, 7, 5, 3, 11, 7, 3, 9, 11, 3, 6, 9, 3, 2, 6
        ];

        const faceNormals = new Array(20).fill([0, 0, 1]); // Simplified
        const faceValues = Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 20

        return this.createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues);
    }

    createModelBuffers(vertices, normals, texCoords, indices, faceNormals, faceValues) {
        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);

        const texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        return {
            vertices,
            normals,
            texCoords,
            indices,
            vertexBuffer,
            normalBuffer,
            texCoordBuffer,
            indexBuffer,
            numIndices: indices.length,
            faceNormals,
            faceValues
        };
    }

    getModel(type) {
        return this.models[type];
    }
}