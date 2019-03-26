let cube = class {
    constructor(gl, pos,url) {
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        this.texture = loadTexture(gl, url);
        this.width = 0.3;
        this.depth = 0.3;
        this.height = 0.25;
        this.score = 0;
        this.lives = 3;
        this.life_dec = false;
        this.type = 0;
        this.maxdown_ground = 0.75;

        this.maxup = 4;
        this.speedy = 0.2;
        this.go_up = false;
        
        this.speedx = 0;
        this.dest_x = 0;
        this.present_x = 0;
        
        this.positions = [
             // Front face
             -this.width, -this.height, this.depth,
             this.width, -this.height, this.depth,
             this.width, this.height, this.depth,
             -this.width, this.height, this.depth,
             
             //Back Face
             -this.width, -this.height, -this.depth,
             this.width, -this.height, -this.depth,
             this.width, this.height, -this.depth,
             -this.width, this.height, -this.depth,
             
             //Top Face
             -this.width, this.height, -this.depth,
             this.width, this.height, -this.depth,
             this.width, this.height, this.depth,
             -this.width, this.height, this.depth,
             
             //Bottom Face
             -this.width, -this.height, -this.depth,
             this.width, -this.height, -this.depth,
             this.width, -this.height, this.depth,
             -this.width, -this.height, this.depth,
             
             //Left Face
             -this.width, -this.height, -this.depth,
             -this.width, this.height, -this.depth,
             -this.width, this.height, this.depth,
             -this.width, -this.height, this.depth,
             
             //Right Face
             this.width, -this.height, -this.depth,
             this.width, this.height, -this.depth,
             this.width, this.height, this.depth,
             this.width, -this.height, this.depth,
        ];

        this.rotation = 0;

        this.pos = pos;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);
        
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

          const textureCoordinates = [
            // Front
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            
            // Back
            0.0,  0.0,
            0.1,  0.0,
            0.1,  0.1,
            0.0,  0.1,

            0.0,  0.0,
            0.1,  0.0,
            0.1,  0.1,
            0.0,  0.1,

            0.0,  0.0,
            0.1,  0.0,
            0.1,  0.1,
            0.0,  0.1,

            0.0,  0.0,
            0.1,  0.0,
            0.1,  0.1,
            0.0,  0.1,

            0.0,  0.0,
            0.1,  0.0,
            0.1,  0.1,
            0.0,  0.1,
          ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);


        // Build the element array buffer; this specifies the indices
        // into the vertex arrays for each face's vertices.
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        // This array defines each face as two triangles, using the
        // indices into the vertex array to specify each triangle's
        // position.

        const indices = [
            0, 1, 2,    0, 2, 3, // front
            4, 5, 6,    4, 6, 7,
            8, 9, 10,   8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23, 
        ];

        // Now send the element array to GL

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);

        this.buffer = {
            position: this.positionBuffer,
            textureCoord: textureCoordBuffer,
            indices: indexBuffer,
        }

    }

    draw(gl, projectionMatrix, programInfo, deltaTime) {
        const modelViewMatrix = mat4.create();
        mat4.translate(
            modelViewMatrix,
            modelViewMatrix,
            this.pos
        );
        
        //this.rotation += Math.PI / (((Math.random()) % 100) + 50);

        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            this.rotation,
            [1, 1, 1]);

        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const num = 2; // every coordinate composed of 2 values
            const type = gl.FLOAT; // the data in the buffer is 32 bit float
            const normalize = false; // don't normalize
            const stride = 0; // how many bytes to get from one set to the next
            const offset = 0; // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.textureCoord);
            gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        }

        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
        {
            const vertexCount = 36;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
        }
    }

    move_forward(cam_speed){
        this.pos[2] -= cam_speed;
    }
    
    move_up(cam_speed){
        this.pos[1] += this.speedy;
        if(this.pos[1] >= this.maxup){
            this.pos[1] = this.maxup;
            this.go_up = false;
        }
    }
    
    apply_gravity(down_key){
        this.pos[1] -= this.speedy;
        var d = this.maxdown_ground;
        if(down_key == true) d = 0.5
        if(this.pos[1] <= d){
            this.pos[1] = d;
        }
    }
    
    move_left(){
        this.pos[0] += this.speedx;
        if(this.pos[0] <= this.dest_x){
            this.pos[0] = this.dest_x;
            this.speedx = 0;
        }
    }
    
    move_right(){
        this.pos[0] += this.speedx;
        if(this.pos[0] >= this.dest_x){
            this.pos[0] = this.dest_x;
            this.speedx = 0;
        }

    }
    bounding_box(){
        return {
            x :this.pos[0],
            y :this.pos[1],
            z :this.pos[2],
            width :this.width,
            height :this.height,
            depth :this.depth
        }
    }
};