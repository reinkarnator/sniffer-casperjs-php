
var FrequencyDisplay = function(element, data, options) {

	FrequencyPlanner.apply(this,arguments);
    this.name = "FrequencyDisplay";

    this.data = data;
    if (!this.data) {
        this.data = {
            "bandwidth"  : [],
            "allocation" : [],
            "occupied"   : []
        };
    }

    this.updateBandwidth();
    this.draw();

}


FrequencyDisplay.prototype = Object.create(FrequencyPlanner.prototype);
FrequencyDisplay.prototype.constructor = FrequencyDisplay;


FrequencyDisplay.prototype.draw = function() {
        
    this.ctx.clearRect(0, 0, this.width, this.height);    //erase
    this.drawFrequencyTicker();
    this.drawOccupied();
    this.drawBandwidthSeparators();
}


FrequencyDisplay.prototype.drawOccupied = function() {
    var occupied = this.tempContext();

    occupied.strokeStyle = this.options.palette.frequencyTicker;
    


    
	var list = this.data.occupied;
    for (var i = 0; i < list.length; i++) {

        list[i].highlightColor = function(percent) {   
            var color = this.defaultColor;
            var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
            return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
        }
       
        var cx = this.transformer.frequencyToX(list[i].frequency*1000);
        var w = this.transformer.frequencyToX((list[i].frequency + list[i].symrate/2)*1000) - cx;


        var yb = 24;
        var yt = 0;//(yb - list[i].level * yb / 100);   //%
        var x1 = Math.floor(cx - w * list[i].rolloff);
        var x2 = Math.floor(cx - w);
        var x3 = Math.floor(cx + w);
        var x4 = Math.floor(cx + w * list[i].rolloff);

        var text = '';
        switch(list[i].type) {
        	case 1: 
        		text = 'TDM';
        		break;	//TDM
        	case 2: 
        		text = 'TDMA';
	        	break; //TDMA
        	case 3: 
        		text = 'SCPC';
	        	break;	//SCPC RX
        	case 4: 
        		text = 'SCPC';
	        	break;	//SCPC TX
            case 5: 
                text = 'Self';
                yt = 65;
                break;  //Self RX loopback
        }

        occupied.fillStyle = list[i].color;
        occupied.beginPath();
        occupied.moveTo(x1, yb);
		occupied.quadraticCurveTo(x1, yt, x2, yt);
		occupied.quadraticCurveTo(x1, yt, x2, yt);
		occupied.lineTo(x3, yt);
		occupied.quadraticCurveTo(x4, yt, x4, yb);
		occupied.lineTo(x1, yb);
		occupied.fill();

        occupied.font="10px Arial";
        var tw = occupied.measureText(text).width;
        if (tw < x3-x2) {
            occupied.fillStyle = "#000";
            occupied.echo(text,  cx - tw/2, yt + 6 + ((yb - yt) / 2));
        }


        //store coords to highlighter
        list[i].l = x1 + this.options.paneX;
        list[i].r = x4 + this.options.paneX;
        list[i].t = ((yb > yt) ? yb : yt) + this.options.paneY;
        list[i].b = ((yb > yt) ? yt : yb) + this.options.paneY;

    }
    
    occupied.beginPath();
    occupied.strokeStyle = this.options.palette.bandwidthSeparator;
    occupied.moveTo(0,yb);
    occupied.lineTo(this.options.paneWidth,yb);
    occupied.stroke();

    this.ctx.drawImage(occupied.canvas, this.options.paneX, this.options.paneY);
}


FrequencyDisplay.prototype.calcOffsets = function(event) {
    if(!event.hasOwnProperty('offsetX')) {
        event.offsetX = (event.offsetX || event.clientX - $(event.target).offset().left + window.pageXOffset );
        event.offsetY = (event.offsetY || event.clientY - $(event.target).offset().top + window.pageYOffset );    
    }
}

FrequencyDisplay.prototype.onmousemove = function() {
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
        var list = self.data.occupied;

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            
            if (mouseX >= item.l && mouseX <= item.r
                && mouseY <= item.t && mouseY >= item.b ) { //hit

                self.highlightedItem = item;
                //item.color = item.highlightColor(+0.1);//options.highlightColor;
                this.style.cursor = 'pointer';
                var h = self.label.height();
                self.label
                    .html(item.text)
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

/*
FrequencyDisplay.prototype.update = function(data, rebuild) {
    debugger;
    console.log('Updates not yet implemented');
    return;
}
*/

FrequencyDisplay.prototype.update = function(data, rebuild) {
    var self = this;
    if (data) {
        this.data = data;
        this.updateBandwidth();
        this.draw();
    }

    self.animForceUpdate = 1; 
}

FrequencyDisplay.prototype.tempContext = function(name) {
    var ctx = FrequencyPlanner.prototype.tempContext.apply(this,arguments);
    ctx.font = "10px Arial";
    return ctx;
}