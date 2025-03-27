// Texture loading and management
class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = {};
        this.loadingPromises = [];
    }

    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                
                // Flip image pixels into the bottom-to-top order that WebGL expects
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                
                // Load the image data into the texture
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,                // mipmap level
                    this.gl.RGBA,     // internal format
                    this.gl.RGBA,     // format
                    this.gl.UNSIGNED_BYTE, // type
                    image             // image data
                );
                
                // Generate mipmaps for better rendering at different distances
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                
                // Set texture parameters
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                
                resolve(texture);
            };
            
            image.onerror = () => {
                reject(new Error(`Failed to load texture at ${url}`));
            };
            
            image.src = url;
        });
    }

    async loadDiceTextures() {
        // Load textures for each type of dice
        const textureUrls = {
            'd4': 'textures/d4.png',
            'd6': 'textures/d6.png',
            'd8': 'textures/d8.png',
            'd10': 'textures/d10.png',
            'd12': 'textures/d12.png',
            'd20': 'textures/d20.png'
        };

        for (const [type, url] of Object.entries(textureUrls)) {
            try {
                this.loadingPromises.push(
                    this.loadTexture(url).then(texture => {
                        this.textures[type] = texture;
                    })
                );
            } catch (error) {
                console.error(`Failed to load texture for ${type}:`, error);
            }
        }

        // Wait for all textures to load
        return Promise.all(this.loadingPromises);
    }

    getTexture(type) {
        return this.textures[type];
    }

    bindTexture(type, textureUnit = 0) {
        const texture = this.getTexture(type);
        if (texture) {
            this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            return true;
        }
        return false;
    }
}