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
        viewMatrix: lookAt(vec3(0, 10, 0), vec3(0, 0, 0), vec3(0, 0, -1)),
        projectionMatrix: perspective(45, canvas.width / canvas.height, 0.1, 100.0)
    };

    // Position camera directly above the dice, looking straight down
    const eye = vec3(0, 10, 0);  // Camera position (higher up, directly above)
    const at = vec3(0, 0, 0);    // Look at point (center of the scene)
    const up = vec3(0, 0, -1);   // Up vector (pointing towards -Z to maintain orientation)

    // Calculate view matrix
    camera.viewMatrix = lookAt(eye, at, up);
    camera.projectionMatrix = perspective(45, canvas.width / canvas.height, 0.1, 100.0);

    // Initialize shaders using createProgram from initShaders2.js
    const vertexShaderSource = document.getElementById('vertex-shader').text;
    const fragmentShaderSource = document.getElementById('fragment-shader').text;
    const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!shaderProgram) {
        console.error('Failed to initialize shaders');
        return;
    }

    // Create the DiceRoller instance
    const diceRoller = new DiceRoller(gl, camera, shaderProgram);

    // Set up event listeners for buttons
    document.getElementById('add-dice-btn').addEventListener('click', () => {
        const activeButton = document.querySelector('.dice-btn.active');
        const diceType = activeButton ? activeButton.id.split('-')[0].toLowerCase() : 'd6';
        diceRoller.addDice(diceType);
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        diceRoller.clearDice();
    });

    // Add event listeners for dice type selection buttons
    const diceButtons = document.querySelectorAll('.dice-btn');
    diceButtons.forEach(button => {
        button.addEventListener('click', () => {
            diceButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Roll button
    document.getElementById('roll-btn').addEventListener('click', () => {
        diceRoller.rollAllDice();
    });
});