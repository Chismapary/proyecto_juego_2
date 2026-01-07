var Fantasmas = {
    lista: [
        { x: 9, z: 9, targetX: 9, targetZ: 9, color: [1.0, 0.0, 0.0], originalColor: [1.0, 0.0, 0.0], speed: 0.03, originalSpeed: 0.03, name: 'Blinky', eaten: false },
        { x: 8, z: 10, targetX: 8, targetZ: 10, color: [1.0, 0.5, 0.8], originalColor: [1.0, 0.5, 0.8], speed: 0.025, originalSpeed: 0.025, name: 'Pinky', eaten: false },
        { x: 10, z: 10, targetX: 10, targetZ: 10, color: [0.0, 1.0, 1.0], originalColor: [0.0, 1.0, 1.0], speed: 0.028, originalSpeed: 0.028, name: 'Inky', eaten: false },
        { x: 9, z: 11, targetX: 9, targetZ: 11, color: [1.0, 0.6, 0.0], originalColor: [1.0, 0.6, 0.0], speed: 0.027, originalSpeed: 0.027, name: 'Clyde', eaten: false }
    ],
    scared: false,
    scaredTimer: 0,
    
    reset: function() {
        this.lista[0].x = 9; this.lista[0].z = 9;
        this.lista[1].x = 8; this.lista[1].z = 10;
        this.lista[2].x = 10; this.lista[2].z = 10;
        this.lista[3].x = 9; this.lista[3].z = 11;
        
        for (var i = 0; i < this.lista.length; i++) {
            this.lista[i].targetX = this.lista[i].x;
            this.lista[i].targetZ = this.lista[i].z;
            this.lista[i].eaten = false;
        }
    },
    
    setScaredMode: function(duration) {
        this.scared = true;
        this.scaredTimer = duration;
        
        for (var i = 0; i < this.lista.length; i++) {
            if (!this.lista[i].eaten) {
                this.lista[i].color = [0.2, 0.2, 0.8];
                this.lista[i].speed = this.lista[i].originalSpeed * 0.5;
            }
        }
    },
    
    resetSpeeds: function() {
        this.lista[0].speed = 0.03;
        this.lista[1].speed = 0.025;
        this.lista[2].speed = 0.028;
        this.lista[3].speed = 0.027;
    },
    
    increaseSpeeds: function() {
        for (var i = 0; i < this.lista.length; i++) {
            this.lista[i].speed += 0.005;
        }
    },
    
    update: function() {
        if (this.scared) {
            this.scaredTimer -= 16;
            if (this.scaredTimer <= 0) {
                this.scared = false;
                for (var i = 0; i < this.lista.length; i++) {
                    if (!this.lista[i].eaten) {
                        this.lista[i].color = this.lista[i].originalColor;
                        this.lista[i].speed = this.lista[i].originalSpeed;
                    }
                }
            }
        }
        
        for (var i = 0; i < this.lista.length; i++) {
            var ghost = this.lista[i];
            
            var dx = ghost.targetX - ghost.x;
            var dz = ghost.targetZ - ghost.z;
            var distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 0.1) {
                var possibleMoves = [];
                var directions = [
                    { x: 0, z: -1 },
                    { x: 0, z: 1 },
                    { x: -1, z: 0 },
                    { x: 1, z: 0 }
                ];
                
                for (var j = 0; j < directions.length; j++) {
                    var newX = Math.round(ghost.x) + directions[j].x;
                    var newZ = Math.round(ghost.z) + directions[j].z;
                    
                    if (!Escenario.isWall(newX, newZ)) {
                        var distToPacman = Math.sqrt(
                            Math.pow(newX - Pacman.x, 2) + 
                            Math.pow(newZ - Pacman.z, 2)
                        );
                        possibleMoves.push({ x: newX, z: newZ, dist: distToPacman });
                    }
                }
                
                if (possibleMoves.length > 0) {
                    if (Math.random() < 0.7) {
                        possibleMoves.sort(function(a, b) { return a.dist - b.dist; });
                        var move = possibleMoves[0];
                    } else {
                        var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    }
                    
                    ghost.targetX = move.x;
                    ghost.targetZ = move.z;
                }
            }
            
            var dx = ghost.targetX - ghost.x;
            var dz = ghost.targetZ - ghost.z;
            var distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance > 0.01) {
                var moveX = (dx / distance) * ghost.speed;
                var moveZ = (dz / distance) * ghost.speed;
                
                if (Math.abs(moveX) > Math.abs(dx)) moveX = dx;
                if (Math.abs(moveZ) > Math.abs(dz)) moveZ = dz;
                
                ghost.x += moveX;
                ghost.z += moveZ;
            }
            
            this.checkTunnel(ghost);
            
            var distToPacman = Math.sqrt(
                Math.pow(ghost.x - Pacman.x, 2) + 
                Math.pow(ghost.z - Pacman.z, 2)
            );
            
            if (distToPacman < 0.5) {
                // Si Pacman está saltando lo suficientemente alto, puede pasar sobre fantasmas.
                if (Pacman.isJumping && Pacman.yOffset > (Pacman.jumpClearance || 0)) {
                    continue;
                }
                if (this.scared && !ghost.eaten) {
                    ghost.eaten = true;
                    ghost.x = 9;
                    ghost.z = 10;
                    ghost.targetX = 9;
                    ghost.targetZ = 10;
                    ghost.color = ghost.originalColor;
                    ghost.speed = ghost.originalSpeed;
                    gameState.score += 200;
                    updateUI();
                } else if (!ghost.eaten) {
                    loseLife();
                }
            }
            
            if (ghost.eaten && !this.scared) {
                ghost.eaten = false;
            }
        }
    },
    
    checkTunnel: function(ghost) {
        var mazeWidth = 19;
        var tunnelRow = 10;
        
        if (Math.round(ghost.z) === tunnelRow) {
            if (ghost.x < -0.5) {
                ghost.x = mazeWidth - 1;
                ghost.targetX = mazeWidth - 1;
            } else if (ghost.x > mazeWidth - 0.5) {
                ghost.x = 0;
                ghost.targetX = 0;
            }
        }
    },
    
    draw: function() {
        for (var i = 0; i < this.lista.length; i++) {
            var ghost = this.lista[i];
            
            var modelMatrix = mat4.create();
            mat4.identity(modelMatrix);
            mat4.translate(modelMatrix, modelMatrix, [ghost.x * 2, 0.5, ghost.z * 2]);
            mat4.scale(modelMatrix, modelMatrix, [0.35, 0.45, 0.35]);
            
            gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
            drawModel(exampleSphere, ghost.color, true);
            
            var eyeMatrix = mat4.create();
            mat4.identity(eyeMatrix);
            mat4.translate(eyeMatrix, eyeMatrix, [ghost.x * 2 - 0.15, 0.65, ghost.z * 2 + 0.25]);
            mat4.scale(eyeMatrix, eyeMatrix, [0.08, 0.08, 0.08]);
            gl.uniformMatrix4fv(program.modelMatrixIndex, false, eyeMatrix);
            drawModel(exampleSphere, [1.0, 1.0, 1.0], true);
            
            mat4.identity(eyeMatrix);
            mat4.translate(eyeMatrix, eyeMatrix, [ghost.x * 2 + 0.15, 0.65, ghost.z * 2 + 0.25]);
            mat4.scale(eyeMatrix, eyeMatrix, [0.08, 0.08, 0.08]);
            gl.uniformMatrix4fv(program.modelMatrixIndex, false, eyeMatrix);
            drawModel(exampleSphere, [1.0, 1.0, 1.0], true);
        }
    }
};
