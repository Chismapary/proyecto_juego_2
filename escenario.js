var Escenario = {
    maze: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
        [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1],
        [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1],
        [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
        [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    baseMaze: null,
    
    dots: [],
    totalDots: 0,
    powerPellets: [],
    powerPelletPositions: [
        {x: 1, z: 1},
        {x: 17, z: 1},
        {x: 1, z: 20},
        {x: 17, z: 20}
    ],

    cloneMaze: function(maze) {
        var out = [];
        for (var z = 0; z < maze.length; z++) {
            out[z] = maze[z].slice();
        }
        return out;
    },

    isReservedCell: function(x, z) {
        if ((x === 9 && z === 16) || (x === 9 && z === 15) || (x === 9 && z === 17)) return true;
        if ((x === 9 && z === 9) || (x === 8 && z === 10) || (x === 10 && z === 10) || (x === 9 && z === 11)) return true;
        for (var i = 0; i < this.powerPelletPositions.length; i++) {
            if (this.powerPelletPositions[i].x === x && this.powerPelletPositions[i].z === z) return true;
        }
        if (z === 10 && (x <= 1 || x >= 17)) return true;
        return false;
    },

    ensureConnectivity: function(maze) {
        var rows = maze.length;
        var cols = maze[0].length;
        var start = { x: 9, z: 16 };
        if (start.z < 0 || start.z >= rows || start.x < 0 || start.x >= cols) return false;
        if (maze[start.z][start.x] === 1) return false;

        var visited = [];
        for (var z = 0; z < rows; z++) {
            visited[z] = [];
            for (var x = 0; x < cols; x++) visited[z][x] = false;
        }

        var queue = [start];
        visited[start.z][start.x] = true;
        var head = 0;

        while (head < queue.length) {
            var cur = queue[head++];
            var neigh = [
                { x: cur.x + 1, z: cur.z },
                { x: cur.x - 1, z: cur.z },
                { x: cur.x, z: cur.z + 1 },
                { x: cur.x, z: cur.z - 1 }
            ];

            for (var i = 0; i < neigh.length; i++) {
                var nx = neigh[i].x;
                var nz = neigh[i].z;
                if (nz < 0 || nz >= rows || nx < 0 || nx >= cols) continue;
                if (visited[nz][nx]) continue;
                if (maze[nz][nx] === 1) continue;
                visited[nz][nx] = true;
                queue.push({ x: nx, z: nz });
            }
        }

        var mustReach = [
            { x: 9, z: 9 },
            { x: 8, z: 10 },
            { x: 10, z: 10 },
            { x: 9, z: 11 }
        ];

        for (var j = 0; j < mustReach.length; j++) {
            var m = mustReach[j];
            if (!visited[m.z] || !visited[m.z][m.x]) return false;
        }

        return true;
    },

    generateMazeForLevel: function(level) {
        if (!this.baseMaze) {
            this.baseMaze = this.cloneMaze(this.maze);
        }

        if (!level || level <= 1) {
            this.maze = this.cloneMaze(this.baseMaze);
            return;
        }

        var rows = this.baseMaze.length;
        var cols = this.baseMaze[0].length;
        var maxAttempts = 25;
        var attempt = 0;
        var pWall = Math.min(0.32, 0.18 + level * 0.02);
        var pOpen = Math.min(0.10, 0.04 + level * 0.005);

        while (attempt < maxAttempts) {
            var m = this.cloneMaze(this.baseMaze);

            for (var z = 0; z < rows; z++) {
                for (var x = 0; x < cols; x++) {
                    if (x === 0 || z === 0 || x === cols - 1 || z === rows - 1) {
                        continue;
                    }
                    if (this.isReservedCell(x, z)) {
                        m[z][x] = 0;
                        continue;
                    }

                    if (m[z][x] === 1) {
                        if (Math.random() < pOpen) m[z][x] = 0;
                    } else {
                        if (Math.random() < pWall) m[z][x] = 1;
                    }
                }
            }

            for (var i = 0; i < this.powerPelletPositions.length; i++) {
                var pp = this.powerPelletPositions[i];
                if (m[pp.z] && typeof m[pp.z][pp.x] !== 'undefined') m[pp.z][pp.x] = 0;
            }

            var tunnelRow = 10;
            if (m[tunnelRow]) {
                m[tunnelRow][0] = 0;
                m[tunnelRow][1] = 0;
                m[tunnelRow][cols - 1] = 0;
                m[tunnelRow][cols - 2] = 0;
            }

            m[16][9] = 0;
            m[9][9] = 0;
            m[10][8] = 0;
            m[10][10] = 0;
            m[11][9] = 0;

            if (this.ensureConnectivity(m)) {
                this.maze = m;
                return;
            }

            attempt++;
        }

        this.maze = this.cloneMaze(this.baseMaze);
    },
     
    init: function(level) {
        this.dots = [];
        this.totalDots = 0;

        var lvl = level || 1;
        this.generateMazeForLevel(lvl);
        var dotProbability = 0.0;
        if (lvl <= 1) {
            dotProbability = 1.0;
        } else {
            dotProbability = Math.max(0.35, 0.85 - (lvl - 1) * 0.05);
        }

        for (var i = 0; i < this.maze.length; i++) {
            this.dots[i] = [];
            for (var j = 0; j < this.maze[i].length; j++) {
                if (this.maze[i][j] === 1) {
                    this.dots[i][j] = false;
                    continue;
                }

                var placeDot = (lvl <= 1) ? (this.maze[i][j] === 2) : (Math.random() < dotProbability);
                this.dots[i][j] = placeDot;
                if (placeDot) this.totalDots++;
            }
        }

        if (lvl > 1) {
            var attempts = 0;
            while (this.totalDots < 10 && attempts < 500) {
                var rz = Math.floor(Math.random() * this.maze.length);
                var rx = Math.floor(Math.random() * this.maze[0].length);
                if (this.maze[rz][rx] !== 1 && !this.dots[rz][rx]) {
                    this.dots[rz][rx] = true;
                    this.totalDots++;
                }
                attempts++;
            }
        }

        if (typeof Pacman !== 'undefined') {
            var pz = Math.round(Pacman.z);
            var px = Math.round(Pacman.x);
            if (this.dots[pz] && this.dots[pz][px]) {
                this.dots[pz][px] = false;
                this.totalDots = Math.max(0, this.totalDots - 1);
            }
        }
         
        this.powerPellets = [];
        for (var i = 0; i < this.powerPelletPositions.length; i++) {
            this.powerPellets.push({
                x: this.powerPelletPositions[i].x,
                z: this.powerPelletPositions[i].z,
                active: true
            });
        }
    },

    isLevelComplete: function() {
        for (var i = 0; i < this.dots.length; i++) {
            for (var j = 0; j < this.dots[i].length; j++) {
                if (this.dots[i][j]) return false;
            }
        }

        for (var k = 0; k < this.powerPellets.length; k++) {
            if (this.powerPellets[k].active) return false;
        }

        return true;
    },
    
    isWall: function(x, z) {
        var gridX = Math.round(x);
        var gridZ = Math.round(z);
        
        var tunnelRow = 10;
        if (gridZ === tunnelRow && (gridX < 0 || gridX >= this.maze[0].length)) {
            return false;
        }
        
        if (gridZ < 0 || gridZ >= this.maze.length || gridX < 0 || gridX >= this.maze[0].length) {
            return true;
        }
        
        return this.maze[gridZ][gridX] === 1;
    },
    
    drawFloor: function() {
        var mazeWidth = this.maze[0].length * 2;
        var mazeHeight = this.maze.length * 2;
        var centerX = mazeWidth / 2;
        var centerZ = mazeHeight / 2;
        
        var modelMatrix = mat4.create();
        mat4.identity(modelMatrix);
        mat4.translate(modelMatrix, modelMatrix, [centerX, -0.5, centerZ]);
        mat4.scale(modelMatrix, modelMatrix, [mazeWidth * 1.2, 0.1, mazeHeight * 1.2]);
        
        gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
        drawModel(exampleCube, [0.15, 0.15, 0.15], true);
    },
    
    drawWalls: function() {
        for (var i = 0; i < this.maze.length; i++) {
            for (var j = 0; j < this.maze[i].length; j++) {
                if (this.maze[i][j] === 1) {
                    var modelMatrix = mat4.create();
                    mat4.identity(modelMatrix);
                    mat4.translate(modelMatrix, modelMatrix, [j * 2, 0.8, i * 2]);
                    mat4.scale(modelMatrix, modelMatrix, [2, 1, 2]);
                    
                    gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
                    drawModel(exampleCube, [0.0, 0.2, 0.8], true);
                }
            }
        }
    },
    
    drawDots: function() {
        for (var i = 0; i < this.dots.length; i++) {
            for (var j = 0; j < this.dots[i].length; j++) {
                if (this.dots[i][j]) {
                    var modelMatrix = mat4.create();
                    mat4.identity(modelMatrix);
                    mat4.translate(modelMatrix, modelMatrix, [j * 2, 0.3, i * 2]);
                    mat4.scale(modelMatrix, modelMatrix, [0.15, 0.15, 0.15]);
                    
                    gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
                    drawModel(exampleSphere, [1.0, 1.0, 1.0], true);
                }
            }
        }
    },
    
    drawPowerPellets: function() {
        var time = Date.now() * 0.003;
        for (var i = 0; i < this.powerPellets.length; i++) {
            if (this.powerPellets[i].active) {
                var pellet = this.powerPellets[i];
                var modelMatrix = mat4.create();
                mat4.identity(modelMatrix);
                mat4.translate(modelMatrix, modelMatrix, [pellet.x * 2, 0.3, pellet.z * 2]);
                var scale = 0.55 + Math.sin(time + i) * 0.05;
                mat4.scale(modelMatrix, modelMatrix, [scale, scale, scale]);
                
                gl.uniformMatrix4fv(program.modelMatrixIndex, false, modelMatrix);
                drawModel(exampleSphere, [1.0, 0.8, 0.3], true);
            }
        }
    },
    
    draw: function() {
        this.drawFloor();
        this.drawWalls();
        this.drawDots();
        this.drawPowerPellets();
    }
};
