var Camara = {
    mode: 'static',
    theta: -1.0,
    phi: 1.2,
    radius: 40.0,
    target: [18.0, 0.0, 21.0],
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    
    staticPosition: [18.0, 45.0, 45.0],
    staticTarget: [18.0, 0.0, 21.0],
    
    setMode: function(newMode) {
        this.mode = newMode;
        if (newMode === 'orbital') {
            this.theta = -1.0;
            this.phi = 1.2;
            this.radius = 40.0;
            this.target = [18.0, 0.0, 21.0];
        }
    },
    
    updateViewMatrix: function() {
        var view = mat4.create();
        
        if (this.mode === 'static') {
            mat4.lookAt(view, this.staticPosition, this.staticTarget, [0, 1, 0]);
        } else if (this.mode === 'firstPerson') {
            var camHeight = 1.5;
            var offsetDistance = 0.6;
            
            var dirX = Math.sin(-Pacman.direction);
            var dirZ = Math.cos(-Pacman.direction);
            
            var camX = Pacman.x * 2 + dirX * offsetDistance;
            var camZ = Pacman.z * 2 + dirZ * offsetDistance;
            
            var lookDistance = 4.0;
            var lookX = camX + dirX * lookDistance;
            var lookZ = camZ + dirZ * lookDistance;
            var lookY = camHeight * 0.7;
            
            mat4.lookAt(view, [camX, camHeight, camZ], [lookX, lookY, lookZ], [0, 1, 0]);
        } else {
            this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
            
            var sinPhi = Math.sin(this.phi);
            var cosPhi = Math.cos(this.phi);
            var sinTheta = Math.sin(this.theta);
            var cosTheta = Math.cos(this.theta);

            var camX = this.radius * sinPhi * cosTheta + this.target[0];
            var camY = this.radius * cosPhi + this.target[1];
            var camZ = this.radius * sinPhi * sinTheta + this.target[2];

            mat4.lookAt(view, [camX, camY, camZ], this.target, [0, 1, 0]);
        }
        
        gl.uniformMatrix4fv(program.viewMatrixIndex, false, view);
    },
    
    setupHandlers: function() {
        var self = this;
        var canvas = document.getElementById('myCanvas');

        canvas.addEventListener('mousedown', function(e) {
            if (self.mode !== 'orbital') return;
            self.isDragging = true;
            self.lastMouse.x = e.clientX;
            self.lastMouse.y = e.clientY;
        });

        canvas.addEventListener('mousemove', function(e) {
            if (!self.isDragging || self.mode !== 'orbital') return;
            var dx = e.clientX - self.lastMouse.x;
            var dy = e.clientY - self.lastMouse.y;
            self.lastMouse.x = e.clientX;
            self.lastMouse.y = e.clientY;

            self.theta += dx * 0.01;
            self.phi += dy * 0.01;
        });

        var stopDrag = function() { self.isDragging = false; };
        canvas.addEventListener('mouseup', stopDrag);
        canvas.addEventListener('mouseleave', stopDrag);

        canvas.addEventListener('wheel', function(e) {
            if (self.mode !== 'orbital') return;
            e.preventDefault();
            var delta = e.deltaY > 0 ? 1.1 : 0.9;
            self.radius = Math.max(10.0, Math.min(40.0, self.radius * delta));
        }, { passive: false });
    }
};
