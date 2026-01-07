var gl, program;

var gameState = {
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    paused: false
};

function getWebGLContext() {
    var canvas = document.getElementById("myCanvas");
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (var i = 0; i < names.length; ++i) {
        try {
            return canvas.getContext(names[i]);
        } catch (e) {}
    }
    return null;
}

function initShaders() {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
    gl.compileShader(fragmentShader);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.modelMatrixIndex = gl.getUniformLocation(program, "modelMatrix");
    program.viewMatrixIndex = gl.getUniformLocation(program, "viewMatrix");
    program.projMatrixIndex = gl.getUniformLocation(program, "projectionMatrix");
    program.objectColorIndex = gl.getUniformLocation(program, "objectColor");
}

function initBuffers(model) {
    model.idBufferVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

    model.idBufferIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

function initRendering() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.lineWidth(2.0);
}

function initPrimitives() {
    initBuffers(exampleCube);
    initBuffers(exampleSphere);
}

function setupKeyboardHandlers() {
    document.addEventListener('keydown', function(e) {
        var key = e.key.toLowerCase();

        if (e.code === 'Space' || key === ' ') {
            e.preventDefault();
            Pacman.jump();
            return;
        }
        
        if (key === 'r') {
            restartGame();
            return;
        }
        
        var direction;
        
        if (Camara.mode === 'firstPerson') {
            var currentDir = Pacman.direction;
            var normalizedDir = currentDir;
            
            while (normalizedDir < 0) normalizedDir += 2 * Math.PI;
            while (normalizedDir >= 2 * Math.PI) normalizedDir -= 2 * Math.PI;
            
            var currentDirName = 'up';
            var minDiff = Math.PI;
            
            var directions = [
                { name: 'up', angle: 0 },
                { name: 'right', angle: -Math.PI / 2 },
                { name: 'down', angle: Math.PI },
                { name: 'left', angle: Math.PI / 2 }
            ];
            
            for (var i = 0; i < directions.length; i++) {
                var dirAngle = directions[i].angle;
                while (dirAngle < 0) dirAngle += 2 * Math.PI;
                var diff = Math.abs(normalizedDir - dirAngle);
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                
                if (diff < minDiff) {
                    minDiff = diff;
                    currentDirName = directions[i].name;
                }
            }
            
            if (key === 'w' || key === 'arrowup') {
                e.preventDefault();
                direction = currentDirName;
            } else if (key === 's' || key === 'arrowdown') {
                e.preventDefault();
                var opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
                direction = opposites[currentDirName];
            } else if (key === 'a' || key === 'arrowleft') {
                e.preventDefault();
                var leftTurns = { 'up': 'left', 'left': 'down', 'down': 'right', 'right': 'up' };
                direction = leftTurns[currentDirName];
            } else if (key === 'd' || key === 'arrowright') {
                e.preventDefault();
                var rightTurns = { 'up': 'right', 'right': 'down', 'down': 'left', 'left': 'up' };
                direction = rightTurns[currentDirName];
            }
        } else {
            if (key === 'w' || key === 'arrowup') {
                e.preventDefault();
                direction = 'up';
            } else if (key === 's' || key === 'arrowdown') {
                e.preventDefault();
                direction = 'down';
            } else if (key === 'a' || key === 'arrowleft') {
                e.preventDefault();
                direction = 'left';
            } else if (key === 'd' || key === 'arrowright') {
                e.preventDefault();
                direction = 'right';
            }
        }
        
        if (direction) {
            Pacman.queueMove(direction);
        }
    });
}

function drawModel(model, color, filled) {
    gl.uniform3fv(program.objectColorIndex, color);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
    
    if (filled) {
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
        for (var i = 0; i < model.indices.length; i += 3) {
            gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
        }
    }
}

function loseLife() {
    gameState.lives--;
    updateUI();
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        Pacman.reset();
        Fantasmas.reset();
    }
}

function nextLevel() {
    gameState.level++;
    gameState.score += 100;
    updateUI();
    
    Fantasmas.increaseSpeeds();
    Escenario.init(gameState.level);
    Pacman.reset();
    Fantasmas.reset();
}

function gameOver() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = 'Puntuación Final: ' + gameState.score;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    
    Fantasmas.resetSpeeds();
    Escenario.init(gameState.level);
    Pacman.reset();
    Fantasmas.reset();
    updateUI();
    
    document.getElementById('gameOver').style.display = 'none';
}

function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

function changeCameraMode(mode) {
    Camara.setMode(mode);
    
    var buttons = document.querySelectorAll('.camera-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

function toggleFullscreen() {
    var container = document.getElementById('gameContainer');
    var canvas = document.getElementById('myCanvas');
    var btn = document.getElementById('fullscreenBtn');
    
    if (!container.classList.contains('fullscreen')) {
        container.classList.add('fullscreen');
        btn.textContent = '🖥️ Salir de Pantalla Completa';
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.right = '10px';
        btn.style.zIndex = '10000';
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        container.classList.remove('fullscreen');
        btn.textContent = '🖥️ Pantalla Completa';
        btn.style.position = '';
        btn.style.top = '';
        btn.style.right = '';
        btn.style.zIndex = '';
        
        canvas.width = 1000;
        canvas.height = 700;
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
        var container = document.getElementById('gameContainer');
        var canvas = document.getElementById('myCanvas');
        var btn = document.getElementById('fullscreenBtn');
        
        if (container.classList.contains('fullscreen')) {
            container.classList.remove('fullscreen');
            btn.textContent = '🖥️ Pantalla Completa';
            btn.style.position = '';
            btn.style.top = '';
            btn.style.right = '';
            btn.style.zIndex = '';
            canvas.width = 1000;
            canvas.height = 700;
        }
    }
});

function drawScene() {
    var canvas = document.getElementById('myCanvas');
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = mat4.create();
    var aspect = canvas.width / canvas.height;
    mat4.perspective(projection, Math.PI / 4, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(program.projMatrixIndex, false, projection);

    Camara.updateViewMatrix();
    
    Escenario.draw();
    Pacman.draw();
    Fantasmas.draw();
    
    Pacman.update();
    Fantasmas.update();
    
    requestAnimationFrame(drawScene);
}

function initWebGL() {
    gl = getWebGLContext();
    if (!gl) {
        alert('WebGL no está disponible');
        return;
    }

    initShaders();
    initPrimitives();
    initRendering();
    Escenario.init(gameState.level);
    Camara.setupHandlers();
    setupKeyboardHandlers();
    updateUI();
    
    drawScene();
}

initWebGL();
