var AcmStat = function(element, data)
{
	this.data = data;

	this.width = element.width;
	this.height = element.height;

	this.ctx = element.getContext('2d');
	this.ctx.translate(0.5, 0.5);

	// Дефолтный размер сетки
	this.default_cell_size = 60;
	this.cell_size = 60;
	this.label_offset = 10;

	this.scr_cols = Math.floor(this.width/this.cell_size);
	this.scr_rows = Math.floor(this.height/this.cell_size + this.label_offset);

	// Количество необходимых колонок и строк для размещения станций при дефолтной ячейке
	if (this.data.length <= this.scr_cols) {
		this.cols = this.data.length;
	} else {
		this.cols = this.scr_cols;
	}
	this.rows = Math.ceil(this.data.length/this.scr_cols);

	
	this.qty = this.data.length; // Количество станций

	this.drawPunchCard();

	$("#acm_stat").mousemove({cell_x: this.cell_size, cell_txt_offset: this.label_offset, rect_cords: this.rect_cords, remote: this.data}, function(event) {
		var os = $("#acm_stat").offset();

		var pos_x = event.pageX - os.left;
		var pos_y = event.pageY - os.top;

		var col = Math.ceil(pos_x/event.data.cell_x);
		var row = Math.ceil(pos_y/(event.data.cell_x + event.data.cell_txt_offset));

		var k = row + '_' + col;

		$('#test').html('Station num: ' + event.data.rect_cords[k]);
	});

};

AcmStat.prototype.drawPunchCard = function()
{
	this.ctx.clearRect(0, 0, this.width - 1, this.height - 1);
	// this.draw_canvas_border();

	// Расчитаем реально необходимое количество строк и столбцов
	while (this.rows*(this.cell_size + this.label_offset) > this.height) {
		this.cols = this.cols + 1;
		this.rows = Math.ceil(this.qty/this.cols);
		this.cell_size = Math.floor(this.width/this.cols);
	}

	var cell_size_ratio = 1;
	if (this.cell_size < this.default_cell_size) cell_size_ratio = this.cell_size/this.default_cell_size;

	this.draw_mesh();

	// Макс./Мин. значения скорости
	var max_spd = 0;
	var min_spd = 0;
	for (var key in this.data) {
		var traf = Number(this.data[key].tx_spd);
		if (traf > max_spd) max_spd = traf;

		if (min_spd == 0 && traf > 0) min_spd = traf;
		if (traf < min_spd && traf > 0) min_spd = traf;
	}
	if (min_spd < (max_spd/20) ) min_spd = Math.floor(max_spd/20);

	var max_radius = Math.round(50*cell_size_ratio);
	var min_radius = 5;

	var xc = this.cell_size/2;
	var x_rect_c = 0;
	var yc = this.cell_size/2;
	

	this.rect_cords = [];
	var i = 0;
	for (var key in this.data)
	{
		i++;
		var traf = Number(this.data[key].tx_spd);

		if (traf > 0)
		{
			var radius = Math.floor(traf*max_radius/max_spd);
	
			if (radius < min_radius) radius = min_radius;

			this.ctx.beginPath();
			this.ctx.arc(xc, yc, radius/2, 0, 2*Math.PI);
			this.ctx.closePath();

			var acm_fill_color;
			var acm_channel = Number(this.data[key].acm_channel);
			switch (acm_channel)
			{
				case 0: acm_fill_color = '#FF0000'; break;
				case 1: acm_fill_color = '#FC6D00'; break;
				case 2: acm_fill_color = '#00A005'; break;
				case 3: acm_fill_color = '#0053D1'; break;
				case 4: acm_fill_color = 'magenta'; break;
				case 5: acm_fill_color = 'purple'; break;
			}

			this.ctx.fillStyle = acm_fill_color;
			this.ctx.fill();
		}
		else
		{
			this.ctx.beginPath();
				this.ctx.moveTo(xc - 3, yc);
				this.ctx.lineTo(xc + 3, yc);
				this.ctx.moveTo(xc, yc - 3);
				this.ctx.lineTo(xc, yc + 3);
			this.ctx.closePath();

      		this.ctx.strokeStyle = '#BBB';
      		this.ctx.stroke();
		}
		
		this.ctx.font = '10px Arial';
		this.ctx.fillStyle = '#555';
		var txt = this.data[key].number;
		var txt_width = this.ctx.measureText(txt);
		this.ctx.fillText(txt, (xc - (txt_width.width/2)), yc + this.cell_size/2 + 5);

		var k = Math.ceil(yc/(this.cell_size + this.label_offset)) + '_' + Math.ceil(xc/this.cell_size);

		this.rect_cords[k] = this.data[key].number;

		var xc = xc + this.cell_size;
		if ((i % this.cols) == 0)
		{
			yc = yc + this.cell_size + this.label_offset;
			xc = this.cell_size/2;
		}
		
		var x_rect_c = x_rect_c + this.cell_size;
	}
};

AcmStat.prototype.update = function(data)
{
	if (data)
	{
		this.data = data;
		this.drawPunchCard();
	}
};

// AcmStat.prototype.highlightColor = function(color, percent) {
//     var f = parseInt(color.slice(1),16);
//     var t = percent < 0 ? 0 : 255;
//     var p = percent < 0 ? percent*-1 : percent;
//     var R = f >> 16;
//     var G = f >> 8 & 0x00FF;
//     var B = f & 0x0000FF;
//     return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
// };

AcmStat.prototype.draw_canvas_border = function() {
	this.ctx.rect(0, 0, this.width - 1, this.height - 1);
	this.ctx.strokeStyle = '#000';
	this.ctx.stroke();
};

AcmStat.prototype.draw_mesh = function() {
	var tl_x = 0;
	var tl_y = 0;

	for (var i = 1; i <= this.data.length; i++) {
		this.ctx.rect(tl_x, tl_y, this.cell_size, this.cell_size + this.label_offset);
		this.strokeStyle = '#000';
		this.ctx.stroke();

		tl_x = tl_x + this.cell_size;
		if ((i % this.cols) == 0) {
			tl_y = tl_y + this.cell_size + this.label_offset;
			tl_x = 0;
		}
	}
};



	// var x_rect_c = 0;
	// var y_rect_c = 0;
	// var d_width = 0;
	// var d_height = 0;
	// for (var i = 1; i <= this.qty; i++)
	// {
	// 	this.ctx.rect(x_rect_c, y_rect_c, this.cell_size, this.cell_size + this.label_offset);
	// 	this.strokeStyle = '#000';
	// 	this.ctx.stroke();

	// 	x_rect_c = x_rect_c + this.cell_size;

	// 	if (d_width < x_rect_c) d_width = x_rect_c;

	// 	if ((i % this.cols) == 1) d_height += this.cell_size + this.label_offset;

	// 	if ((i % this.cols) == 0)
	// 	{
			
	// 		y_rect_c = y_rect_c + this.cell_size + this.label_offset;
	// 		x_rect_c = 0;

	// 	}
	// }