// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    const canvas = document.getElementById('gl-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Initialize WebGL context
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('Failed to initialize WebGL');
        document.getElementById('webgl-error').style.display = 'block';
        return;
    }

    console.log('WebGL initialized successfully');
    console.log('WebGL version:', gl instanceof WebGL2RenderingContext ? 2.0 : 1.0);
    console.log('Vendor:', gl.getParameter(gl.VENDOR));
    console.log('Renderer:', gl.getParameter(gl.RENDERER));

    // Set up the camera (using MV.js for matrix operations)
    const camera = {
        viewMatrix: mat4(),
        projectionMatrix: mat4()
    };
    lookAt(camera.viewMatrix, [0, 5, 5], [0, 0, 0], [0, 1, 0]); // Camera at (0,5,5), looking at origin
    perspective(camera.projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

    // Initialize shaders using initShaders2.js
    const shaderProgram = initShaders(gl, 'vertex-shader', 'fragment-shader');
    if (!shaderProgram) {
        console.error('Failed to initialize shaders');
        return;
    }

    // Create the DiceRoller instance
    const diceRoller = new DiceRoller(gl, camera, shaderProgram);

    // Set up event listeners for buttons
    document.getElementById('add-dice-btn').addEventListener('click', () => {
        diceRoller.addDice('d6'); // Add a d6 dice
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        diceRoller.clearDice();
    });

    // Add event listeners for other dice types
    const diceButtons = document.querySelectorAll('.dice-btn');
    diceButtons.forEach(button => {
        button.addEventListener('click', () => {
            diceButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Roll button (if needed)
    document.getElementById('roll-btn').addEventListener('click', () => {
        diceRoller.rollAllDice();
    });
});