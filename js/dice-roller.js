// dice-roller.js
class DiceRoller {
    constructor(gl, camera, shaderProgram) {
        this.gl = gl;
        this.camera = camera;
        this.shaderProgram = shaderProgram;
        this.physics = new Physics();
        this.textureManager = new TextureManager(gl);
        this.diceModels = new DiceModels(gl);
        this.dice = [];
        this.lastTime = 0;
        this.diceGeometries = {};

        this.initShaderProgram();
        this.initDiceGeometries();

        this.textureManager.loadDiceTextures().then(() => {
            console.log('Textures loaded successfully');
        }).catch(err => {
            console.error('Failed to load textures:', err);
        });

        this.animate(0);
    }

    initShaderProgram() {
        this.gl.useProgram(this.shaderProgram);

        this.shaderProgram.modelViewMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'modelViewMatrix');
        this.shaderProgram.projectionMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, 'projectionMatrix');
        this.shaderProgram.ambientProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'ambientProduct');
        this.shaderProgram.diffuseProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'diffuseProduct');
        this.shaderProgram.specularProductUniform = this.gl.getUniformLocation(this.shaderProgram, 'specularProduct');
        this.shaderProgram.shininessUniform = this.gl.getUniformLocation(this.shaderProgram, 'shininess');
        this.shaderProgram.lightPositionUniform = this.gl.getUniformLocation(this.shaderProgram, 'lightPosition');
        this.shaderProgram.textureUniform = this.gl.getUniformLocation(this.shaderProgram, 'texture');
        this.shaderProgram.useTextureUniform = this.gl.getUniformLocation(this.shaderProgram, 'useTexture');

        const lightPosition = vec4(0.0, 15.0, 0.0, 1.0); // Position light above the dice
        const ambientProduct = mult(vec4(0.2, 0.2, 0.2, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const diffuseProduct = mult(vec4(0.8, 0.8, 0.8, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const specularProduct = mult(vec4(0.5, 0.5, 0.5, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
        const shininess = 100.0;

        this.gl.uniform4fv(this.shaderProgram.lightPositionUniform, flatten(lightPosition));
        this.gl.uniform4fv(this.shaderProgram.ambientProductUniform, flatten(ambientProduct));
        this.gl.uniform4fv(this.shaderProgram.diffuseProductUniform, flatten(diffuseProduct));
        this.gl.uniform4fv(this.shaderProgram.specularProductUniform, flatten(specularProduct));
        this.gl.uniform1f(this.shaderProgram.shininessUniform, shininess);
        this.gl.uniform1i(this.shaderProgram.useTextureUniform, 1);
    }

    initDiceGeometries() {
        const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
        diceTypes.forEach(type => {
            const model = this.diceModels.getModel(type);
            if (!model) {
                console.warn(`Dice type ${type} not found, using D6 as fallback`);
                this.diceGeometries[type] = this.diceGeometries['d6'];
                return;
            }
            this.diceGeometries[type] = {
                vertexBuffer: model.vertexBuffer,
                normalBuffer: model.normalBuffer,
                texCoordBuffer: model.texCoordBuffer,
                indexBuffer: model.indexBuffer,
                numIndices: model.numIndices,
                faceNormals: model.faceNormals,
                faceValues: model.faceValues
            };
        });
    }

    addDice(type) {
        if (!this.diceGeometries[type]) {
            console.warn(`Dice type ${type} not supported, using D6 as fallback`);
            type = 'd6';
        }

        const dice = {
            type: type,
            position: [Math.random() * 6 - 3, 3, Math.random() * 6 - 3], // Spread dice over a larger area
            rotation: mat4(), // Use mat4() to create an identity matrix as initial rotation
            velocity: [0, 0, 0],
            angularVelocity: [0, 0, 0],
            size: 1.0,
            isRolling: false,
            result: null // Store the result (top face value)
        };

        this.dice.push(dice);
        console.log('Dice added:', dice);

        this.physics.roll(dice);
    }

    clearDice() {
        this.dice = [];
        console.log('All dice cleared');
        this.updateResultsDisplay();
    }

    rollAllDice() {
        this.dice.forEach(dice => {
            this.physics.roll(dice);
        });
    }

    getTopFace(dice) {
        const geometry = this.diceGeometries[dice.type];
        if (!geometry.faceNormals || !geometry.faceValues) {
            console.warn(`Face normals or values not defined for dice type ${dice.type}`);
            return null;
        }

        // Get the dice's rotation matrix
        const rotationMatrix = dice.rotation;

        // World up direction
        const worldUp = vec3(0, 1, 0);

        // Find the face normal most aligned with the world up direction
        let maxDot = -Infinity;
        let topFaceIndex = -1;

        geometry.faceNormals.forEach((normal, index) => {
            // Transform the face normal by the dice's rotation
            const transformedNormal = mult(rotationMatrix, vec4(normal[0], normal[1], normal[2], 0.0));
            const normalVec = normalize(vec3(transformedNormal[0], transformedNormal[1], transformedNormal[2]));

            // Compute dot product with world up
            const dotProduct = dot(normalVec, worldUp);
            if (dotProduct > maxDot) {
                maxDot = dotProduct;
                topFaceIndex = index;
            }
        });

        return geometry.faceValues[topFaceIndex];
    }

    updateResultsDisplay() {
        const resultsDisplay = document.getElementById('results-display');
        if (!resultsDisplay) {
            console.error('Results display element not found');
            return;
        }

        if (this.dice.length === 0) {
            resultsDisplay.innerHTML = 'No dice rolled yet.';
            return;
        }

        const results = this.dice.map((dice, index) => {
            if (!dice.isRolling && dice.result === null) {
                dice.result = this.getTopFace(dice);
            }
            return dice.result !== null
                ? `${dice.type.toUpperCase()} #${index + 1}: ${dice.result}`
                : `${dice.type.toUpperCase()} #${index + 1}: Rolling...`;
        });

        resultsDisplay.innerHTML = results.join('<br>');
    }

    animate(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        let allStopped = true;
        this.dice.forEach((dice, index) => {
            console.log(`Animating dice ${index}:`, dice);
            if (dice.isRolling) {
                try {
                    this.physics.update(dice, deltaTime);
                    console.log(`Updated dice ${index}:`, dice);
                    if (dice.velocity[0] === 0 && dice.velocity[1] === 0 && dice.velocity[2] === 0 &&
                        dice.angularVelocity[0] === 0 && dice.angularVelocity[1] === 0 && dice.angularVelocity[2] === 0) {
                        dice.isRolling = false;
                        console.log(`Dice ${index} stopped rolling`);
                    } else {
                        allStopped = false;
                    }
                } catch (error) {
                    console.error(`Error in physics update for dice ${index}:`, error);
                    dice.isRolling = false;
                }
            }

            try {
                // Create translation matrix
                const translationMatrix = translate(dice.position[0], dice.position[1], dice.position[2]);
                console.log(`Translation matrix for dice ${index}:`, translationMatrix);

                // Ensure dice.rotation is valid
                if (!dice.rotation || typeof dice.rotation.length !== 'number' || dice.rotation.length !== 16) {
                    console.warn(`Invalid rotation for dice ${index}, resetting to identity matrix`);
                    dice.rotation = mat4();
                }

                // Combine translation and rotation
                const modelMatrix = mult(translationMatrix, dice.rotation);
                console.log(`Model matrix for dice ${index}:`, modelMatrix);

                // Create model-view matrix
                const modelViewMatrix = mult(this.camera.viewMatrix, modelMatrix);
                console.log(`Model-view matrix for dice ${index}:`, modelViewMatrix);

                this.renderDice(dice, modelViewMatrix);
            } catch (error) {
                console.error(`Error in matrix operations for dice ${index}:`, error);
            }
        });

        // Update results display after each frame
        this.updateResultsDisplay();

        requestAnimationFrame((t) => this.animate(t));
    }

    renderDice(dice, modelViewMatrix) {
        this.gl.useProgram(this.shaderProgram);

        const geometry = this.diceGeometries[dice.type];

        const positionLoc = this.gl.getAttribLocation(this.shaderProgram, 'vPosition');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometry.vertexBuffer);
        this.gl.vertexAttribPointer(positionLoc, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLoc);

        const normalLoc = this.gl.getAttribLocation(this.shaderProgram, 'vNormal');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometry.normalBuffer);
        this.gl.vertexAttribPointer(normalLoc, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(normalLoc);

        const texCoordLoc = this.gl.getAttribLocation(this.shaderProgram, 'vTexCoord');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometry.texCoordBuffer);
        this.gl.vertexAttribPointer(texCoordLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(texCoordLoc);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);

        const textureBound = this.textureManager.bindTexture(dice.type);
        console.log('Texture bound:', textureBound);

        this.gl.uniformMatrix4fv(this.shaderProgram.modelViewMatrixUniform, false, flatten(modelViewMatrix));
        this.gl.uniformMatrix4fv(this.shaderProgram.projectionMatrixUniform, false, flatten(this.camera.projectionMatrix));
        this.gl.uniform1i(this.shaderProgram.useTextureUniform, 1);

        this.gl.drawElements(this.gl.TRIANGLES, geometry.numIndices, this.gl.UNSIGNED_SHORT, 0);
        console.log('Drawing dice with', geometry.numIndices, 'indices');

        const error = this.gl.getError();
        if (error !== this.gl.NO_ERROR) {
            console.error('WebGL error after drawElements:', error);
        }
    }
}