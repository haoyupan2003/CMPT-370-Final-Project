function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    // Create and compile vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Check vertex shader compilation
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        gl.deleteShader(vertexShader);
        console.error('Vertex shader compilation error:', error);
        throw new Error('Vertex shader compilation failed: ' + error);
    }

    // Create and compile fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Check fragment shader compilation
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        console.error('Fragment shader compilation error:', error);
        throw new Error('Fragment shader compilation failed: ' + error);
    }

    // Create shader program and link shaders
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check program linking
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        console.error('Shader program linking error:', error);
        throw new Error('Shader program linking failed: ' + error);
    }

    // Clean up individual shaders as they're now linked into the program
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}