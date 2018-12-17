function dtts_range(satlong, eslat, eslong) {
	longdiffr = (eslong - satlong)/57.29578;
	p1 = 35786*35786;
	p2 = 2*6378.16*(35786+6378.16);
	p3 = 1 - Math.cos(eslat/57.29578)*Math.cos(-longdiffr);
	slantrange = Math.sqrt(p1 + p2*p3);
	return slantrange;
}

function dtts_hrange(satlong, eslat, eslong) {
	longdiffr = (eslong - satlong)/57.29578;
	p1 = 35786*35786;
	p2 = 2*6378.16*(35786 + 6378.16);
	p3 = 1 - Math.cos(eslat/57.29578)*Math.cos(-longdiffr);
	hubtts = Math.sqrt(p1 + p2*p3);
	return hubtts;
}

function calculate_dtts(data) {
	var json = $.parseJSON(data);

	slantrange  = dtts_range(json.satlon, json.remlat, json.remlon);
	hubtts		= dtts_hrange(json.satlon, json.hublat, json.hublon);
	remtts 		= slantrange/299,792458;
	dtts        = remtts - hubtts/299,792458;

	return 1000*dtts;
}