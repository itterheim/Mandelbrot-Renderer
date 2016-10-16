var App = function () {

    var height = 600;
    var width = 600;
    var iterations = 1000;

    var sf = 3;
    var scale = 1;

    var left = 0;
    var top = 0;

    var steps = { left: [], top: [] };

    this.app = null;
    this.canvas = null;
    this.ctx = null;
    this.button = null;

    this.worker = null;

    this._initialize = function () {
        var self = this;

        // create web worker
        this.worker = new Worker('worker.js');

        this.worker.addEventListener('message', function(e) {
            window.setTimeout(function () {
                var data = JSON.parse(e.data);
                for (var i in data) {
                    if (!data) continue;
                    self.drawPixel(data[i].x, data[i].y, data[i].color);
                }
            }, 0);
        }, false);

        // create ui
        this.app = document.getElementById('app');

        var html = '';
        // html += '<button id="run">Run</button>';
        html += '<br />';
        html += '<canvas width="' + width + '" height="' + height + '" id="canvas"></canvas>';
        html += '<div id="hover"></div>';

        this.app.innerHTML = html;

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.button = document.getElementById('run');
        this.hover = document.getElementById('hover');

        // this.button.addEventListener('click', function () {
        //     self.run();
        // }, false);

        var rX = 0;
        var rY = 0;

        document.body.addEventListener('mousemove', function (e) {
            var position = self.getMousePos(e);
            var rect = self.canvas.getBoundingClientRect();

            if ((e.clientX > rect.left && e.clientX < rect.left + rect.width) && (e.clientY > rect.top && e.clientY < rect.top + rect.height)) {
                var x = position.x < width / 3 ? rect.left + 1 : position.x < width / 3 * 2 ? rect.left + 1 + width / 3 : rect.left + 1 + width / 3 * 2;
                var y = position.y < height / 3 ? rect.top + 1 : position.y < height / 3 * 2 ? rect.top + 1 + height / 3 : rect.top + 1 + height / 3 * 2;

//                rX = position.x < width / 3 ? 0 : position.x < width / 3 * 2 ? 1 : 2;
//                rY = position.y < height / 3 ? 0 : position.y < height / 3 * 2 ? 1 : 2;

                rX = Math.floor(position.x / (width / sf));
                rY = Math.floor(position.y / (height / sf));

                self.hover.style.background = '#f00';
                self.hover.style.display = 'block';
                self.hover.style.left = x + 'px';
                self.hover.style.top = y + 'px';
                self.hover.style.width = (width/sf) + 'px';
                self.hover.style.height = (height/sf) + 'px';
            } else {
                self.hover.style.display = '';
            }

//            console.log(e.clientX, e.clientY);
        }, false);

        this.hover.addEventListener('click', function () {
            self.ctx.beginPath();
            self.ctx.rect(0,0, width, height);
            self.ctx.fillStyle = '#fff';
            self.ctx.fill();

            scale *= sf;
//            console.log(scale, rX, rY);
            self.run(rX, rY);
        }, false);
    };

    this.run = function (rX, rY) {
        if (!this.worker) {
            console.warn('Web Worker failed');
            return;
        } else {
            if (steps.left.length === 0 || typeof rX != 'number') steps.left.push(0);
            if (steps.top.length === 0 || typeof rY != 'number') steps.top.push(0);
            if (typeof rX == 'number') steps.left.push(rX);
            if (typeof rY == 'number') steps.top.push(rY);

            left = 0;
            top = 0;

            for (var i = 0; i < steps.top.length; i++) {
                top += steps.top[i] * ((height * scale) / Math.pow(sf, i));
            }

            for (var j = 0; j < steps.left.length; j++) {
                left += steps.left[j] * ((width * scale) / Math.pow(sf, j));
            }

            this.worker.postMessage(JSON.stringify({ width: width, height: height, iterations: iterations, scale: scale, offsetX: left, offsetY: top }));
        }
    };

    this.drawPixel = function (x, y, color) {
        this.ctx.beginPath();
        this.ctx.rect(x || 0, y || 0, 1, 1);
        this.ctx.fillStyle = color || '#000';
        this.ctx.fill();
    };

    this.getMousePos = function (evt) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
};

var app = new App();
app._initialize();

app.run();
