 

//render
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

window.cancelRequestAnimFrame = ( function() {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
})();


CanvasRenderingContext2D.prototype.echo = function(text, x, y) {
    this.fillText(text, x, y);
}

CanvasRenderingContext2D.prototype.drawLine = function (sx, sy, ex, ey) {
    this.beginPath();
    this.lineWidth = 1;
    this.lineCap = 'round';
    this.moveTo(sx, sy);
    this.lineTo(ex, ey);
    this.stroke();
}

CanvasRenderingContext2D.prototype.drawLineBatch = function (sx, sy, ex, ey) {
    this.moveTo(sx, sy);
    this.lineTo(ex, ey);
}


CanvasRenderingContext2D.prototype.drawBox = function (x, y, width, height, radius, fill, stroke) {

    /*
    var grd=this.createLinearGradient(0, 0, 0, this.canvas.height);
    grd.addColorStop(0, "#900");
    grd.addColorStop(0.5, "#f00");
    grd.addColorStop(0, "#900");
    this.fillStyle=grd;
    */

    this.fillRect(x, y, width, height);
    this.strokeRect(x, y, width, height);
}

CanvasRenderingContext2D.prototype.drawRoundBox = function (x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined" ) {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    if (stroke) {
        this.stroke();
    }
    if (fill) {
        this.fill();
    }   
}


//planner


var FrequencyPlanner = function(element, data, options){

    var self = this;
    this.name = "FrequencyPlanner";

    this.width = element.width;
    this.height = element.height;
    this.options = this.initOptions(options);

    this.ctx = element.getContext("2d");
    //this.ctx.translate(0.5, 0.5);

    this.data = data;
    if (!this.data) {
        this.data = {
            "bandwidth" : [],
            "allocation" : [],
        };
    }
    this.animLastFrameTimestamp = 0;
    this.animForceUpdate = 1;
    this.highlightedItem = null;


    this.canvasCache = {};
    this.allocationList = [];
    this.bandwidthList = [];
    this.updateAllocation();
    this.updateBandwidth();

    this.label = $('<div/>').addClass('fplabel').appendTo($('body'));
    if (this.options.autoupdate) {
        self.frameRequest = requestAnimFrame(self.updateAnimationFunc(self));
        //setInterval(function() { self.update() }, 1000);
    }

    element.onmousemove = this.onmousemove();
    element.onmousedown = this.onmousedown();
    element.onmouseup = this.onmouseup();
    if ('onwheel' in document) {
        element.onwheel = this.onmousewheel();
    } else {
        element.onmousewheel = this.onmousewheel();
    }
    
    element.onclick = this.click();
    element.ondblclick = this.ondblclick(); 

    this.transformer = new ZoomPanTransformer(this);
    //this.draw();
};


FrequencyPlanner.prototype.destroy = function() {
    cancelRequestAnimFrame(this.frameRequest);
    $('.fplabel').remove();
}

FrequencyPlanner.prototype.initOptions = function(options) {

    var palette = {
        'red' : '#D5140D',
        'orange' : '#FF7900',
        'yellow' : '#FFCC28',
        'green' : '#60B037',
        'blue' : '#0295C1',
        'gray' : '#cccccc',
        'dateTicker' : '#E6E6E6',
        'frequencyTicker' : '#E6E6E6',
        'bandwidthSeparator' : '#646464',
        'now' : "rgba(255, 100, 100, 1)",
        'allocationBorder' : '#999',
    }

    opt = {};
    opt.paneX = 150;
    opt.paneY = 50;
    opt.tzOffset = 0;
    opt.autoupdate = 0;
    opt.paneWidth = this.width - opt.paneX;
    opt.paneHeight = this.height - opt.paneY;

    opt.highlightColor = palette.orange;
    opt.fillColor = palette.gray;
    opt.palette = palette;

    //overwrite options
    for (var attrname in options) { 
        opt[attrname] = options[attrname]; 
    }

    return opt;
}


FrequencyPlanner.prototype.tempContext = function(name) {
    var ctx = this.canvasCache['name']
    if (!ctx) {
        var canvasTemp = document.createElement("canvas");
        canvasTemp.width = this.width;
        canvasTemp.height = this.height;
        ctx = canvasTemp.getContext("2d");

        ctx.translate(0.5, 0.5);
        ctx.font="12px Arial";
        this.canvasCache['name'] = ctx;
    } else {
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    }
    return ctx;
}

FrequencyPlanner.prototype.update = function(data, rebuild) {
    var self = this;
    if (data) {
        this.data = data;
        this.updateAllocation();
        this.updateBandwidth();
    }

    if (rebuild) {
        self.transformer.zoomToNow(); 
    }
    self.animForceUpdate = 1; 
}


FrequencyPlanner.prototype.updateAnimationFunc = function(self) {

    var result = function(timestamp) {
        var delta = timestamp - self.animLastFrameTimestamp;
        if (delta > 1000 || self.animForceUpdate) {
            if(self.animLastFrameTimestamp) {
                self.transformer.startTimestamp += delta * 0.001;
                self.transformer.endTimestamp += delta * 0.001;                
            }
            self.animLastFrameTimestamp = timestamp;
            self.animForceUpdate = 0;
            self.draw();
        }
        self.frameRequest = requestAnimFrame(self.updateAnimationFunc(self));
    }
    return result;
}


FrequencyPlanner.prototype.pan = function(e) {
    var self = this;
    var endY = e.offsetY ? e.offsetY : e.layerY;
    var dt = self.transformer.dYToTimestamp(endY - self.drag.startY);
    self.transformer.startTimestamp = self.drag.startTimestamp + dt;
    self.transformer.endTimestamp = self.drag.endTimestamp + dt;
    self.animForceUpdate = 1;
}

FrequencyPlanner.prototype.zoom = function(e) {
    var self = this;
    var y = e.offsetY ? e.offsetY : e.layerY;

    if (y < this.options.paneY)
        return;
    
    var t = self.transformer.dYToTimestamp(y - this.options.paneY);

    var delta = e.wheelDelta ? (-e.wheelDelta / 120) :  e.deltaY;
    var zoomfactor = delta;    //120 per click, -> 1

//    self.transformer.zoomY += zoomfactor;

    var proportion = Math.abs(self.transformer.startTimestamp - self.transformer.endTimestamp) * 0.05; // %
    var proportion_y = t / Math.abs(self.transformer.startTimestamp - self.transformer.endTimestamp);
    zoomfactor *= proportion;

    self.transformer.endTimestamp += zoomfactor * proportion_y;
    self.transformer.startTimestamp -= zoomfactor * (1 - proportion_y);
    
    self.animForceUpdate = 1;
}

FrequencyPlanner.prototype.ondblclick = function() {
    var self = this;
    return function(e) { 
        self.transformer.zoomToNow(); 
        self.animForceUpdate = 1; 
    }
}

FrequencyPlanner.prototype.click = function() {
    var self = this;
    return function(e) {
        if (self.highlightedItem && self.options.clickHandler) {
            self.options.clickHandler({ id : self.highlightedItem.id, frequency : self.highlightedItem.frequency });
            //alert("id: " + self.highlightedItem.id + ", frequency: " + self.highlightedItem.frequency);
        }
    }
}


FrequencyPlanner.prototype.onmousewheel = function() {
    var self = this;
    return function(e) {
        e.preventDefault();
        self.zoom(e);
    }
}


FrequencyPlanner.prototype.onmouseup = function() {
    var self = this;
    return function(e) {
        if (e.shiftKey || e.ctrlKey) {   //pan
            self.pan(e);
        }

        self.drag = null;
        this.style.cursor = 'default';
    }


}
FrequencyPlanner.prototype.onmousedown = function() {
    var self = this;
    return function(e) {
        self.drag = {
            startX : e.offsetX ? e.offsetX : e.layerX,
            startY : e.offsetY ? e.offsetY : e.layerY,
            startTimestamp : self.transformer.startTimestamp,
            endTimestamp : self.transformer.endTimestamp,
        }


        if (e.shiftKey || e.ctrlKey) {   //pan
            this.style.cursor = 'move';
        }
    }
}

FrequencyPlanner.prototype.calcOffsets = function(event) {
    if(!event.hasOwnProperty('offsetX')) {
        event.offsetX = (event.offsetX || event.clientX - $(event.target).offset().left + window.pageXOffset );
        event.offsetY = (event.offsetY || event.clientY - $(event.target).offset().top + window.pageYOffset );
    }
}

FrequencyPlanner.prototype.onmousemove = function() {
    var self = this;
    var handler = function(event) {

        if ((event.shiftKey || event.ctrlKey) && self.drag) {   //pan
            self.pan(event);
            return;
        }

        self.calcOffsets(event);
        var mouseX = event.offsetX;
        var mouseY = event.offsetY;

        //highlight
        self.highlightedItem = null;
        self.animForceUpdate = 1;
        for (var i = 0; i < self.allocationList.length; i++) {
            var item = self.allocationList[i];
            
            if (mouseX >= item.l && mouseX <= item.r
                && mouseY <= item.t && mouseY >= item.b ) { //hit
                self.highlightedItem = item;
                item.color = item.highlightColor(+0.1);//options.highlightColor;
                this.style.cursor = 'pointer';
                var h = self.label.height();
                self.label
                    .html(item.comment)
                    .css({top: event.clientY-h-30, left: event.clientX + 5});
                    
            } else {
                item.color = item.defaultColor;
            }                
        }
        if (!self.highlightedItem) {
            this.style.cursor = 'default';
            self.label.hide();
        } else {
            self.label.show();
        }

        
        //todo: draw legend

    }
    return handler;
}





FrequencyPlanner.prototype.draw = function() {
    
    this.ctx.clearRect(0, 0, this.width, this.height);    //erase

    this.drawDateTicker();
    this.drawFrequencyTicker();
    
    this.drawAllocationPane();

    this.drawBandwidthSeparators();
    
}


FrequencyPlanner.prototype.updateAllocation = function() {
    this.allocationList = [];
    var length = this.data.allocation.length;
    for (var i = 0; i < length; i++) {
        var item = new Allocation(this.data.allocation[i], this);
        this.allocationList.push(item);
    }
}

FrequencyPlanner.prototype.updateBandwidth = function() {
    this.bandwidthList = [];
    var length = this.data.bandwidth.length;
    for (var i = 0; i < length; i++) {
        var item = new Bandwidth(this.data.bandwidth[i]);
        item.width = this.options.paneWidth / length;    //equal space, todo: calculate proportional part
        item.offsetX = i * item.width;
        this.bandwidthList.push(item);
    } 
}

FrequencyPlanner.prototype.updateRange = function(seconds) {
    
    var start = (new Date).getTime()*0.001 - seconds/2;
    var end = (new Date).getTime()*0.001 + seconds/2;
    this.transformer.startTimestamp = start - this.options.tzOffset;
    this.transformer.endTimestamp = end - this.options.tzOffset;
    this.animForceUpdate = 1;   
}


FrequencyPlanner.prototype.drawDateTicker = function() {

    var ticker = this.tempContext();

    var ticks = FrequencyPlannerTicker.dateTicks(
        this.transformer.startTimestamp, 
        this.transformer.endTimestamp, 
        this.options.paneHeight, this.options); 

    ticker.strokeStyle = this.options.palette.dateTicker;
    ticker.fillStyle = "#000";
    ticker.beginPath();
    for (var j = 0; j < ticks.length; j++) {
        var y = this.transformer.timestampToY(ticks[j].v);
        var text = ticks[j].label;
        var w = ticker.measureText(text).width;
        y += this.options.paneY;
        ticker.echo(text, this.options.paneX - w - 30, y + 3);

        //grid
        ticker.drawLineBatch(this.options.paneX, y, this.width, y);
    }
    ticker.stroke();

    this.ctx.drawImage(ticker.canvas, 0, 0);
}



FrequencyPlanner.prototype.drawFrequencyTicker = function() {
    var ticker = this.tempContext();

    var formatF = function(frequency) {
        frequency /= 1000;  //from hz

        if (frequency % 1000 != 0)
            return (frequency / 1000000).toFixed(6);
        else
            return (frequency / 1000000).toFixed(6);
    }

    ticker.strokeStyle = this.options.palette.frequencyTicker;
    ticker.fillStyle = "#000";
    ticker.beginPath();

    var text = 'GHz';
    var w = ticker.measureText(text).width;
    ticker.echo(text, this.options.paneX - w - 20, this.options.paneY - 30);

    for (var i = 0; i < this.bandwidthList.length; i++) {
        var ticks = FrequencyPlannerTicker.frequencyTicks(this.bandwidthList[i].startFrequency, this.bandwidthList[i].endFrequency, this.bandwidthList[i].width);
        for (var j = 0; j < ticks.length; j++) {
            var x = this.transformer.frequencyToX(ticks[j].v);
            x += this.options.paneX;
            text = ticks[j].label;
            w = ticker.measureText(text).width;
            ticker.echo(text,  x - w/2, this.options.paneY - 12);

            //grid
            ticker.drawLineBatch(x, this.options.paneY, x, this.height);

            if (j == 0) {
                x = this.transformer.frequencyToX(this.bandwidthList[i].startFrequency);
                x += this.options.paneX;
                text = formatF(this.bandwidthList[i].startFrequency);
                ticker.echo(text, x, this.options.paneY - 30);
                console.log(this.name + ': ' + text + ' x:' + x + ' y:' + (this.options.paneY - 30));

            } else if (j == ticks.length-1) {
                x = this.transformer.frequencyToX(this.bandwidthList[i].endFrequency);
                x += this.options.paneX;
                text = formatF(this.bandwidthList[i].endFrequency);
                w = ticker.measureText(text).width;
                ticker.echo(text, x - w - 2, this.options.paneY - 30);
            }
        }  
    };
    ticker.stroke();

    this.ctx.drawImage(ticker.canvas, 0, 0);
}


FrequencyPlanner.prototype.drawBandwidthSeparators = function() {
    
    //draw bandwidth separators
    var pane = this.tempContext();
    pane.strokeStyle = this.options.palette.bandwidthSeparator;
    pane.drawLine(1,0,1,this.options.paneHeight);
    
    length = this.bandwidthList.length;
    for (var i = 0; i < length; i++) {
        var lineX = this.transformer.frequencyToX(this.bandwidthList[i].endFrequency);
    
        if (i == length-1)
            lineX-=2;       //pixels lost in context translation

        pane.drawLine(lineX,0,lineX,this.options.paneHeight);

    };

    this.ctx.drawImage(pane.canvas, this.options.paneX, this.options.paneY);
}



FrequencyPlanner.prototype.drawAllocationPane = function() {

    //draw allocation
    var pane = this.tempContext();
    var length = this.allocationList.length;
    for (var i = 0; i < length; i++) {
        this.allocationList[i].Draw(pane, this.transformer);
    }

    pane.strokeStyle = this.options.palette.now;
    var nowTs = (new Date).getTime() * 0.001 - this.options.tzOffset
    var nowY = this.transformer.timestampToY(nowTs);
    pane.drawLine(0.5, nowY, this.options.paneWidth, nowY);


    this.ctx.drawImage(pane.canvas, this.options.paneX, this.options.paneY);
}


var ZoomPanTransformer = function(planner) {
    this.zoomX = 1;
    this.zoomY = 1;
    this.panX = 1;
    this.panY = 1;
    this.planner = planner;
    this.zoomToNow();
}


ZoomPanTransformer.prototype.zoomToNow = function() {
    this.endTimestamp   = Math.floor((new Date).getTime() * 0.001 + 4200) - this.planner.options.tzOffset;
    this.startTimestamp = Math.floor((new Date).getTime() * 0.001 - 4200) - this.planner.options.tzOffset;
}

ZoomPanTransformer.prototype.Autoscale = function() {
    var MAX_INT = 4294967295;
    var minTimestamp = MAX_INT;
    var maxTimestamp = 0;

    for (var i = 0; i < this.allocationList.length; i++) {
        if (this.allocationList[i].startTimestamp < minTimestamp)
            minTimestamp = this.allocationList[i].startTimestamp;

        if (this.allocationList[i].endTimestamp > maxTimestamp)
            maxTimestamp = this.allocationList[i].endTimestamp;
    }
    this.startTimestamp = minTimestamp;
    this.endTimestamp = maxTimestamp;
}

ZoomPanTransformer.prototype.frequencyToX = function(frequency) {

    for (var i = this.planner.bandwidthList.length - 1; i >= 0; i--) {
        var bw = this.planner.bandwidthList[i];
        if (frequency >= bw.startFrequency && frequency <= bw.endFrequency) {
            var proportion = (frequency - bw.startFrequency) / (bw.endFrequency - bw.startFrequency);
            var positionX = bw.offsetX + bw.width * proportion;
            return Math.round(this.zoomX * positionX + this.panX);
        }
    };

    return 0;
}

ZoomPanTransformer.prototype.timestampToY = function(timestamp) {
    var proportion = (timestamp - this.startTimestamp) / (this.endTimestamp - this.startTimestamp);
    var positionY = this.planner.options.paneHeight * proportion;
    positionY = this.planner.options.paneHeight - positionY;    //inverse
    return Math.round(this.zoomY * positionY + this.panY);
}

ZoomPanTransformer.prototype.dYToTimestamp = function(dy) {
    var proportion = dy / this.planner.options.paneHeight;
    var dt =  (this.endTimestamp - this.startTimestamp) * proportion;
    return Math.round(dt);
}



var Allocation = function(arr, planner) {    //alloc: id freq width start end 

    this.id = parseInt(arr[0], 10);
    this.frequency = parseInt(arr[1], 10) * 1000;
    this.width = parseInt(arr[2], 10) * 1000;
    this.startTimestamp = parseInt(arr[3], 10);
    this.endTimestamp = parseInt(arr[4], 10);
    this.color = this.defaultColor = arr[5];
    this.comment = arr[6];
    this.text = arr[7];

    this.l = this.r = this.r = this.b = 0;

    this.highlightColor = function(percent) {   
        var color = this.defaultColor;
        var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }


    this.getRGBComponents = function(color) {       
        var r = color.substring(1, 3);
        var g = color.substring(3, 5);
        var b = color.substring(5, 7);

        return {
            R: parseInt(r, 16),
            G: parseInt(g, 16),
            B: parseInt(b, 16)
        };
    }

    this.textColor = function(bgColor) {
        var nThreshold = 105;
        var components = this.getRGBComponents(bgColor);
        var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
        return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";   
    }


    this.shortenText = false;
    this.shortenTextDone = false;
    this.Draw = function(ctx, transformer) {

        var l = transformer.frequencyToX(this.frequency-this.width/2);
        var r = transformer.frequencyToX(this.frequency+this.width/2);
        var b = transformer.timestampToY(this.startTimestamp - planner.options.tzOffset);
        var t = transformer.timestampToY(this.endTimestamp - planner.options.tzOffset);

        if (!this.color)
            this.color = planner.options.fillColor;//gray

        ctx.fillStyle = this.color;
        ctx.strokeStyle = planner.options.palette.allocationBorder;
        ctx.drawRoundBox(l, t, r-l, b-t, 3, true, true);

        var width;
        if (!this.shortenTextDone) {
            while (true) {
                var metrics = ctx.measureText(this.text);
                width = metrics.width;

                if (width > (r-l-15)) {
                    this.text = this.text.substr(0, this.text.length-1);
                    this.shortenText = true;
                } else {
                    break;
                }

                if (this.text.length < 3)
                    break;
            }            
        }


        if (this.shortenText && !this.shortenTextDone) {
            this.text += '...';//String.fromCharCode(8230); //ellipsis
            this.shortenTextDone = true;
        }

        var height = parseInt(ctx.font);

        if (b-t > height * 0.8) {
            ctx.fillStyle = this.textColor(this.color);
            ctx.fillText(this.text, l+5, (t-b)/2 + b + height/4);
        }

        //abs coords
        this.l = l + planner.options.paneX;
        this.r = r + planner.options.paneX;
        this.t = b + planner.options.paneY; //inverse coords
        this.b = t + planner.options.paneY;
    }
}


var Bandwidth = function(arr) {
    this.id = parseInt(arr[0]);
    this.startFrequency = parseInt(arr[1]) * 1000;
    this.endFrequency = parseInt(arr[2]) * 1000;
    this.offsetX = 0;
    this.width = 0;
}

var BandwidthPane = function() {
    
}


allocationDraw = function() {
    //alloc: freq width start end 

    allocationPane(draw)
}

