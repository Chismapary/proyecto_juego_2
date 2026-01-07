var Pacman = {
    x: 9,
    z: 16,
    targetX: 9,
    targetZ: 16,
    yOffset: 0,
    yVelocity: 0,
    isJumping: false,
    gravity: 0.01,
    jumpVelocity: 0.2,
    jumpClearance: 0.18,
    direction: 0,
    speed: 0.08,
    mouthAngle: 0,
    mouthOpening: true,
    moveQueue: [],
    
    reset: function() {
        this.x = 9;
        this.z = 16;
        this.targetX = 9;
        this.targetZ = 16;
        this.yOffset = 0;
        this.yVelocity = 0;
        this.isJumping = false;
        this.direction = 0;
        this.moveQueue = [];
    },

    jump: function() {
        if (gameState.gameOver || gameState.paused) return;
        if (this.isJumping) return;
        this.isJumping = true;
        this.yVelocity = this.jumpVelocity;
    },
    
    queueMove: function(direction) {
        if (this.moveQueue.length < 2) {
            this.moveQueue.push(direction);
        }
    },
    
    update: function() {
        if (gameState.gameOver || gameState.paused) return;

        if (this.isJumping) {
            this.yVelocity -= this.gravity;
            this.yOffset += this.yVelocity;

            if (this.yOffset <= 0) {
                this.yOffset = 0;
                this.yVelocity = 0;
                this.isJumping = false;
            }
        }
        
        var atTarget = Math.abs(this.x - this.targetX) < 0.01 && Math.abs(this.z - this.targetZ) < 0.01;
        
        if (atTarget && this.moveQueue.length > 0) {
            var direction = this.moveQueue.shift();
            var newTargetX = Math.round(this.x);
            var newTargetZ = Math.round(this.z);
            var newDirection = this.direction;
            
            switch(direction) {
                case 'up':
                    newTargetZ = Math.round(this.z) - 1;
                    newDirection = 0;
                    break;
                case 'down':
                    newTargetZ = Math.round(this.z) + 1;
                    newDirection = Math.PI;
                    break;
                case 'left':
                    newTargetX = Math.round(this.x) - 1;
                    newDirection = Math.PI / 2;
                    break;
                case 'right':
                    newTargetX = Math.round(this.x) + 1;
                    newDirection = -Math.PI / 2;
                    break;
            }
            
            if (!Escenario.isWall(newTargetX, newTargetZ)) {
                this.targetX = newTargetX;
                this.targetZ = newTargetZ;
                this.direction = newDirection;
            }
        }
        
        var dx = this.targetX - this.x;
        var dz = this.targetZ - this.z;
        var distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.01) {
            var moveX = (dx / distance) * this.speed;
            var moveZ = (dz / distance) * this.speed;
            
            if (Math.abs(moveX) > Math.abs(dx)) moveX = dx;
            if (Math.abs(moveZ) > Math.abs(dz)) moveZ = dz;
            
            this.x += moveX;
            this.z += moveZ;
        } else {
            this.x = this.targetX;
            this.z = this.targetZ;
        }
        
        this.checkTunnel();
        
        if (this.mouthOpening) {
            this.mouthAngle += 0.05;
            if (this.mouthAngle > 0.5) this.mouthOpening = false;
        } else {
            this.mouthAngle -= 0.05;
            if (this.mouthAngle < 0) this.mouthOpening = true;
        }
        
        var gridX = Math.round(this.x);
        var gridZ = Math.round(this.z);
        
        if (Escenario.dots[gridZ] && Escenario.dots[gridZ][gridX]) {
            Escenario.dots[gridZ][gridX] = false;
            gameState.score += 10;
            updateUI();

            if (Escenario.isLevelComplete && Escenario.isLevelComplete()) {
                nextLevel();
            }
        }
        
        for (var i = 0; i < Escenario.powerPellets.length; i++) {
            var pellet = Escenario.powerPellets[i];
            if (pellet.active && Math.abs(this.x - pellet.x) < 0.5 && Math.abs(this.z - pellet.z) < 0.5) {
                pellet.active = false;
                gameState.score += 50;
                updateUI();
                Fantasmas.setScaredMode(5000);

                if (Escenario.isLevelComplete && Escenario.isLevelComplete()) {
                    nextLevel();
                }
            }
        }
    },
    
    checkTunnel: function() {
        var mazeWidth = 19;
        var tunnelRow = 10;
        
        if (Math.round(this.z) === tunnelRow) {
            if (this.x < -0.5) {
                this.x = mazeWidth - 1;
                this.targetX = mazeWidth - 1;
            } else if (this.x > mazeWidth - 0.5) {
                this.x = 0;
                this.targetX = 0;
            }
        }
    },
    
    draw: function() {
        var modelMatrix = mat4.create();
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, [this.x * 2, 0.5 + this.yOffset, this.z * 2]);
        mat4.rotateY(modelMatrix, modelMatrix, this.direction);
        mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 0.4]);
        
        gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
        drawModel(exampleSphere, [1.0, 1.0, 0.0], true);
    }
};
