
/* 
Ticker functions
Most of code reused from Dygraphs tickers :
MIT-licensed, https://github.com/danvk/dygraphs/blob/master/dygraph-tickers.js
*/
var FrequencyPlannerTicker = function() {}

FrequencyPlannerTicker.frequencyTicks = function(a, b, pixels) {

	var pixels_per_tick = 40;

	var mults = [1, 2, 5, 10, 20, 50, 100];
    var base = 10;

    // Get the maximum number of permitted ticks based on the
    // graph's pixel size and pixels_per_tick setting.
    var max_ticks = Math.ceil(pixels / pixels_per_tick);

    // Now calculate the data unit equivalent of this tick spacing.
    // Use abs() since graphs may have a reversed Y axis.
    var units_per_tick = Math.abs(b - a) / max_ticks;

	// Based on this, get a starting scale which is the largest
	// integer power of the chosen base (10 or 16) that still remains
	// below the requested pixels_per_tick spacing.
	var base_power = Math.floor(Math.log(units_per_tick) / Math.log(base));
	var base_scale = Math.pow(base, base_power);

	// Now try multiples of the starting scale until we find one
	// that results in tick marks spaced sufficiently far apart.
	// The "mults" array should cover the range 1 .. base^2 to
	// adjust for rounding and edge effects.
	var scale, low_val, high_val, spacing;
	for (j = 0; j < mults.length; j++) {
		scale = base_scale * mults[j];
		low_val = Math.floor(a / scale) * scale;
		high_val = Math.ceil(b / scale) * scale;
		nTicks = Math.abs(high_val - low_val) / scale;
		spacing = pixels / nTicks;
		if (spacing > pixels_per_tick) 
			break;
	}

	// Construct the set of ticks.
	// Allow reverse y-axis if it's explicitly requested.
	ticks = [];
	if (low_val > high_val) scale *= -1;
	for (i = 0; i < nTicks; i++) {
		tickV = low_val + i * scale;
		ticks.push( {v: tickV} );
	}

	var round_number = function(num, dec) {
	    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
	}

	var pow = function(base, exp) {
		if (exp < 0) {
			return 1.0 / Math.pow(base, -exp);
		}
		return Math.pow(base, exp);
	};

	var formatter = function(x) {
		var maxNumberWidth = 4;
		var digits = 3;
		var label;

		// switch to scientific notation if we underflow or overflow fixed display.
		if (x !== 0.0 &&
		  (Math.abs(x) >= Math.pow(10, maxNumberWidth) ||
		   Math.abs(x) < Math.pow(10, -digits))) {
			label = x.toExponential(digits);
		}

		var k = 1000;
		var k_labels = [ 'K', 'M', 'B', 'T', 'Q' ];
		var absx = Math.abs(x);
		var n = pow(k, k_labels.length);
		for (var j = k_labels.length - 1; j >= 0; j--, n /= k) {
			if (absx >= n) {
				label =round_number(x / n, digits);// + k_labels[j];
				break;
			}
		}
		return label;// + 'Hz';
	}


	for (i = 0; i < ticks.length; i++) {
		if (ticks[i].label !== undefined) continue;  // Use current label.
		ticks[i].label = formatter(ticks[i].v);
	}

	return ticks.splice(1); //skip first
}


FrequencyPlannerTicker.SECONDLY = 0;
FrequencyPlannerTicker.TWO_SECONDLY = 1;
FrequencyPlannerTicker.FIVE_SECONDLY = 2;
FrequencyPlannerTicker.TEN_SECONDLY = 3;
FrequencyPlannerTicker.THIRTY_SECONDLY  = 4;
FrequencyPlannerTicker.MINUTELY = 5;
FrequencyPlannerTicker.TWO_MINUTELY = 6;
FrequencyPlannerTicker.FIVE_MINUTELY = 7;
FrequencyPlannerTicker.TEN_MINUTELY = 8;
FrequencyPlannerTicker.THIRTY_MINUTELY = 9;
FrequencyPlannerTicker.HOURLY = 10;
FrequencyPlannerTicker.TWO_HOURLY = 11;
FrequencyPlannerTicker.SIX_HOURLY = 12;
FrequencyPlannerTicker.DAILY = 13;
FrequencyPlannerTicker.WEEKLY = 14;
FrequencyPlannerTicker.MONTHLY = 15;
FrequencyPlannerTicker.QUARTERLY = 16;
FrequencyPlannerTicker.BIANNUAL = 17;
FrequencyPlannerTicker.ANNUAL = 18;
FrequencyPlannerTicker.DECADAL = 19;
FrequencyPlannerTicker.CENTENNIAL = 20;
FrequencyPlannerTicker.NUM_GRANULARITIES = 21;

FrequencyPlannerTicker.SHORT_SPACINGS = [];
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.SECONDLY]        = 1000 * 1;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TWO_SECONDLY]    = 1000 * 2;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.FIVE_SECONDLY]   = 1000 * 5;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TEN_SECONDLY]    = 1000 * 10;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.THIRTY_SECONDLY] = 1000 * 30;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.MINUTELY]        = 1000 * 60;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TWO_MINUTELY]    = 1000 * 60 * 2;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.FIVE_MINUTELY]   = 1000 * 60 * 5;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TEN_MINUTELY]    = 1000 * 60 * 10;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.THIRTY_MINUTELY] = 1000 * 60 * 30;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.HOURLY]          = 1000 * 3600;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TWO_HOURLY]      = 1000 * 3600 * 2;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.SIX_HOURLY]      = 1000 * 3600 * 6;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.DAILY]           = 1000 * 86400;
FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.WEEKLY]          = 1000 * 604800;

FrequencyPlannerTicker.LONG_TICK_PLACEMENTS = [];
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.MONTHLY] = {
  months : [0,1,2,3,4,5,6,7,8,9,10,11], 
  year_mod : 1
};
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.QUARTERLY] = {
  months: [0,3,6,9], 
  year_mod: 1
};
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.BIANNUAL] = {
  months: [0,6], 
  year_mod: 1
};
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.ANNUAL] = {
  months: [0], 
  year_mod: 1
};
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.DECADAL] = {
  months: [0], 
  year_mod: 10
};
FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[FrequencyPlannerTicker.CENTENNIAL] = {
  months: [0], 
  year_mod: 100
};



FrequencyPlannerTicker.dateSetters = {
  ms: Date.prototype.setMilliseconds,
  s: Date.prototype.setSeconds,
  m: Date.prototype.setMinutes,
  h: Date.prototype.setHours
};

/**
 * This is like calling d.setSeconds(), d.setMinutes(), etc, except that it
 * adjusts for time zone changes to keep the date/time parts consistent.
 *
 * For example, d.getSeconds(), d.getMinutes() and d.getHours() will all be
 * the same before/after you call setDateSameTZ(d, {ms: 0}). The same is not
 * true if you call d.setMilliseconds(0).
 *
 * @type {function(!Date, Object.<number>)}
 */
FrequencyPlannerTicker.setDateSameTZ = function(d, parts) {
  var tz = d.getTimezoneOffset();
  for (var k in parts) {
    if (!parts.hasOwnProperty(k)) continue;
    var setter = FrequencyPlannerTicker.dateSetters[k];
    if (!setter) throw "Invalid setter: " + k;
    setter.call(d, parts[k]);
    if (d.getTimezoneOffset() != tz) {
      d.setTime(d.getTime() + (tz - d.getTimezoneOffset()) * 60 * 1000);
    }
  }
};

FrequencyPlannerTicker.hmsString_ = function(date) {
    var zeropad = function(x) {
		if (x < 10) return "0" + x; else return "" + x;
	};
  var d = new Date(date);
  if (d.getSeconds()) {
    return zeropad(d.getHours()) + ":" +
           zeropad(d.getMinutes()) + ":" +
           zeropad(d.getSeconds());
  } else {
    return zeropad(d.getHours()) + ":" + zeropad(d.getMinutes());
  }
};

FrequencyPlannerTicker.dateAxisFormatter = function(date, granularity, options) {
	
	var zeropad = function(x) {
		if (x < 10) return "0" + x; else return "" + x;
	};

	date = new Date(date.getTime() + options.tzOffset * 1000);   //from utc to local server
  var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); //to js utc
  date_utc.addSeconds($('#tzoffset').val());  //to js local
  var date = date_utc;

	return date.getFullYear()+'-'+zeropad(date.getMonth()+1)+'-'+zeropad(date.getDate()) 
		+ ' ' +FrequencyPlannerTicker.hmsString_(date.getTime());

	var monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

	if (granularity >= FrequencyPlannerTicker.DECADAL) {
		return date.getFullYear();
	} else if (granularity >= FrequencyPlannerTicker.MONTHLY) {
		return monthNames[date.getMonth()] + '/' + date.getFullYear();
	} else {
		var frac = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + date.getMilliseconds();
		if (frac === 0 || granularity >= FrequencyPlannerTicker.DAILY) {
			var d = new Date(date.getTime() + 3600*1000)
			return d.getDate() + ' ' + monthNames[d.getMonth()];
		} else {
			return FrequencyPlannerTicker.hmsString_(date.getTime());
		}
	}
};

FrequencyPlannerTicker.getDateAxis = function(start_time, end_time, granularity, options) {

  var formatter = FrequencyPlannerTicker.dateAxisFormatter;
  var ticks = [];
  var t;

  if (granularity < FrequencyPlannerTicker.MONTHLY) {
    // Generate one tick mark for every fixed interval of time.
    var spacing = FrequencyPlannerTicker.SHORT_SPACINGS[granularity];

    // Find a time less than start_time which occurs on a "nice" time boundary
    // for this granularity.
    var g = spacing / 1000;
    var d = new Date(start_time);
    FrequencyPlannerTicker.setDateSameTZ(d, {ms: 0});

    var x;
    if (g <= 60) {  // seconds
      x = d.getSeconds();
      FrequencyPlannerTicker.setDateSameTZ(d, {s: x - x % g});
    } else {
      FrequencyPlannerTicker.setDateSameTZ(d, {s: 0});
      g /= 60;
      if (g <= 60) {  // minutes
        x = d.getMinutes();
        FrequencyPlannerTicker.setDateSameTZ(d, {m: x - x % g});
      } else {
        FrequencyPlannerTicker.setDateSameTZ(d, {m: 0});
        g /= 60;

        if (g <= 24) {  // days
          x = d.getHours();
          d.setHours(x - x % g);
        } else {
          d.setHours(0);
          g /= 24;

          if (g == 7) {  // one week
            d.setDate(d.getDate() - d.getDay());
          }
        }
      }
    }
    start_time = d.getTime();

    // For spacings coarser than two-hourly, we want to ignore daylight
    // savings transitions to get consistent ticks. For finer-grained ticks,
    // it's essential to show the DST transition in all its messiness.
    var start_offset_min = new Date(start_time).getTimezoneOffset();
    var check_dst = (spacing >= FrequencyPlannerTicker.SHORT_SPACINGS[FrequencyPlannerTicker.TWO_HOURLY]);

    for (t = start_time; t <= end_time; t += spacing) {
      d = new Date(t);

      // This ensures that we stay on the same hourly "rhythm" across
      // daylight savings transitions. Without this, the ticks could get off
      // by an hour. See tests/daylight-savings.html or issue 147.
      if (check_dst && d.getTimezoneOffset() != start_offset_min) {
        var delta_min = d.getTimezoneOffset() - start_offset_min;
        t += delta_min * 60 * 1000;
        d = new Date(t);
        start_offset_min = d.getTimezoneOffset();

        // Check whether we've backed into the previous timezone again.
        // This can happen during a "spring forward" transition. In this case,
        // it's best to skip this tick altogether (we may be shooting for a
        // non-existent time like the 2AM that's skipped) and go to the next
        // one.
        if (new Date(t + spacing).getTimezoneOffset() != start_offset_min) {
          t += spacing;
          d = new Date(t);
          start_offset_min = d.getTimezoneOffset();
        }
      }

      var v = t*0.001;
      ticks.push({ v: v,
                   label: formatter(d, granularity, options)
                 });
    }
  } else {
    // Display a tick mark on the first of a set of months of each year.
    // Years get a tick mark iff y % year_mod == 0. This is useful for
    // displaying a tick mark once every 10 years, say, on long time scales.
    var months;
    var year_mod = 1;  // e.g. to only print one point every 10 years.

    if (granularity < FrequencyPlannerTicker.NUM_GRANULARITIES) {
      months = FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[granularity].months;
      year_mod = FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[granularity].year_mod;
    } else {
      FrequencyPlannerTicker.warn("Span of dates is too long");
    }

    var start_year = new Date(start_time).getFullYear();
    var end_year   = new Date(end_time).getFullYear();
    var zeropad = function(x) {
		if (x < 10) return "0" + x; else return "" + x;
	};

	var dateStrToMillis = function(str) {
		return new Date(str).getTime();
	};

    for (var i = start_year; i <= end_year; i++) {
      if (i % year_mod !== 0) continue;
      for (var j = 0; j < months.length; j++) {
        var date_str = i + "/" + zeropad(1 + months[j]) + "/01";
        t = dateStrToMillis(date_str);
        if (t < start_time || t > end_time) continue;

        var v = t*0.001;
        ticks.push({ v: v,
                     label: formatter(new Date(t), granularity, options)
                   });
      }
    }
  }

  return ticks;
};





FrequencyPlannerTicker.dateTicks = function(a, b, pixels, options) {

	a *= 1000;
	b *= 1000;

	var numDateTicks = function(start_time, end_time, granularity) {
		if (granularity < FrequencyPlannerTicker.MONTHLY) {
			// Generate one tick mark for every fixed interval of time.
			var spacing = FrequencyPlannerTicker.SHORT_SPACINGS[granularity];
			return Math.floor(0.5 + 1.0 * (end_time - start_time) / spacing);
		} else {
			var tickPlacement = FrequencyPlannerTicker.LONG_TICK_PLACEMENTS[granularity];
			var msInYear = 365.2524 * 24 * 3600 * 1000;
			var num_years = 1.0 * (end_time - start_time) / msInYear;
			return Math.floor(0.5 + 1.0 * num_years * tickPlacement.months.length / tickPlacement.year_mod);
		}
	};

	var pickDateTickGranularity = function(a, b, pixels) {
		var pixels_per_tick = 35;
		for (var i = 0; i < FrequencyPlannerTicker.NUM_GRANULARITIES; i++) {
			var num_ticks = numDateTicks(a, b, i);
			if (pixels / num_ticks >= pixels_per_tick) {
				return i;
			}
		}
		return -1;
	};

	var chosen = pickDateTickGranularity(a, b, pixels);
	if (chosen >= 0) {
		return FrequencyPlannerTicker.getDateAxis(a, b, chosen, options);
	} else {
		return [];
	}

}