var width = 0;
var height = 0;
var iterations = 0;
var scale = 1;
var offsetX = 0;
var offsetY = 0;

var chunkSize = 200;
var count = 0;
var done = 0;

var result = [];

self.addEventListener('message', function (e) {
    var data = JSON.parse(e.data);

    width = data.width;
    height = data.height;
    iterations = data.iterations || 5;
    scale = data.scale;
    offsetX = data.offsetX;
    offsetY = data.offsetY;

    count = width * height;
    done = 0;
    
    processChunk();
}, false);

function processChunk () {
    for (var i = 0; i < chunkSize; i++) {
        var col = (done + i) % width;
        var row = Math.floor((done + i) / width);
        
        col += offsetX;
        row += offsetY;
        
        isInSet(col, row);
    }
    
    done += chunkSize;
    if (done < count) {
        send();
        
        setTimeout(function () {
            processChunk();
        }, 0);
    } else {
        send();
    }
}

function isInSet(col, row) {
    // what the hell is goind on?
    
    var c_re = (col - (width * scale) / 2) * 4 / (width * scale);
    var c_im = (row - (height * scale) / 2) * 4 / (height * scale);
    var x = 0;
    var y = 0;
    var iteration = 0;

    while (x * x + y * y <= 4 && iteration < iterations) {
        var x_new = x * x - y * y + c_re;
        y = 2 * x * y + c_im;
        x = x_new;
        iteration++;
    }
    if (iteration === iterations) push(col, row, '#fff');
//    else push(col, row, 'rgb(' + Math.floor((iteration) * 150 / (iterations)) + ',' + Math.floor((iteration) * 200 / (iterations)) + ',' + Math.floor((iteration) * 255 / (iterations)) + ')');
//    else if (iteration > 2) push(col, row, 'rgba(0,0,0,' + (Math.floor((iteration - 1) * 80 / (iterations - 1)) / 100) + ')');
//    else return;
    else {
        var n = 255 / Math.log(iterations + 1);
        var v = Math.log(Math.pow(iteration + 1, n));
        v = Math.floor(v);
        push(col, row, 'rgb(' + Math.floor(iteration * 220 / iterations) + ', ' + Math.floor(iteration * 240 / iterations) + ' ,' + v + ')');
    }
}

function push(x, y, color) {
    result.push({
        x: x - offsetX,
        y: y - offsetY,
        color: color
    });
}

function send () {
    self.postMessage(JSON.stringify(result));
    result = [];
}