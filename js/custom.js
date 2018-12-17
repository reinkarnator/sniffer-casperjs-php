var graphs = {};
var updateIntervalID = 0;
var updateTimeoutID = 0;

// acm statistics
var asv = null;

// process tree state
var prev_tree_state = [];
var treeState = {items: {}, warn: {}, err: {}, expand: {}, timer: {}};

// extended stat websocket
var ws_queue = [];
var ws = null;

(function ($){
    $.fn.timepicker = function () {
        mask = /^([01]\d|2[0123]):([0-5]\d)$/;

        // /^\d{0,2}:\d{0,2}$/;
        
        var pad = function(what) {
            what = what + "";
            return (what.length < 2) ? '0'+what : what;
        }

        var h = function(el) {
            return pad(el.value.substring(0,2));
        }

        var m = function(el) {
            return pad(el.value.substring(3,el.value.length));
        }
    
        var curofs = 0;
        var focused = 0;
        $(this).bind('selectstart', false);
        $(this).click(function(event){
            /*if (focused) {
                focused = 0;
                this.selectionStart = 0;
                this.selectionEnd = 2;
                return false;
            }*/
            if(this.selectionStart < 2) {
                this.selectionStart = 0;
                this.selectionEnd = 2;
            } else {
                this.selectionStart = 3;
                this.selectionEnd = 5;
            }
        });
        $(this).focus(function(event){
            focused = 1;
        });

        $(this).mouseup(function(e) { return false; });

        $(this).keydown(function (event) {
            var s_st = this.selectionStart;
            var s_en = this.selectionEnd;

            if(event.keyCode == 9) //tab
                return true;

            if (event.keyCode == 36 ||  //home
                event.keyCode == 35) { //end
                this.selectionStart = s_st; //restore selection
                this.selectionEnd = s_en;
                return false;
            }

            if (event.keyCode == 8 || //backspace
                event.keyCode == 46) { //delete
                if (this.selectionStart < 2) {
                    this.value = '00:' + m(this);
                } else {
                    this.value = h(this) + ':00';
                }
                this.selectionStart = s_st; //restore selection
                this.selectionEnd = s_en;
                return false;
            }

            if (event.keyCode == 38) { //up
                if (this.selectionStart < 2) {
                    var hours = parseInt(h(this), 10) + 1;
                    if (hours > 23) hours = 0;
                    this.value = pad(hours) + ':' + m(this);
                } else {
                    var minutes = parseInt(m(this), 10) + 1;
                    if (minutes > 59) minutes = 0;
                    this.value = h(this) + ':' + pad(minutes);
                }
                this.selectionStart = s_st; //restore selection
                this.selectionEnd = s_en;
                return false;
            } else if (event.keyCode == 40) { //down
                if (this.selectionStart < 2) {
                    var hours = parseInt(h(this), 10) - 1;
                    if (hours < 0) hours = 23;
                    this.value = pad(hours) + ':' + m(this);
                } else {
                    var minutes = parseInt(m(this), 10) - 1;
                    if (minutes < 0) minutes = 59;
                    this.value = h(this) + ':' + pad(minutes);
                }
                this.selectionStart = s_st; //restore selection
                this.selectionEnd = s_en;
                return false;
            }


            if (event.keyCode == 39) { //right
                this.selectionStart = 3;
                this.selectionEnd = 5;
                return false;
            }
            else if (event.keyCode == 37) { //left
                curofs = 0;
                this.selectionStart = 0;
                this.selectionEnd = 2;
                return false;
            }

            this.selectionStart = s_st; //restore selection
            this.selectionEnd = s_en;
        });


        $(this).keypress(function (event) {
            if (!event.charCode) return true;
            var ch = String.fromCharCode(event.charCode);
            if (!(/^\d$/).test(ch))
                return false;

            var s_st = this.selectionStart;
            var s_en = this.selectionEnd;

            var part1 = this.value.substring(0, curofs + s_st);
            var part2 = this.value.substring(curofs + s_st + 1 , this.value.length);
            
            curofs++;
            curofs&=1;
            
            if (s_st == 0 && curofs == 0) {  //move cursor to minutes
                s_st = 3;
                s_en = 5;
            }

            //limit num


//            if (!mask.test(part1 + ch + part2))
  //              return false;

            this.value = part1 + ch + part2;

            if (parseInt(h(this), 10) > 23) {
                this.value = '23:' + m(this);
            }
            if (parseInt(m(this), 10) > 59) {
                this.value = h(this) + ':59';
            }

            this.selectionStart = s_st; //restore selection
            this.selectionEnd = s_en;
            return false;
        });
    };
})(jQuery);


function ipMaskShorten(mask) {

    var dec2bin = function(dec) {
        var num = parseInt(dec, 10);
        var res = num.toString(2);
        while(res.length < 8)
            res = "0"+res;

        return res;
    }

    var octets = mask.split('.');
    var res = 32;
    var binary = dec2bin(octets[0])+dec2bin(octets[1])+dec2bin(octets[2])+dec2bin(octets[3]);
    for (var i=0; i<32; i++) {
        if (binary.substring(i,i+1) != '1') {
            res = i;
            break;
        }
    }
    return res;
}

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function tree_toggle(event) {

	if (!$(event.target).hasClass('Expand'))
        return; // клик не там
	
    var node = $(event.target).parent(); // Node, на который кликнули
    if (node.hasClass('ExpandLeaf'))
        return; // клик на листе

    var node_name = node.attr('id');
    if (node.hasClass('ExpandOpen')){
        node.children('ul').slideUp('fast', function(){
            node.removeClass('ExpandOpen').addClass('ExpandClosed');
        });
        if (supports_html5_storage()) {
            localStorage[node_name] = 1; //collapsed
        }
    }
    else {
        node.removeClass('ExpandClosed').addClass('ExpandOpen');
        node.children('ul').slideDown('fast', function(){});
        if (supports_html5_storage()) {
            delete localStorage[node_name];
        }
    }
}




var soundEmbed = null;
var ding = function() {
    var which = 'wine-glass';
    if (!soundEmbed) {
        soundEmbed = document.createElement("embed");
        soundEmbed.setAttribute("src", "/images/"+which+".wav");
        soundEmbed.setAttribute("hidden", true);
        soundEmbed.setAttribute("autostart", true);
    } else {
        document.body.removeChild(soundEmbed);
        soundEmbed.removed = true;
        soundEmbed = null;
        soundEmbed = document.createElement("embed");
        soundEmbed.setAttribute("src", "/images/"+which+".wav");
        soundEmbed.setAttribute("hidden", true);
        soundEmbed.setAttribute("autostart", true);
    }
    soundEmbed.removed = false;
    document.body.appendChild(soundEmbed);
}


var jqHtmlUpdateCompare = function(src, dest) {
    if (src.text() != dest.text()) {

        if ( src.find('#detailed').length ) {
            if (dest.find('#detailed').is(':visible')) 
                src.find('#detailed').show();
            else
                src.find('#detailed').hide();
        }

        dest.html(src.html());

        if ( src.find('#detailed').length ) {
            $('.clear_remote').click(function() {
                if (confirm( $('clear_remote_msg').text() ) ) {
                     updateTick([{ 'what' : 'clearremote', datasrc: 11 }]);
                }
            })
        }
    }
}
// other
var updateRequest = [{ 'what' : 'navigation'}]; //always
var subscribe = function(obj) {

    for (u in updateRequest) {      //update existing
        if(updateRequest[u].what == obj.what
            && updateRequest[u].datasrc == obj.datasrc ) {
            updateRequest[u] = obj;
        return;
        }
    }

    updateRequest.push(obj);
}
var unsubscribeAll = function(obj) {
    updateRequest = [{ 'what' : 'navigation'}];
}

var clientDelta = 0;

var updateTick = function(obj) { // what, datasrc, from, to){

    var req = JSON.stringify( obj ? obj : updateRequest);
    var requestStartTime = moment.utc().valueOf();

    if (this.fpc) {
        this.fpc.updateTimestamps(updateRequest);
    }
    

    $.ajax({
        url: '/update/',
        type: "POST",
        data: { "req" : req},
        success: function(data) {

            //apply changes
            var jqObject = $('<div>' + data + '</div>');    //wrap to parse

            //syncronization
            var ts = jqObject.find('#timestamp');
            if (ts.length && updateTimeoutID == 0) {
                var requestEndTime = moment.utc().valueOf();
                var tripTime = (requestEndTime - requestStartTime) / 2;
                var serverTime = Number(ts.val());
                clientDelta = requestEndTime - tripTime - serverTime;
                var nextUpdateAt = ((Math.floor(serverTime / 5000) * 5000) + 5000) + clientDelta;
                var timeUntilNextUpdate = Math.ceil(nextUpdateAt - requestEndTime) + 100; //next - now  + small_delta
                clearInterval(updateIntervalID);    //reschedule
                updateTimeoutID = setTimeout(function() {  //call on timer if we occasionally skip tick next time
                    updateIntervalID = setInterval(updateTick, 5000);
                    clearTimeout(updateTimeoutID);
                    updateTimeoutID = 0;
                    updateTick();
                }, timeUntilNextUpdate);
                //debugger;
                //console.log('now ' + moment.utc().format() + '; next at' + moment.utc(nextUpdateAt).format());
            }

            if (jqObject.find('#groupdata').length) {
                $('#groupdata').html(jqObject.find(' #groupdata').html());
                bind_address();
            }
            $('#network-name').html(jqObject.find('#network-name').html());


            //graph changed
            if ( jqObject.find('.graphupdate').length ) {
                $('.gdatasrc').each(function(){
                    var dsrc = jqObject.find('.gdatasrc');
                    for (var i = dsrc.length - 1; i >= 0; i--) {
                        if ($(this).text() == $(dsrc[i]).text()) {
                            pushtograph(
                                $(this).text(),
                                $(dsrc[i]).closest('.graphupdate').find('.gdata').text(),
                                $(dsrc[i]).closest('.graphupdate').find('.gannotations').text()
                            );
                        }
                    }

                });
            }

            if ( jqObject.find('.ip_and_static_list_result').length ) {
                var result = jqObject.find('.ip_and_static_list_result').text();
                result = JSON.parse(result);

                $(".ip_and_static_list option").remove();
                var select = $(".ip_and_static_list");
                $.each(result, function() {
                    select.append($("<option />").val(this.id).text(this.text));
                });
                select.val(select.attr('data-selected-item'));
            }
            

            if ( jqObject.find('.widgetdatasrc').length ) {
                $('.widgetdatasrc').each(function() {
                    var dsrc = jqObject.find('.widgetdatasrc');
                    for (var i = dsrc.length - 1; i >= 0; i--) {
                        var sourceequal = ($(this).val() == $(dsrc[i]).val());
                        if (sourceequal) {
                            var w_p = $(this).closest('.widgetparent');
                            var dsrc_p = $(dsrc[i]).closest('.widgetparent');
                            jqHtmlUpdateCompare(dsrc_p, w_p);
                        }
                    }
                });
                bind_address();
                bind_widget_handlers();

            }

            //tree changed
            if ( jqObject.find('#nav_tree .Container').length ) {
                $('#nav_tree').html(jqObject.find('#nav_tree').html());
                onContentReady();
                processTreeState();
                hideTreeItems();
            } else {
                if ( jqObject.find('#tree_faults').length ) {    //tree updated
                    $('#tree_faults').val(jqObject.find('#tree_faults').val());
                    processTreeState();
                    //hideTreeItems();
                }
            }

            //core status changed
            if ( jqObject.find('#corestart').length ) {
                $('#corestart').html(jqObject.find('#corestart'));
                onContentReady();
            }

            //frequency planner
            if ( jqObject.find('#fpdata').length ) {
                if (fpc && fpc.f) {
                    var data = JSON.parse(jqObject.find('#fpdata').html());
                    fpc.f.update(data, false);
                }
            }

            //frequency display
            if ( jqObject.find('#frequency_plan').length ) {
                if (fpc && fpc.fdisp) {
                    var data = JSON.parse(jqObject.find('#frequency_plan').html());
                    fpc.fdisp.update(data, false);
                }
            }

            // acm stat update display
            if ( jqObject.find('#widget_controller_acm_stat').length )
            {
                if (asv)
                {
                    var data = JSON.parse(jqObject.find('#widget_controller_acm_stat').html());
                    asv.update(data);
                }
            }
        
            // world map
            if ( jqObject.find('#world-map-markers-update').length ) {
                updated_markers = jqObject.find('#world-map-markers-update').text();
 
                if ( $('#world-map').length ) {
                    var current_markers = $('#world-map-markers').text();
                    if ( current_markers != updated_markers ) $('#world-map-markers').text(updated_markers);
                    
                    if ( $('.world-map-tool-item-offline').hasClass('selected') ) {
                        var updated_markers_parsed = $.parseJSON(updated_markers);
                        var current_markers_parsed = $.parseJSON(current_markers);

                        for ( var key in current_markers_parsed ) {
                            if ( !(key in updated_markers_parsed) ) {
                                worldMap.removeLayer(worldMapMarkers[key]);
                            }

                            if ( key in updated_markers_parsed ) {
                                if ( updated_markers_parsed[key].state != current_markers_parsed[key].state ) {
                                    if ( updated_markers_parsed[key].state == 1 ) {
                                        worldMapMarkers[key].setIcon(iconDown);
                                    } else {
                                        worldMapMarkers[key].setIcon(iconUp);
                                    }
                                }

                            }
                        }

                        for ( var key in updated_markers_parsed ) {
                            if ( !(key in current_markers_parsed) ) {
                                var icon = iconUp;
                                if ( updated_markers_parsed[key].state == 1 ) icon = iconDown;

                                var marker = new L.marker(L.latLng(updated_markers_parsed[key].latlng[0], updated_markers_parsed[key].latlng[1]), {icon: icon}).bindPopup('<a href="/remote_dashboard/' + key + '/" class="remote-link">' + updated_markers_parsed[key].name + '</a>');
                                worldMapMarkers[key] = marker;
                                marker.addTo(worldMap);
                            }
                        }
                    }
                }
            }

            if ( jqObject.find('#widget_remote_params_update').length )
            {
                var data = jqObject.find('#widget_remote_params_update').html();
                var params = $.parseJSON(data);

                $('#remote_status').html(params.remote_status);
                $('#remote_bad_state').html(params.remote_bad_state);
                $('#remote_good_state').html(params.remote_good_state);
                $('#remote_tx_sp').html(params.remote_tx_sp);
                $('#remote_rx_sp').html(params.remote_rx_sp);
                $('#remote_cn_rem').removeClass().addClass(params.remote_cn_rem_class);
                $('#remote_cn_rem').html(params.remote_cn_rem);
                $('#remote_cn_hub').removeClass().addClass(params.remote_cn_hub_class);
                $('#remote_cn_hub').html(params.remote_cn_hub);
                $('#remote_txlvl').html(params.remote_txlvl);
                $('#remote_txname').html(params.remote_txname);
                $('#remote_rxname').html(params.remote_rxname);
                $('#remote_ip_list').html(params.remote_ip_list);
                $('#remote_access').html(params.remote_access);
                $('#remote_serial_num').html(params.remote_serial_num);
                $('#remote_location').html(params.remote_location);
                $('#remote_comment').html(params.remote_comment);
                $('#remote_weather').html(params.remote_weather);
            }

            if ( jqObject.find('#widget_controller_acm_stat').length )
            {
                $('#acm_stat_data').html(jqObject.find('#widget_controller_acm_stat').html())
            }

            $('#nav .inner #alert').hide();

        },
        error: function() {
            $('#nav .inner #alert').show();
        }
    });
};



function page_refresh() {
    //$.address.update();
    onContentLoad($.address.value());
}

//ajax router
var need_load = true;
$.address.change(function(event) {

    if (need_load)
        onContentLoad(event.value);

});

function replaceContent(data) {
    var jqObject = $('<div>' + data + '</div>');    //wrap to parse

    if ( jqObject.find('#redirect_to').length) {
        $.address.value(jqObject.find('#redirect_to').val());
        return false;
    }

    if ( jqObject.find('#switch_object').length) {
        var obj = jqObject.find('#switch_object').val();
        var el = $('#menuitem_' + obj);
        if (el.length) {
            $('#nav_tree span').removeClass('nav_selected');
            $('#nav_tree .li_marker').remove();
            $('#nav_tree .triangle_marker').remove();

            el.addClass('nav_selected');
            var li_wrap = $('#'+el.attr('id').replace('item', 'group'));
            li_wrap.prepend('<div class="li_marker"></div><div class="triangle_marker"></div>');

            $('#nav_tree').animate({
                scrollTop: $(".li_marker").offset().top
            }, 2000);
        }
    }

    if (jqObject.find('.contentContainer').length) {
        $('.menuContainer').html(jqObject.find('.menuContainer').html());
        $('.contentContainer').html(jqObject.find('.contentContainer').html());


        if (jqObject.find('.xdebug-var-dump').length)
            $('.contentContainer').append('<div>'+jqObject.find('.xdebug-var-dump').html()+'</div');

    } else {
        $('.contentContainer').html(data);
    }

    return true;
}

function onContentLoad(path, params) {

    if(typeof params === 'undefined')
        params = {};

    $.get(path, params, function(data) {
        if ( replaceContent(data) ) {
            onContentReady();
        }
    });
}


var updateEverySecond = function() {

    //scheduler timers
    var formatTime = function(timestamp) {

        var date = moment.utc(timestamp*1000 + clientDelta);
        //date.add('seconds', $('#tzoffset').val());
        var now = moment.utc();
        //now.add('seconds', $('#tzoffset').val());

        var diff = date.diff(now);
        var diff_date = moment.utc(diff);

        if (diff > 60 * 60 * 1000)
            return [diff_date.format("H:mm"), 0];

        var blink = 0;
        if (diff < 60 * 1000)  //warn about incoming events
            blink = 1;

        return [diff_date.format("mm:ss"), blink];
    }

    $('span.timer').each(function() {
        var timestamp = parseInt($(this).attr('data-time-left'), 10);
        var running = parseInt($(this).attr('data-running'), 10);
        var time = formatTime(timestamp);
        
        $(this).text(time[0]);
        if (!running && time[1])
            $(this).addClass('blink');
        else 
            $(this).removeClass('blink');

    });
}

function processTreeState() {

    /*
    var state = [
        { id : "1_0_0", "err" : "+90", "warn" : "+150", "fail" : 1 },
        { id : "20_0_0", "err" : "+90", "warn" : "+150", "fail" : 1 },
        ];
    */

    var start = new Date().getTime();

    //var tree = $('#nav_tree').detach();

    var jsonstr = $('#tree_faults').val();
    var state = JSON && JSON.parse(jsonstr) || $.parseJSON(jsonstr);

    $('.fail').removeClass('fail');
    $('.off').removeClass('off');
    $('.conf').removeClass('conf');
    $('.redundant').removeClass('redundant');
    $('.Content .warn').text('');
    $('.Content .err').text('');
    $('.running').removeClass('running');

    for (var i = 0; i < state.length; i++) {
        var item = $('#menuitem_' + state[i].id);
        var children = $('#menugroup_' + state[i].id + ' span');
        var warn = (state[i].warn != 0) ? '+'+state[i].warn : '';
        var err = (state[i].err != 0) ? '+'+state[i].err : '';
        item.parent().find('.warn').text(warn);
        item.parent().find('.err').text(err);

        if( state[i].fail == 1) {
            children.addClass('fail');
        } else if( state[i].fail == 2) {
            children.addClass('off');
        } else if( state[i].fail == 3) {
            children.addClass('conf');
        } else if( state[i].fail == 4) {
            children.addClass('redundant');
        }

        if( state[i].running > 0) {
            children.addClass('running');
        }

        //timer processing
        var time = state[i].timer;
        var icondiv = item.closest('li').children('.Expand');   //instead of icon
        if (state[i].timer) {
            if (!icondiv.children('span').length) {
                icondiv.html($('<span>').addClass('timer'));
            }
            icondiv.children('span.timer').attr('data-time-left', time);
            icondiv.children('span.timer').attr('data-running', state[i].running);
        } else {
            icondiv.children('span.timer').remove();
        }

        if (i % 100 == 0) {
            var now = new Date().getTime();
            console.log(i + " : " + (now-start));
        }
    };

    //$('#nav_tree').replaceWith(tree);

    var end = new Date().getTime();
    console.log('Tree state processed in: ' + (end-start));
}

var ganttInterval = 0;

function bind_address() {
    $('a:not(.noaddr,.select2-search-choice-close,.ui-datepicker a, #world-map a, .dataTables_wrapper a)').address(function() {
        if ($(this).attr('href'))
            return $(this).attr('href').replace(/^#/, '');

        return "";
    });
}


function addDbFieldsHandlers() {
    $('input.db').on('keypress', function(e){

        if (e.ctrlKey || e.altKey || e.metaKey || e.which<32)
            return true;

        var inp = String.fromCharCode(e.which);
        var val = $(this).val();
        if (!inp.match(/[\d]/)) {
            if (val.indexOf('.') == -1)
                val += '.'

            e.preventDefault();
        } else {

            var s = $(this).get(0).selectionStart;       
            var e = $(this).get(0).selectionEnd;
            if (e-s > 0)
                val = '';

            if (val.length > 4)
                val = parseFloat(val).toFixed(1);
        }

        $(this).val(val);
    });

    $('input.db').on('blur', function(){
        var val = $(this).val();
        val = parseFloat(val).toFixed(1);
        if (!isNaN(val))
            $(this).val(val);
        else
            $(this).val('0.0');
    });
}



function bind_monitoring_group_events() {
    
}

function bind_widget_handlers() {

    if($('.allocation_stop').length) {
        $('.allocation_stop').click(function() {
            var allocation_id = $(this).attr('data-allocation-id');
            $.get('/frequency_plan/'+ allocation_id + '/delete/', null, function() {
                updateTick();
            }); 
        })
    }

    if($('.allocation_disable').length) {
        $('.allocation_disable').click(function() {
            var allocation_id = $(this).attr('data-allocation-id');
            $.get('/frequency_plan/'+ allocation_id + '/disable/', null, function() {
                updateTick();
            }); 
        })
    }
}

function bindDataTables() {
    //remote table datatables


    var object = $('.datatables:first');
//object.find('th').each
    var columns = object.find('th').map(function() {
        return { data : $(this).attr('data-name') };
    });



    var tables = object.DataTable({
        "scrollY":        600,
        //"paging":         false,
        "dom":            "CfrtiS",
        "ajax" : '/remote/?update',
        "serverSide": true,
        "deferRender": true,
        "columns": columns,

        initComplete: function ()
        {
            $('.dataTables_scrollFoot').prependTo('.dataTables_scroll');
            $('.dataTables_scrollBody tfoot').hide();
       
            $('.datatables tfoot th').each( function (index) {
                var th = $( $('.datatables thead th')[index] );
                var title = th.text();
                console.log(th.width());

                if (index != 0) {

                    var input = $('<input type="text" placeholder="'+title+'" />');
                    input.width(th.width());

                    $(this).append(input);
                }
            } );

            var tables = object.DataTable();
            tables.columns()
                .eq( 0 )
                .each( function ( colIdx ) {
                $( 'input', tables.column( colIdx ).footer() ).on( 'keyup change', function () {
                    tables
                        .column( colIdx )
                        .search( this.value )
                        .draw();
                } );
            } );
        }
    });


}


var graphClickCallback = null;


var fpc = null;

function onContentReady() {
    unsubscribeAll();

    $('.controller_insert').prop("disabled", true).addClass('disabled');
    setTimeout(function() { $('.controller_insert').prop("disabled", false).removeClass('disabled'); }, 3000);
    $('.notice:not(.log .notice)').delay(3000).hide("slide", { direction: "up" }, 200);

/*
    var calcshadow = function() {
        if ($('.topContainer').get(0).scrollHeight > $('.topContainer').get(0).clientHeight) {
            $('.groupshadow').show(500);
        } else {
            $('.groupshadow').show(500);
        }
    }
    calcshadow();
    $('ul.tabs span[alt^="#"]').live('click', function(e){ calcshadow(); });
*/

    //kickstart tabs


    if ($('.faketab').length) {
        $('.faketab').click(function() {
            var addr = $(this).attr('data-url');
            $.address.value(addr);
        })
    }

    $('.tab-content').addClass('clearfix').not(':first').hide();
    $('ul.tabs').each(function(){
        var current = $(this).find('li.current');

        if(current.length < 1) { $(this).find('li:first').addClass('current'); }
        current = $(this).find('li.current span').attr('alt');
        $(current).show();
    });

    var hash = $.address.hash();
    if (hash && hash.substring(0,3) == 'tab') {
        $('ul.tabs').find('li span[alt=#'+hash+']').click();
    }

    var flag_ihelp;

    // integrated help
    $('.ihelp').mouseenter( function() {
        flag_ihelp = true;

        var selected = $(this);

        var offset = selected.offset();

        var param_title = selected.attr('id');
        param_title = param_title.replace(/ihelp-/g, '').replace(/[\[]/g, '_').replace(/[\]]/g, '');

        var obj = [{ what: 'ihelp', datasrc: param_title, from: 0, to: 0 }];
        var req = JSON.stringify( obj ? obj : '');

        $.ajax({
            url: '/update/',
            type: 'POST',
            data: { req: req },

            success: function(data) {
                if ( data != '' && flag_ihelp ) {
                    $('.ihelp-message').css({ top: offset.top, left: (offset.left + 20) }).html(data).show();
                }
            }
        });
    });

    $('body').on('mouseleave', '.ihelp', function()
    {
        flag_ihelp = false;
        $('.ihelp-message').hide();
    });

    // $("form").submit(function() {  
    $("form").off('submit').on('submit', function() { // avoid multiple bindings in case contentReady called several times
        var url = $(this).attr('action');
        if (!url)
            url = $.address.path()

        var form = $(this);

        if (validate($(this))) {

            var postdata = form.serializeArray();
            var unchecked = $(this).find('input:checkbox:not(:checked)');
            for (var i = 0; i < unchecked.length; i++) {
                postdata.push({ name : $(unchecked[i]).attr('name'), value : 0});
            };

            $.post(url, postdata, function(data) {
                var jqObject = $('<div>' + data + '</div>');
                if ( jqObject.find('#redirect_to').length) {
                    $.address.value(jqObject.find('#redirect_to').val());
                    return;
                }

                    if ( jqObject.find('#redirect_page').length) {
                        window.location = jqObject.find('#redirect_page').val();
                        return;
                    }

                need_load = false;
                $.address.value(url);
                need_load = true;
                replaceContent(data);
                onContentReady();
            }).error(function(jqXHR, textStatus, errorThrown){
                replaceContent('<div class=".contentContainer">'
                    + "Ajax form submit error: "
                    + errorThrown + ' at '
                    + url
                    + '</div>');
            });
        }

        return false;
    });

    bind_address();

    var fec_list_change = function(){

        var s1  = [0, 1, 2, 3, 4];
        var s2_sf = [5, 6, 7, 8, 9, 10, 11, 12, 13,  15, 16, 17, 18, 19,  21, 22, 23, 24, 25];
        var s2_lf = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

        var s2_mode = $('#dvb_mode input:checked').val();
        var frames_mode = $('.tdmtx_s2mode input:checked').val();
        var shown = [];

        if(s2_mode == 0) {
            shown = s1;
        } else {
            if(frames_mode == 2) {
                shown = s2_sf;
            } else {
                shown = s2_lf;
            }
        }

        var selectorlist = ['select[name=controlleredit\\[tdmtx_fec\\]]', 
            'select[name=controlleredit\\[acm_fec2\\]]',
            'select[name=controlleredit\\[acm_fec3\\]]',
            'select[name=controlleredit\\[acm_fec4\\]]',
        ]

        for (var j = 0; j < selectorlist.length; j++) {
            var sel = $(selectorlist[j]); 
            var selopt = sel.find('option');
            selopt.hide();
            var now_selected = parseInt(sel.find('option:checked').val(), 10);

            for(var i = 0; i < shown.length; i++)
                selopt.filter('option[value=' + shown[i] + ']').show();

            if (shown.indexOf(now_selected) == -1)  //switch to other fec
                sel.val(shown[0]);
        }
    }

    $('#dvb_mode input').change(function() {
        if ($(this).val() != 0) {    //dvb-s2
            $('.tdmtx_s2mode').show();
        } else {      //dvb-s1
            $('.tdmtx_s2mode').hide();
        }
        fec_list_change();
    });
    fec_list_change();

    $('.tdmtx_s2mode').change(function(){
        fec_list_change();
    });

    $('table.sortable').each(function(){
        $(this).find('thead th').each(function(index){$(this).attr('rel', index);});
        $(this).find('th,td').each(function(){$(this).attr('value', $(this).text());});
    });

    $('.controller_delete').click(function(){
       var id = $(this).attr('data-item');
       $.post('/controller_configure/'+id+'/delete/',
            function(data) {
                if (data.replace(/\s+/, '') == 'ok') {
                    $.address.value('/controller_configure/');
                }
                else
                    alert(data);
            })
        return false;
    });

    $('.controller_insert').one('click', function(){
        var self = $(this);
        if (self.prop('disabled'))
            return;

        self.prop("disabled", true).addClass('disabled');
        $.post('/controller_configure/insert/',
            $('#addcontroller').serializeArray(),
            function(data) {
                if (data.replace(/\s+/, '') == 'ok')
                    page_refresh();
                else
                    $('#adderror').html(data);
            })

        return false;
    });


    if ($('.policy_check').length){
        var typestr = 'input[name=policyrule\\[action\\]]';
        $(typestr).change(function(){
            var val = $(typestr+':checked').val();

            if (val == 0) {
                $('.policy_check').show();
                $('.policy_action').hide();
            } else {
                $('.policy_check').hide();
                $('.policy_action').show();
            }

        });
        $(typestr).change();

        var tstr = 'select[name=policyrule\\[check_type\\]]';
        $(tstr).change(function(){
            var val = $(tstr).val();
            if(val == 1 || val == 5 || val == 12) {
                $('.policy_ch_equal').show();
                $('.policy_range').hide();
                $('.policy_ip').hide();
            } else if (val == 6 || val == 7) {
                $('.policy_ch_equal').hide();
                $('.policy_range').hide();
                $('.policy_ip').show();
            } else {
                $('.policy_ch_equal').hide();
                $('.policy_range').show();
                $('.policy_ip').hide();
            }
        });
        $(tstr).change();

        var tstr2 = 'select[name=policyrule\\[action_type\\]]';
        $(tstr2).change(function(){
            var val = $(tstr2).val();
            if(val == 18) {
                $('.policy_equal').hide();
                $('.policy_select').show();
                $('.policy_acm').hide();
            } else if (val == 19) {
                $('.policy_equal').show();
                $('.policy_select').hide();
                $('.policy_acm').hide();
            } else if (val == 23) {
                $('.policy_equal').hide();
                $('.policy_select').hide();
                $('.policy_acm').show();
            } else {
                $('.policy_equal').hide();
                $('.policy_select').hide();
                $('.policy_acm').hide();
            }
        });
        $(tstr2).change();

    }


    if ($('#leavestatemsg').length)
        bind_monitoring_group_events();

    if ($('#routing_st_type').length) {
        var typestr = '#routing_st_type input';

        $(typestr).change(function(){
            var all = ['routing_address', 'routing_gw', 'routing_mc_stream', 'routing_mc_static', 'routing_hubside',
                'routing_la', 'routing_remote', 'routing_local', 'routing_con_st_qos', 'routing_st_con_qos', 'routing_st_side', 'routing_priv',
                'routing_st_routing', 'routing_st_bridge', 'routing_multicast_tx'];
            var show = [];
            var val = $(typestr+':checked').val();
            switch(val) {
                case 'rt_ip_station':
                    show = ['routing_con_st_qos', 'routing_st_side', 'routing_address', 'routing_la', 'routing_hubside', 'routing_priv', 'routing_st_routing']; break;
                case 'rt_static_station':
                    show = ['routing_con_st_qos', 'routing_st_side', 'routing_address', 'routing_gw', 'routing_hubside', 'routing_priv', 'routing_st_routing']; break;
                case 'rt_multicast_rx':
                    show = ['routing_mc_static', 'routing_address', 'routing_gw', 'routing_mc_stream']; break;
                case 'rt_multicast_tx':
                    show = ['routing_st_side', 'routing_address', 'routing_multicast_tx', 'routing_hubside', 'routing_st_routing']; break;
                case 'rt_backroute':
                    show = ['routing_st_con_qos', 'routing_st_side', 'routing_address', 'routing_hubside', 'routing_st_routing']; break;
                case 'rt_station_station':
                    show = ['routing_remote', 'routing_local', 'routing_hubside']; break;
                case 'rt_bridge_station':
                    show = ['routing_con_st_qos', 'routing_hubside', 'routing_st_bridge']; break;
            }

            for (var i = 0; i < all.length; i++) { $('#'+all[i]).hide(); };
            for (var i = 0; i < show.length; i++) { $('#'+show[i]).show(); };
        });

        $(typestr).change();
    }


    if ($('#routing_con_type').length) {
        var typestr = '#routing_con_type input';

        $(typestr).change(function(){
            var all = ['routing_address', 'routing_gw', 'routing_multicast_rx', 'routing_multicast_tx', 'routing_priv', 'routing_la', 
                'routing_vlan', 'routing_mc_static'];
            var show = [];
            var val = $(typestr+':checked').val();
            switch (val) {
                case 'rt_ip_con': show = ['routing_address', 'routing_la', 'routing_priv', 'routing_vlan']; break;
                case 'rt_static_con': show = ['routing_address', 'routing_gw', 'routing_priv', 'routing_vlan']; break;
                case 'rt_multicast_rx': show = ['routing_multicast_rx', 'routing_address', 'routing_gw', 'routing_mc_static']; break;
                case 'rt_multicast_tx': show = ['routing_multicast_tx', 'routing_address', 'routing_vlan']; break;
            }

            for (var i = 0; i < all.length; i++) { $('#'+all[i]).hide(); };
            for (var i = 0; i < show.length; i++) { $('#'+show[i]).show(); };
        });

        $(typestr).change();
    }

    if ($('.mr_what').length) {

        $('.mr_cond').change(function(){
            $('#value').hide();
            if ($(this).val() == 0 || $(this).val() == 1) {
                $('#value').show();
            }
        })

        $('.mr_what').change(function(){
            what = $('.mr_what').val();
            $('#value').hide(); 
            $('#cond_value').hide();    
            $('#faults').hide();        $('#rx_faults').hide();       $('#tx_faults').hide();
            $('#cond_faults').hide();

            if (what==0) {
                $('#faults').show();
                $('#cond_faults').show();
            } else if (what==1) {
                $('#rx_faults').show();
                $('#cond_faults').show();
            } else if (what==2) {
                $('#tx_faults').show();
                $('#cond_faults').show();
            } else {
                $('#cond_value').show();
                $('.mr_cond').change();
            }

        });
        $('.mr_what').change();


    }

    var tstr3 = 'input[name=remoteroute\\[type\\]]';
    if($(tstr3).length) {
        $(tstr3).change(function() {
            var val = $(tstr3+':checked').val();

            $('#gw_addr').hide();
            $('#ip_addr1').hide();
            $('#ip_addr2').hide();
            $('#unicast').hide();
            $('#mcrx').hide();
            $('#net_addr').show();

            if (val == "remote_route") {
                $('#unicast').show();
                $('#gw_addr').show();
            }
            else if (val == "remote_address") {
                $('#ip_addr1').show();
                $('#ip_addr2').show();
                $('#unicast').show();
                $('#net_addr').hide();
            }
            else if (val == "multicast_rx") {
                $('#mcrx').show();
            }
        });
        $(tstr3).change();
    }

    if ($('#shaper').length) {

        var types = ['up', 'mir', 'lower', 'cbq', 'night'];
        for (var i = 0; i < types.length; i++)
        {
            var typename = 'input[name=shaper\\['+types[i]+'_enable\\]]';
            var mytype = types[i];
            var changefunc = function(item, cb) {
                    return function() {
                        if ($(cb).is(':checked')) {
                            $('#shaper_' + item).show();
                        } else {
                            $('#shaper_' + item).hide();
                        }
                    }
            }

            $(typename).change(  changefunc(mytype, typename) );
            $(typename).change();
        }
    }

    if ($('.roleselector').length) {
        $('.roleselector').change(function(){
            var roles = JSON.parse($('#u_roles').text());
            var role_id = $('.roleselector').val();
            $('#roletable .cb_userright').each(function(){
                var rolename = $(this).attr('name').match(/\[(.+)\]/)[1];
                if ($.inArray(rolename, roles[role_id]) != -1)
                    $(this).prop('checked', true)
                else
                    $(this).prop('checked', false)
            });
        });
        $('#u_set_all').click(function(){
            $('#roletable .cb_userright').prop('checked', true)
        });
        $('#u_set_none').click(function(){ $('#roletable .cb_userright').prop('checked', false) });
        $('#u_set_invert').click(function(){ $('#roletable .cb_userright').each(function(){
            $(this).prop('checked', !$(this).prop('checked'));
        })});

    }

    var autnm = $('#remote\\[auto_num\\]');
    if (autnm.length) {
        autnm.change(function() {
            if ($(this).prop('checked')) {
                $('#remote_number').hide();
            } else {
                $('#remote_number').show();
            }
        });
        autnm.change();
    }

    autnm = $('#controlleredit\\[hubless_auto_num\\]');
    if (autnm.length) {
        autnm.change(function() {
            if (autnm.is(':checked')) {
                $('#remote_number').hide();
            } else {
                $('#remote_number').show();
            }
        });
        autnm.change();
    }

    if ($('.script_button').length) {   //pressed states
        $('.script_button').click(function() {
            $('.script_button').removeClass('inset');
            $(this).addClass('inset');
        });
    }

    if ($('#corestart').length){
        subscribe({'what' : 'core'});
        $('#corestart button').click(function(){
            var cmd = $(this).attr('data-cmd').split('_');
            updateTick([{
                'what' : 'core',
                pid: cmd[0],
                cmd: cmd[1]
            },
            {'what' : 'navigation'}]);
        });
    }

    if ( $('#world-map').length ) {
        if ( !$('.leaflet-map-pane').length )
        {
            worldMap = new L.Map('world-map', {center: [0, 0], minZoom: 1, maxZoom: 7 });

            var offlineTiles = L.tileLayer('/images/tiles/{z}/{x}/{y}.jpg', {
                tms: true,
            });
            worldMap.addLayer(offlineTiles);

            
            //  {

            //     return L.graticule({
            //         interval: 10,
            //         style: {
            //             color: '#777',
            //             opacity: 1,
            //             fillColor: '#ccf',
            //             fillOpacity: 0,
            //             weight: 0.5
            //         }      
            //     })
            // .addTo(worldMap);
            // };

            var map_graticule = null;
            $('#world-map-graticulize').click(function() {
                if (!map_graticule) {
                    map_graticule = L.graticule({
                        interval: 10,
                        style: { color: '#777', opacity: 1, fillColor: '#ccf', fillOpacity: 0, weight: 0.5 }
                    });
                }

                if ($(this).is(':checked')) {
                    map_graticule.addTo(worldMap);
                }
                else {
                    worldMap.removeLayer(map_graticule);
                }
            });

            L.control.coordinates({
                useDMS: true,
                labelTemplateLat: "N {y}",
                labelTemplateLng: "E {x}",
                useLatLngOrder: true
            }).addTo(worldMap);

            iconDown = L.icon({
                iconUrl: '/css/images/marker_rounded_red.png',
                iconSize: [16, 16],
                iconAnchor: [8, 16],
                popupAnchor: [0, -8],
                className: 'down',
            });

            iconUp = L.icon({
                iconUrl: '/css/images/marker_rounded_yellow_green.png',
                iconSize: [16, 16],
                iconAnchor: [8, 16],
                popupAnchor: [0, -8],
                className: 'up',
            });

            var m = JSON.parse($('#world-map-markers').text());

            markersLatLng = [];
            worldMapMarkers = {};
            var markers_arr = [];

            markersCluster = new L.MarkerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 15,
                spiderfyOnMaxZoom: true,
                removeOutsideVisibleBounds: false,
                zoomToBoundsOnClick: false,
                // disableClusteringAtZoom: 7,
                iconCreateFunction: function(cluster) {
                    // var markersInCluster = cluster.getAllChildMarkers();
                    var markersQty = cluster.getChildCount();

                    return new L.DivIcon({
                        html: '<div><span>' + markersQty + '</span></div>',
                        className: 'marker-cluster marker-cluster-medium',
                        iconSize: new L.Point(20, 20)
                    });
                }
            });

            for ( var key in m )
            {
                var icon = iconUp;
                if ( m[key].state == 1 ) icon = iconDown;

                var marker = new L.marker(L.latLng(m[key].latlng[0], m[key].latlng[1]), {icon: icon}).bindPopup('<a href="/remote_dashboard/' + key + '/" class="remote-link">' + m[key].name + '</a>');
                markersCluster.addLayer(marker);

                markersLatLng.push(m[key].latlng); // Array with lat and lng for fitBounds function
                worldMapMarkers[key] = marker; // Object with map markers
                markers_arr.push(marker); // Array of markers - needed to generate raw layer of markers
            }
            remotesMarkers = L.layerGroup(markers_arr);

            worldMap.addLayer(markersCluster);
            if ( markersLatLng.length > 0 ) {
                worldMap.fitBounds(markersLatLng);
            }

            var MapResizeFunction = function ()
            {
                if ( $('#world-map').css('position') != 'fixed' )
                {
                    var mapToolWidth = $('.topContainer.rightColumn').width();
                    var mapToolHeight = $(window).height();
                    var mapToolMarginLeft = $('.topContainer.rightColumn').offset().left;
                    $('#world-map').css({ position: 'fixed', height: mapToolHeight - 31, width: mapToolWidth, left: mapToolMarginLeft, top: 0, 'z-index': 10000});
                    if ( markersLatLng.length > 0 ) {
                        worldMap.invalidateSize().fitBounds(markersLatLng);
                    }

                    $('#world-map-tool').css({left: mapToolMarginLeft + (mapToolWidth/2) - ($('#world-map-tool').outerWidth()/2)}).show();
                    $('.world-map-tool-switcher').css({left: mapToolMarginLeft + (mapToolWidth/2) - ($('.world-map-tool-switcher').outerWidth()/2)}).show();
                }
                else
                {
                    $('#world-map').css({ position: 'relative', height: 400, width: '100%', left: 'auto', top: 'auto', 'z-index': 10000});
                    $('#world-map-tool').hide();
                    $('.world-map-tool-switcher').hide();
                    if ( markersLatLng.length > 0 ) {
                        worldMap.invalidateSize().fitBounds(markersLatLng);
                    }
                }
            };

            var MapFitScreenFunction = function ()
            {
                if ( markersLatLng.length > 0 ) {
                    worldMap.fitBounds(markersLatLng);
                }
            };

            var control = new (L.Control.extend({
                options: { position: 'topright' },
                onAdd: function (map) {
                    var myControls = L.DomUtil.create('div', 'world-map-controls');


                    var fitScreen = L.DomUtil.create('button', 'world-map-fit-screen', myControls);
                    L.DomEvent
                        .addListener(fitScreen, 'click', L.DomEvent.stopPropagation)
                        .addListener(fitScreen, 'click', L.DomEvent.preventDefault)
                        .addListener(fitScreen, 'click', MapFitScreenFunction);

                    // Set CSS for the control border
                    fitScreen.title = 'Click to fit';

                    // Set CSS for the control interior
                    var controlText = L.DomUtil.create('i', 'fa fa-crosshairs', fitScreen);

                    var fullScreenControl = L.DomUtil.create('button', 'world-map-state', myControls);
                    L.DomEvent
                        .addListener(fullScreenControl, 'click', L.DomEvent.stopPropagation)
                        .addListener(fullScreenControl, 'click', L.DomEvent.preventDefault)
                        .addListener(fullScreenControl, 'click', MapResizeFunction);

                    // Set CSS for the control border
                    fullScreenControl.title = 'Click to expand';

                    // Set CSS for the control interior
                    var controlText = L.DomUtil.create('i', 'fa fa-expand', fullScreenControl);

                    return myControls;
                }
            }));

            worldMap.addControl(control);

            $('.leaflet-control-attribution').hide();
        }
    }

    $('.widgetdatasrc').each(function() {
        subscribe({
            'what' : 'widget',
            'datasrc' : $(this).val(),
        });
    });

    if ($('#uhpgroupcommand\\[end_hm\\]').length) {
        update_time_calculator();
    }

    symrate_speed_calculator();

    graphClickCallback = null;
    graphFormHandlers();
    logFormHandlers();
    userlogFormHandlers();

    reportFormHandlers();

    $('.remote_station_list').change(function(){
        var rid = $(this).val();
        updateTick([{ 'what' : 'ip_and_static_list', datasrc: rid }]);
    });
    $('.remote_station_list').change();

    $('.local_map_custom_ip').change(function() {
        $('#custom_ip').slideToggle();
    });
    $('.local_map_custom_ip').prop('checked') ? $('#custom_ip').show() : $('#custom_ip').hide();

    if ($('.droppable').length) {
        var self = $('.droppable:first');
        self.droparea({
            instructions: "Try dragging a file here or choose below",
            over : "Drop file here",
            'start': function() { },
            'error' : function(result, input, area){
                alert(result.error);
            },
            'complete' : function(result, file, input, area){
                if(result.error)
                    alert(result.message);
                else
                    self.find('.current').html(result.message);
            }
        });
    }

    //old scheduler traces
    /*
    var updateFunc = gantt_create();
    if(!ganttInterval) {
        ganttInterval = setInterval(updateFunc, 1000);
    }*/

    if (!fpc) fpc = new FrequencyPlannerControls();
    fpc.init();
    //create_frequency_planner();
    bind_widget_handlers();

    addDbFieldsHandlers();

    $('input[data-validate=mask]').on('blur', function(){
        var val = $(this).val();
        if (val.match(/[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}/))
            val = ipMaskShorten(val);

        val = (val+"").replace(/[^\d]/, '');
        $(this).val(val);

        $(this).closest('p').find()
    });

    $('input[data-validate=mask]').on('keyup', function(){
        var txt = $(this).closest('p').find('span.form-horizontal-help');
        var mask = $(this).val();
        if (mask > 32 || mask < 0)
            return;

        var longmask = (0xFFFFFFFF<<(32-mask)) >>> 0;
        var longmasktext = ((longmask & 0xFF000000) >>> 24).toString(10) + '.' +
            ((longmask & 0xFF0000) >>> 16).toString(10) + '.' +
            ((longmask & 0xFF00) >>> 8).toString(10) + '.' +
            (longmask & 0xFF).toString(10);
        txt.text("Mask is " + longmasktext);
    });

    $('.timepicker').timepicker();

    $('.priority_list').change(function(){
        if ($(this).val() == 3)     //policy
            $('.policy_list').show();
        else
            $('.policy_list').hide();
    });
    $('.priority_list').change();


    $('.multiselect').select2('destroy');
    $('.multiselect').select2({ //  don't want to chain :-(
        width: 'resolve'
    });

    $('.multiselect_sort').select2({
            multiple: true,

            query: function (options) {
                var data = {results: []};
                var list = options.element.attr('data-list');
                var jsondata =JSON.parse( list );
                data.results = jsondata;
                options.callback(data);
            },
            initSelection : function (element, callback) {
                var data = JSON.parse(element.val());
                element.val('');
                callback(data);
            }
        }).sortable({
                //containment: 'parent',
                //start: function() { $(this).select2("onSortStart"); },
                //update: function() { $(this).select2("onSortEnd"); }
            });

    //$('.multiselect').chosen(function() { return $(this).attr('data-options'); } );

    //last in case of js errors

    longlat();
    try {
        graphs = {};
        buildgraph();
    } catch(e) {

    }

    // Калькулятор обратного канала TDMA, start
    function tdma_calc(slots_num, slot_size_bursts, sym_rate, mod_fec, inform_rate, direction)
    {
        var mod = 0; // Модуляция
        var fec = 0; // FEC
        if ( mod_fec == 0 ) {
            mod = 2;
            fec = 2/3;
        }
        else if ( mod_fec == 1 ) {
            mod = 2;
            fec = 5/6;
        }
        else if ( mod_fec == 2 ) {
            mod = 3;
            fec = 2/3;
        }
        else if ( mod_fec == 3 ) {
            mod = 3;
            fec = 5/6;
        }
        else if ( mod_fec == 4 ) {
            mod = 1;
            fec = 2/3;
        }
        else if ( mod_fec == 5 ) {
            mod = 1;
            fec = 5/6;
        }

        if ( direction == 'inform_rate' ) {
            sym_rate = inform_rate/(mod*fec);
        }

        var total_slot_size_bytes; // Общая длина слота в байтах
        var packet_splice_bytes = 2; // Байтов на склейку пакетов
        var bytes_per_svlan = 2; // Байтов на SVLAN
        var efficient_slot_size_bytes; // Полезная длина слота в байтах

        // Слот
        var slot_gap_symbols;
        var slot_begin_size_symbols = 5;
        var slot_unique_word_symbols = 11;
        var slot_data_fec_symbols;
        var slot_end_symbols = 5;

        var slot_length; // Размер слота
        var slot_duration; // Длительность слота
        var frame_duration; // Длительность фрейма

        var slot_rate; // Скорость слота
        var total_rate; // Общая скорость передачи данных
        var efficient_slot_rate; // Полезная скорость слота
        var efficient_total_rate; // Общая полезная скорость передачи данных

        if ( mod_fec == 0 || mod_fec == 2 || mod_fec == 4 ) {
            total_slot_size_bytes = slot_size_bursts*32;
        }
        else if ( mod_fec == 1 || mod_fec == 3 || mod_fec == 5 ) {
            total_slot_size_bytes = slot_size_bursts*40;
        }
        else total_slot_size_bytes = 0;

        if ( total_slot_size_bytes > 0 && packet_splice_bytes > 0 && bytes_per_svlan > 0) {
            efficient_slot_size_bytes = total_slot_size_bytes - packet_splice_bytes - bytes_per_svlan;
        }
        else efficient_slot_size_bytes = 0;

        if ( sym_rate > 0 ) {
            slot_gap_symbols = Math.floor(sym_rate/256) + 10;
        }
        else slot_gap_symbols = 0;

        if ( total_slot_size_bytes > 0 ) {
            slot_data_fec_symbols = Math.ceil((total_slot_size_bytes*8)/(mod*fec));
        }
        else slot_data_fec_symbols = 0;

        if ( slot_gap_symbols > 0 && slot_begin_size_symbols > 0 && slot_unique_word_symbols > 0 && slot_data_fec_symbols > 0 && slot_end_symbols > 0 ) {
            slot_length = slot_gap_symbols + slot_begin_size_symbols + slot_unique_word_symbols + slot_data_fec_symbols + slot_end_symbols;
        }
        else {
            slot_length = 0;
        }

        if ( slot_length > 0 && sym_rate > 0 ) {
            slot_duration = slot_length/sym_rate;
        }
        else {
            slot_duration = 0;
        }

        if ( slots_num > 0 && slot_duration > 0 ) {
            frame_duration = slots_num*slot_duration;
        }
        else {
            frame_duration = 0;
        }

        $('#calc_tdma_slot_size').html(slot_length > 0 ? slot_length + ' symbols' : '');
        $('#calc_tdma_slot_length').html(slot_duration > 0 ? slot_duration.toFixed(3) + ' ms' : '');
        $('#calc_tdma_frame_length').html(frame_duration > 0 ? frame_duration.toFixed(3) + ' ms' : '');

        if ( total_slot_size_bytes > 0 && frame_duration > 0 ) {
            slot_rate = total_slot_size_bytes*8/frame_duration;
        }
        else {
            slot_rate = 0;
        }

        if ( direction == 'sym_rate' )
        {
            if ( sym_rate > 0 && fec > 0  && mod > 0 ) {
                total_rate = sym_rate*fec*mod;
            }
            else {
                total_rate = 0;
            }
        }
        else {
            total_rate = $('#tdma_calc_total_rate').val();
        }

        if ( efficient_slot_size_bytes > 0 && frame_duration > 0 ) {
            efficient_slot_rate = efficient_slot_size_bytes*8/frame_duration;
        }
        else {
            efficient_slot_rate = 0;
        }

        if ( efficient_slot_rate > 0 && slots_num > 0 ) {
            efficient_total_rate = efficient_slot_rate*slots_num;
        }
        else {
            efficient_total_rate = 0;
        }

        $('#tdma_calc_slot_rate').html(slot_rate > 0 ? slot_rate.toFixed(3) + ' kbit/s' : '');
        if ( direction == 'sym_rate' ) {
            $('#tdma_calc_total_rate').val(total_rate > 0 ? total_rate.toFixed(3) : '');
        }
        else if ( direction == 'inform_rate' ) {
            $('#calc_tdma_sym_rate').val(sym_rate > 0 ? sym_rate.toFixed(3) : '');
        }
        $('#tdma_calc_slot_rate_efficient').html(efficient_slot_rate > 0 ? efficient_slot_rate.toFixed(3) + ' kbit/s' : '');
        $('#tdma_calc_total_rate_efficient').html(efficient_total_rate > 0 ? efficient_total_rate.toFixed(3) + ' kbit/s' : '');

        return true;
    }

    $("#calculate_tdma_form").draggable();

    $('#tdma_calc').click(function() {
        if ( $('#calculate_tdma_form').is(':visible') ) {
            $('#calculate_tdma_form').slideUp(100);
        }
        else {
            var slots_num = $('#controlleredit\\[tdmaproto_slotsnum\\]').val(); // Количество слотов
            var slot_size_bursts = $('#controlleredit\\[tdmaproto_slotsize\\]').val(); // Размерность слота
            var sym_rate = $('#controlleredit\\[tdmrf_symrate\\]').val(); // Символьная скорость
            var mod_fec = $('#controlleredit\\[tdmrf_fec\\]').val(); // Модуляция + FEC селект

            $('#calc_tdma_slots_num').val(slots_num);
            $('#calc_tdma_slot_dimension').val(slot_size_bursts);
            $('#calc_tdma_sym_rate').val(sym_rate);
            $('#calc_tdma_mod_fec').val(mod_fec);

            tdma_calc(slots_num, slot_size_bursts, sym_rate, mod_fec, 0, 'sym_rate');

            $('#calculate_tdma_form').slideDown(100);
        }
    });

    $('#tdma_calc_close').click( function() {
        $('#calculate_tdma_form').slideUp(100);
    });

    $('#calc_tdma_slot_dimension').change( function() {
        tdma_calc($('#calc_tdma_slots_num').val(), $('#calc_tdma_slot_dimension').val(), $('#calc_tdma_sym_rate').val(), $('#calc_tdma_mod_fec').val(), 0, 'sym_rate');
    });

    $('#calc_tdma_mod_fec').change( function() {
        tdma_calc($('#calc_tdma_slots_num').val(), $('#calc_tdma_slot_dimension').val(), $('#calc_tdma_sym_rate').val(), $('#calc_tdma_mod_fec').val(), 0, 'sym_rate');
    });

    $('#calc_tdma_slots_num').keyup( function() {
        tdma_calc($('#calc_tdma_slots_num').val(), $('#calc_tdma_slot_dimension').val(), $('#calc_tdma_sym_rate').val(), $('#calc_tdma_mod_fec').val(), 0, 'sym_rate');
    });

    $('#calc_tdma_sym_rate').keyup( function() {
        tdma_calc($('#calc_tdma_slots_num').val(), $('#calc_tdma_slot_dimension').val(), $('#calc_tdma_sym_rate').val(), $('#calc_tdma_mod_fec').val(), 0, 'sym_rate');
    });

    $('#tdma_calc_total_rate').keyup( function() {
        tdma_calc($('#calc_tdma_slots_num').val(), $('#calc_tdma_slot_dimension').val(), 0, $('#calc_tdma_mod_fec').val(), $('#tdma_calc_total_rate').val(), 'inform_rate');
    });
    // Калькулятор обратного канала TDMA, end

    // Network - Configuration - Settings - add/edit bandwidth
    if ( $('#bandwidth\\[start_frequency\\]').length )
    {
        $('#bandwidth\\[start_frequency\\]').autoNumeric('init',
        {
            aSep: ' ',
            vMin: '0',
            vMax: '40000000'
        });
    }

    if ( $('#bandwidth\\[end_frequency\\]').length )
    {
        $('#bandwidth\\[end_frequency\\]').autoNumeric('init',
        {
            aSep: ' ',
            vMin: '0',
            vMax: '40000000'
        });
    }

    if ( $('#bandwidth\\[satellite_translation\\]').length )
    {
        $('#bandwidth\\[satellite_translation\\]').autoNumeric('init',
        {
            aSep: ' ',
            vMin: '0',
            vMax: '40000000'
        });
    }

    // Controller - Configuration - RF Setup
    $('.frequency_separated').autoNumeric('init',
    {
        aSep: ' ',
        vMin: '0',
        vMax: '40000000'
    });

    // Расчет tdmrx по tdmtx и bandwidth
    if ( $('#controlleredit\\[tdmtx_freq\\]').length )
    {
        $('body').on('keyup', '#controlleredit\\[tdmtx_freq\\]', function()
        {
            var tdmtx_freq = $('#controlleredit\\[tdmtx_freq\\]').val();
            tdmtx_freq = tdmtx_freq.replace(/[^0-9]/g, '');

            if ( (tdmtx_freq >= 950000 && tdmtx_freq <= 2050000) || (tdmtx_freq >= 4000000 && tdmtx_freq <= 7000000) || (tdmtx_freq >= 10700000 && tdmtx_freq <= 18000000) || (tdmtx_freq >= 26500000 && tdmtx_freq <= 40000000) )
            {
                var bw_list_string = $('#bw_list').html();

                if ( bw_list_string != '[]' )
                {
                    var bw_list = $.parseJSON(bw_list_string);

                    var satellite_translation = 0;

                    for ( bw_item in bw_list)
                    {
                        var start_frequency = Number(bw_list[bw_item].start_frequency);
                        var end_frequency = Number(bw_list[bw_item].end_frequency);

                        if ( tdmtx_freq >= start_frequency && tdmtx_freq <= end_frequency ) satellite_translation = bw_list[bw_item].satellite_translation;
                    }

                    var tdmrx_freq = tdmtx_freq - satellite_translation;

                    if ( tdmrx_freq > 0 )
                    {
                        $('#controlleredit\\[tdmrx_freq\\]').autoNumeric('set', tdmrx_freq);
                    }
                    else $('#controlleredit\\[tdmrx_freq\\]').val('');
                }
            }
        });
    }

    // Расчет tdmarx по tdmatx и bandwidth
    if ( $('.tdma_freq').length )
    {
        $('body').on('keyup', '.tdma_freq', function()
        {
            var id = $(this).attr('id');

            var regex = /tdmrf_txfreq/g;
            if ( regex.test(id) )
            {
                var num = id.replace(/[^0-9]/g, '');
                var tdma_rx_freq_id = '#controlleredit\\[tdmrf_rxfreq_' + num + '\\]';

                var tdma_tx_freq = $(this).val();
                tdma_tx_freq = tdma_tx_freq.replace(/[^0-9]/g, '');
                
                if ( (tdma_tx_freq >= 950000 && tdma_tx_freq <= 2050000) || (tdma_tx_freq >= 4000000 && tdma_tx_freq <= 7000000) || (tdma_tx_freq >= 10700000 && tdma_tx_freq <= 18000000) || (tdma_tx_freq >= 26500000 && tdma_tx_freq <= 40000000) )
                {
                    var bw_list_string = $('#bw_list').html();

                    if ( bw_list_string != '[]' )
                    {
                        var bw_list = $.parseJSON(bw_list_string);

                        var sat_trans = 0;
                        for ( bw_item in bw_list)
                        {
                            var start_frequency = Number(bw_list[bw_item].start_frequency);
                            var end_frequency = Number(bw_list[bw_item].end_frequency);
                            var satellite_translation = Number(bw_list[bw_item].satellite_translation);
                            if ( tdma_tx_freq >= start_frequency && tdma_tx_freq <= end_frequency ) sat_trans = satellite_translation;
                        }

                        var tdma_rx_freq = tdma_tx_freq - sat_trans;

                        if ( tdma_rx_freq > 0 )
                        {
                            $(tdma_rx_freq_id).autoNumeric('set', tdma_rx_freq);
                        }
                        else $(tdma_rx_freq_id).val('');
                    }
                }
            }
        });
    }

    if ($('select[id*="controlleredit\\[acm_fec"]').length) {
        var get_cn_limit = function(acm_id) {
            switch (acm_id) {
                case 9: cn_limit = 3.3; break;
                case 10: cn_limit = 4.2; break;
                case 11: cn_limit = 5.0; break;
                case 12: cn_limit = 5.5; break;
                case 13: cn_limit = 6.4; break;
                case 14: cn_limit = 6.5; break;
                case 15: cn_limit = 7.6; break;
                case 16: cn_limit = 7.5; break;
                case 17: cn_limit = 8.6; break;
                case 18: cn_limit = 9.9; break;
                case 19: cn_limit = 11.3; break;
                case 20: cn_limit = 11.3; break;
                case 21: cn_limit = 10.3; break;
                case 22: cn_limit = 11.0; break;
                case 23: cn_limit = 11.8; break;
                case 24: cn_limit = 12.2; break;
                case 25: cn_limit = 13.4; break;
                case 26: cn_limit = 13.5; break;
                default: cn_limit = '';
            }
            return cn_limit;
        }

        $('select[id*="controlleredit\\[acm_fec"]').change( function() {
            var acm_id = Number($(this).val());
            var cn_limit = get_cn_limit(acm_id);
            $(this).parent().siblings('.form-horizontal-help').html('C/N limit: ' + (cn_limit + Number($('#controlleredit\\[acm_cnremote\\]').val())*0.1) + ' dB');
        });

        $('#controlleredit\\[acm_cnremote\\]').blur( function() {
            $('select[id*="controlleredit\\[acm_fec"]').each( function() {
                var acm_id = Number($(this).val());
                var cn_limit = get_cn_limit(acm_id);
                $(this).parent().siblings('.form-horizontal-help').html('C/N limit: ' + (cn_limit + Number($('#controlleredit\\[acm_cnremote\\]').val())*0.1) + ' dB');
            });
        });
    }

    if ( typeof worldMap != 'undefined' )
    {
        worldMap.on('popupopen', function(e) {
            $('a.remote-link').address(function() {
                if ($(this).attr('href'))
                    return $(this).attr('href').replace(/^#/, '');

                return "";
            });
        });
    }

    // On/Off cloudiness on world-map
    if ( $('#world-map-cloudiness').length ) {
        $('#world-map-cloudiness').change( function() {
            if ( typeof OpenWeatherMap_Clouds === 'undefined' ) {
                OpenWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
                    opacity: 0.99
                });
            }

            if ( $('#world-map-cloudiness').is(':checked') ) {
                worldMap.addLayer(OpenWeatherMap_Clouds);
            } else {
                worldMap.removeLayer(OpenWeatherMap_Clouds);
            }
        });
    }

    // Turn On/Off clusterization
    if ( $('#world-map-clusterize').length ) {
        $('#world-map-clusterize').change( function() {
            if ( $('#world-map-clusterize').is(':checked') ) {
                worldMap.removeLayer(remotesMarkers).addLayer(markersCluster);
            } else {
                worldMap.removeLayer(markersCluster).addLayer(remotesMarkers);                
            }
        });
    }

    // managing world map tool state (opened/closed)
    if ( $('.world-map-tool-switcher').length ) {
        $('.world-map-tool-switcher').click( function() {
            if ( $('.world-map-tool-switcher').hasClass('opened') ) {
                $('.world-map-tool-switcher').removeClass('opened').addClass('closed');
                $('.world-map-tool-switcher').animate({top: '-=39'}, 200);
                $('#world-map-tool').animate({height: 2}, 200, function() {
                    $('.world-map-tool-switcher i').removeClass('fa-caret-up').addClass('fa-caret-down');
                });
                $('#world-map-tool-items').css({visibility: 'hidden'});
            }
            else if ( $('.world-map-tool-switcher').hasClass('closed') ) {
                $('.world-map-tool-switcher').removeClass('closed').addClass('opened');
                $('.world-map-tool-switcher').animate({top: '+=39'}, 200, function() {
                    $('#world-map-tool-items').css({visibility: 'visible'});
                });
                $('#world-map-tool').animate({height: 41}, 200, function() {
                    $('.world-map-tool-switcher i').removeClass('fa-caret-down').addClass('fa-caret-up');
                });
            }
        });
    }

    // World map changing view (offline/weather)
    if ( $('#world-map-tool').length ) {
        $('.world-map-tool-item').click( function() {
            $('.world-map-tool-item').removeClass('selected');
            $(this).addClass('selected');

            if ( $(this).hasClass('world-map-tool-item-weather') ) {
                $.get('/weather/', '').done( function(data) {
                    var json = $.parseJSON(data);
                    for (remote_id in worldMapMarkers) {
                        iconWeather = L.icon({
                            iconUrl: getWeatherIcon(json[remote_id].icon),
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                            popupAnchor: [0, -4],
                        });

                        worldMapMarkers[remote_id].setIcon(iconWeather);
                        worldMapMarkers[remote_id].bindPopup(json[remote_id].weather_info);
                    }
                });
            }

            if ( $(this).hasClass('world-map-tool-item-offline') ) {
                var current_markers = $('#world-map-markers').text();

                var updated_markers_parsed = $.parseJSON(updated_markers);
                var current_markers_parsed = $.parseJSON(current_markers);

                for ( var key in current_markers_parsed ) {
                    if ( !(key in updated_markers_parsed) ) {
                        worldMap.removeLayer(worldMapMarkers[key]);
                    }

                    if ( key in updated_markers_parsed ) {
                        worldMapMarkers[key].bindPopup('<a href="/remote_dashboard/' + key + '/" class="remote-link">' + updated_markers_parsed[key].name + '</a>');

                        if ( updated_markers_parsed[key].state == 1 ) {
                            worldMapMarkers[key].setIcon(iconDown);
                        } else {
                            worldMapMarkers[key].setIcon(iconUp);
                        }
                    }
                }

                for ( var key in updated_markers_parsed ) {
                    if ( !(key in current_markers_parsed) ) {
                        var icon = iconUp;
                        if ( updated_markers_parsed[key].state == 1 ) icon = iconDown;

                        var marker = new L.marker(L.latLng(updated_markers_parsed[key].latlng[0], updated_markers_parsed[key].latlng[1]), {icon: icon}).bindPopup('<a href="/remote_dashboard/' + key + '/" class="remote-link">' + updated_markers_parsed[key].name + '</a>');
                        worldMapMarkers[key] = marker;
                        marker.addTo(worldMap);
                    }
                }
            }
        });
    }

    if ( $('#uhpcommand\\[dtts_source\\]').length ) {
        $('#uhpcommand\\[dtts_source\\]').change( function() {
            var dtts_source = $(this).val();
            if ( dtts_source == 2 ) {
                var dtts_value = calculate_dtts($('#uhpcommand\\[latlon\\]').val());
                $('#uhpcommand\\[dtts_source\\]').after('<input inline="1" size="5" data-validate="int" name="uhpcommand[dtts_value]" id="uhpcommand[dtts_value]" type="text" value="0"> <span>&mu;S (recomended ' + dtts_value.toFixed(0) + ' &plusmn; 100, &mu;S)</span>');
            } else {
                $('#uhpcommand\\[dtts_source\\]').nextAll().remove('');
            }
        });
    }

    bindDataTables();

    // Remote maintenance :: TLC CONTROL (On/Off and maxlvl)
    if ( $('#uhpcommand\\[tlc_control\\]').length ) {
        $('#uhpcommand\\[tlc_control\\]').change( function() {
            var tlc_control = $(this).val();
            if ( tlc_control == 2 ) {
                $('#uhpcommand\\[set_max_lvl_section\\]').show();
            } else {
                $('#uhpcommand\\[set_max_lvl_section\\]').hide();
            }
        });
    }

    // NMS/Settings :: Добавление кнопки generate для для api_token.
    if ($('#nmssettings\\[api_token\\]').length) {
        $('#nmssettings\\[api_token_generate\\]').click( function() {
            $('#nmssettings\\[api_token\\]').val(randomStr(64));
        });
    }

    // Отрисовка статистики ACM
    if ($('#acm_stat').length) {
        var width = $('#acm_stat').width();
        var height = $('#acm_stat').height();

        var g_offset = $('#groups').offset();
        var cnvs_offset = $('#acm_stat_canvas').offset();

        $('#acm_stat_canvas').attr('width', width);
        $('#acm_stat_canvas').attr('height', g_offset.top - cnvs_offset.top - 60);

        var cnvs = document.getElementById('acm_stat_canvas');
        var acm_data = $.parseJSON($('#acm_stat_data').html());

        asv = new AcmStat(cnvs, acm_data);
    }

    // Shaper visualisation
    // if ($('.subscribe_shaper').length)
    // {
    //     $("#shaper-graph-wrapper").draggable();


    //     $('.subscribe_shaper').click( function()
    //     {
    //         var sh = new ShaperStat();
    //         sh.showGraph();
    //         var btn = $(this);

    //         var ids = [];
    //         ids.push(btn.data('id'));

    //         if (!btn.hasClass('updating'))
    //         {
    //             var awidth = $('.topContainer.rightColumn').width();
    //             var aheight = $('.topContainer.rightColumn').height();

    //             var cwidth = $('#shaper-graph-wrapper').width();
    //             var cheight = $('#shaper-graph-wrapper').height();

    //             $('#shaper-graph-wrapper').css({ left: (awidth-cwidth)/2, top: (aheight/2) - cheight });

    //             $('#shaper-graph-wrapper').slideDown(100);
    //             $('.nodata').hide();
    //             buildgraph();
    //             btn.addClass('updating');
    //             btn.find('i').addClass('fa-spin');

    //             var msg = {'command': 7, 'ids': ids, 'network_id': btn.data('net_id'), 'type': btn.data('type')};
    //             if (btn.data('type') == 11) msg.shaper_num = btn.data('shp_num');

    //             var src = $(".widgetdatasrc[value*='shaper']").val();
    //             src = src.replace(/WidgetRemoteGraph:/g, '');
    //             src = src.replace(/#.*/g, '');
    //             var points = [];
    //             for (var i = 0; i < 500; i++)
    //             {
    //                 points.push([Math.floor(moment().utc().valueOf()/1000) - i, null, null, null, null, null]);
    //             }
    //             var points_arr = JSON.stringify(points);
    //             pushtograph(src, points_arr, '');

    //             if (web_socket_connect()) web_socket_send(msg);
    //         }
    //         else
    //         {
    //             $('#shaper-graph-wrapper').slideUp(100);

    //             btn.removeClass('updating');
    //             btn.find('i').removeClass('fa-spin');

    //             if (btn.data('type') == 11)
    //             {
    //                 var src = $(".widgetdatasrc[value*='shaper']").val();
    //                 src = src.replace(/WidgetRemoteGraph:/g, '');
    //                 src = src.replace(/#.*/g, '');
    //                 var point = JSON.stringify([[Math.floor(moment().utc().valueOf()/1000) - i, null, null, null, null, null]]);
    //                 pushtograph(src, point, '');
    //             }

    //             var msg = {'command': 8};
    //             if (web_socket_connect()) web_socket_send(msg);
    //         }
    //     });
    // }

    // if ($('.mdl-close').length) {
    //     $('.mdl-close').click(function() {
    //         $('#shaper-graph-wrapper').slideUp(100);

    //         var btn = $('button.updating');

    //         btn.removeClass('updating');
    //         btn.find('i').removeClass('fa-spin');

    //         if (btn.data('type') == 11) {
    //             var src = $(".widgetdatasrc[value*='shaper']").val();
    //             src = src.replace(/WidgetRemoteGraph:/g, '');
    //             src = src.replace(/#.*/g, '');
    //             var point = JSON.stringify([[Math.floor(moment().utc().valueOf()/1000) - i, null, null, null, null, null]]);
    //             pushtograph(src, point, '');
    //         }

    //         var msg = {'command': 8};
    //         if (web_socket_connect()) web_socket_send(msg);
    //     });
    // }

    if ($('input[name=monitoringgroup\\[is_state\\]]').length) {
        $('input[name=monitoringgroup\\[is_state\\]]').change(function() {
            var group_type = $(this).val();
            if (group_type == 0) {
                $('label[for=monitoringgroup\\[msg\\]]').html('Event fire message');
                $('#monitoringgroup\\[leave_msg\\]').closest('p').hide();
                $('#monitoringgroup\\[leave_msg\\]').val('');
            } else if (group_type == 1) {
                $('label[for=monitoringgroup\\[msg\\]]').html('Enter state message');
                $('#monitoringgroup\\[leave_msg\\]').closest('p').show();
            }
        });
    }

    // // Drag'n'Drop для загрузки софта
    // if ($('#dropzone').length) {
    //     var dropZone = $('#dropzone');
    //     $(document).bind('drop dragover', function(e) {
    //         e.preventDefault();
    //     });

    //     $('#dropzone').bind('dragover', function(e) {
    //         dropZone.css({'background-color': '#DDD'});

    //     });
    //     $('#dropzone').bind('drop', function(e) {
    //         dropZone.css({'background-color': '#FFF'});
    //     });
    // }

    // // Мультиселектовая загрузка файлов
    // $('#fileupload').fileupload({
    //     dataType: 'json',
    //     dropZone: $('#dropzone'),
    //     progressall: function (e, data) {
    //         var progress = parseInt(data.loaded / data.total * 100, 10);
    //         $('.pr-cnt').css({ border: '1px solid #BBB' });
    //         $('.pr-cnt .pr').css({ width: progress + '%' });
    //         if (progress == 100) {
    //             dropZone.css({'background-color': '#FFF'});
    //             $('.pr-cnt .pr').css({ width: progress + '%' });
    //             $('.pr-cnt').css({ border: '1px solid #BBB' });
    //             $('#pr-cmpl').show();
    //             setTimeout(function() {
    //                 onContentLoad('/software_update/?' + moment().utc());
    //             }, 1000);
    //         }
    //     }
    // });

    // // Контроллерный софт
    // if ($('.soft').length) {
    //     $('.soft').change(function() {
    //         var select = $(this);
    //         select.css({border: '2px solid #00D'});
    //         select.addClass('update');
    //     });
    // }

    // if ($('.ctrl-soft-bank').length) {
    //     $('.ctrl-soft-bank').change(function() {
    //         var checkboxes = $(this).parent().parent().parent().find('input');
    //         var label = $(this).parent();
    //         checkboxes.each(function() {
    //             if ($(this).parent().hasClass('selected_bank')) {
    //                 $(this).parent().removeClass('selected_bank');
    //             }
    //             $(this).parent().css({ color: '#000' });
    //             $(this).prop('checked', false);
    //         });

    //         $(this).prop('checked', true);
    //         if (!label.hasClass('current_bank')) {
    //             label.addClass('selected_bank');
    //         }
    //     });
    // }

    // $("#ctrl_soft_adv_set_div").draggable();

    // $('#ctrl_soft_adv_set').click(function() {
    //     if ($('#ctrl_soft_adv_set_div').is(':visible')) {
    //         $('#ctrl_soft_adv_set_div').slideUp(100);
    //     } else {
    //         $('#ctrl_soft_adv_set_div').slideDown(100);
    //     }
    // });

    // if ($('#ctrlsoft_advset_closesign').length) {
    //     $('#ctrlsoft_advset_closesign').click(function() {
    //         $('#ctrl_soft_adv_set_div').slideUp(100);
    //     });
    // }

    // Запрос инфы о софте на контроллерах
    // if ($('.get_ctrl_soft_info').length) {
    //     $('.get_ctrl_soft_info').click(function() {
    //         var btn = $(this);

    //         var ids = [];//btn.data('id').split(',');
    //         ids.push(2);

    //         if (!btn.hasClass('updating')) {
    //             btn.addClass('updating');
    //             btn.find('i').addClass('fa-spin');
    //             var msg = {'command': 6, 'ids': ids, 'network_id': btn.data('net_id'), 'type': btn.data('type')};
    //             console.log(msg);
    //             //if (web_socket_connect()) web_socket_send(msg);
    //         } else {
    //             btn.removeClass('updating');
    //             btn.find('i').removeClass('fa-spin');
    //             // var msg = {'command': 8};
    //             // if (web_socket_connect()) web_socket_send(msg);
    //         }
    //     });
    // }
    
    // Запрос расширенной статистики
    if ($('.es_btn').length) {
        $('.es_btn').click(function() {
            var es_btn = $(this);
            var command = es_btn.data('command');
            var ids = [];
            ids.push(es_btn.data('id'));
            var network_id = es_btn.data('net_id');
            console.log(es_btn.data('types'));
            var types = es_btn.data('types') + '';
            types = types.split(',');

            if (!es_btn.hasClass('updating')) {
                if (command == 7) {
                    es_btn.addClass('updating').find('i').addClass('fa-spin');
                }

                for (var item in types) {
                    var msg = {command: command, ids: ids, network_id: network_id, type: Number(types[item])};
                    console.log(msg);
                    ws_send(msg);
                }
            } else {
                es_btn.removeClass('updating').find('i').removeClass('fa-spin');
                var msg = {command: 8};
                ws_send(msg);
            }
        });
    }

    // Redudundancy form handling
    if ($('#redundancy\\[enabled\\]').length) {
        $('#redundancy\\[enabled\\]').change(function() {
            if ($(this).is(':checked')) {
                $('#redundancy\\[name\\]').prop('disabled', false);
                $('#redundancy\\[address\\]').prop('disabled', false);
                $('#redundancy\\[redundant_to\\]').prop('disabled', false);
                $('#redundancy\\[hubless_serial_num\\]').prop('disabled', false);
                $('#redundancy\\[redundancy_enabled\\]').prop('disabled', false);
                $('#redundancy\\[fault_timeout\\]').prop('disabled', false);
                $('#redundancy\\[link_timeout\\]').prop('disabled', false);
            } else {
                $('#redundancy\\[name\\]').prop('disabled', true);
                $('#redundancy\\[address\\]').prop('disabled', true);
                $('#redundancy\\[redundant_to\\]').prop('disabled', true);
                $('#redundancy\\[hubless_serial_num\\]').prop('disabled', true);
                $('#redundancy\\[redundancy_enabled\\]').prop('disabled', true);
                $('#redundancy\\[fault_timeout\\]').prop('disabled', true);
                $('#redundancy\\[link_timeout\\]').prop('disabled', true);
            }
        });
    }
}

function ws_create() {
    if (ws === null) {
        ws = new WebSocket('ws://10.0.0.49/ws/');
    } else {
        if (ws.readyState > 1) {
            ws = new WebSocket('ws://10.0.0.49/ws/');
        }
    }

    ws.onopen = function(event) {
        for (var i = 0; i < ws_queue.length; i++) {
            ws.send(JSON.stringify(ws_queue[i]));
        }
        ws_queue = [];
    }

    ws.onmessage = function(event) {
        var data = $.parseJSON(event.data);
        console.log(data);

        if (data.status == 1) {
            if (data.type == 11) {
                var src = $(".widgetdatasrc[value*='shaper']").val();
                src = src.replace(/WidgetRemoteGraph:/g, '');
                src = src.replace(/#.*/g, '');
                var points = JSON.stringify([[Math.floor(moment().utc().valueOf()/1000), data.current_cir, data.current_bw, data.low_speed, data.med_speed, data.high_speed]]);
                pushtograph(src, points, '');
            } else {
                for (item in data) {
                    if ($('.' + item).length) {
                        $('.' + item).html(data[item]);
                    }
                    $('.' + item + ' + .ext_stat_hint .ext_stat_updated').html(moment().format('YYYY-MM-DD HH:mm:ss'));
                }
            }
        }
    }
}


function ws_send(msg) {
    ws_create();
    if (ws.readyState == 1) {
        ws.send(JSON.stringify(msg)); 
    } else if (ws.readyState == 0) {
        ws_queue.push(msg);
    }
}

function getWeatherIcon(num) {
    var iconList = {
        '101': 'weather.png',
        '201': 'weather-moon.png',
        '102': 'weather-cloudy.png',
        '202': 'weather-moon-clouds.png',
        '103': 'weather-cloud.png',
        '203': 'weather-cloud.png',
        '104': 'weather-clouds.png',
        '204': 'weather-clouds.png',
        '109': 'weather-rain.png',
        '209': 'weather-rain.png',
        '110': 'weather-rain-little.png',
        '210': 'weather-rain-little.png',
        '111': 'weather-lightning.png',
        '211': 'weather-lightning.png',
        '113': 'weather-snow.png',
        '213': 'weather-snow.png',
        '150': 'weather-fog.png',
        '250': 'weather-fog.png',
        '10000': 'question_sign.png',
    };

    if (typeof(iconList[num]) === 'undefined') {
        iconList[num] = 'question_sign.png';
    }

    return '/images/icons/weather/' + iconList[num];
}


function update_time_calculator() {

    var end_hm = $('#uhpgroupcommand\\[end_hm\\]');
    var start_hm = $('#uhpgroupcommand\\[start_hm\\]');
    var repeat_count = $('#uhpgroupcommand\\[repeat_count\\]');
    var repeat_interval = $('#uhpgroupcommand\\[repeat_interval\\]');
    var speed = $('#uhpgroupcommand\\[transmission_speed\\]');

    var onParameterChange = function(event) {
        var spd = parseInt(speed.val(), 10);
        if (spd == 0)
            spd = 512;
        var st = start_hm.val().split(':');
        var start = Date.now().set({ hour : parseInt(st[0], 10), minute : parseInt(st[1], 10) });
        var send_duration = Math.ceil(((512 / spd) * 10) /  60); //at 512 kbit ~10 sec
        var rc = repeat_count.val();
        var ri = repeat_interval.val();
        var duration = (rc * send_duration) + ((rc-1) * ri);        

        start.addMinutes(duration);
        end_hm.val(start.toString("HH:mm"));
    }

    repeat_count.blur(onParameterChange);
    repeat_interval.blur(onParameterChange);
    start_hm.blur(onParameterChange);
    speed.blur(onParameterChange);
    onParameterChange();
}

function symrate_speed_calculator() {

    var calc = function(inf_to_sym) {

        //DVB-S QPSK:    0 - 1/2; 1 - 2/3; 2 - 3/4; 3 - 5/6; 4 - 7/8; 
        //DVB-S2 QPSK:   5 - 1/3; 6 - 2/5; 7 - 1/2; 8 - 3/5; 9 - 2/3; 10 - 3/4; 11 - 4/5; 12 - 5/6; 13 - 8/9; 14 - 9/10; 
        //DVB-S2 8PSK:   15 - 3/5; 16 - 2/3; 17 - 3/4; 18 - 5/6; 19 - 8/9; 20 - 9/10;
        //DVB-S2 16APSK: 21 - 2/3; 22 - 3/4; 23 - 4/5; 24 - 5/6; 25 - 8/9; 26 - 9/10; 

        var mvcs = [
          1, 0x00, 0x3, 2, 1,  // UNC
          1, 0x02, 0x2, 2, 2,  // 1/2
          5, 0x36, 0x6, 4, 3,  // 2/3
          3, 0x06, 0xE, 6, 4,  // 3/4
          5, 0x16, 0xE, 10, 6, // 5/6
          7, 0x5E, 0xE, 14, 8, // 7/8
          3, 0x05, 0xE, 6, 4,  // I3/4
          7, 0x5D, 0xE, 14, 8  // I7/8
        ];

        var fec_dividend = [2, 4, 6, 10, 14];    //*2bit qpsk
        var fec_divisor  = [2, 3, 4, 6,  8];

        var dfmul = [1,20,6,10,12,14];  // S1 Viterbi
        var dfdiv = [1,15,4,6 ,7 ,8 ];
        var long_frames_bitrates = [0,0,0,0,0, 991,991,991, 1191,1325,1491,1591,1658, 1770,1793,1786,1987,2236, 2487,2656,2689,2650,2981, 3181,3317,3541,3585];
        var short_frames_bitrates = [0,0,0,0,0, 632,765,854, 1165,1299,1432,1521,1610, 1743,1743,1748,1948,2148, 2415,2615,2615,2598,2864, 3042,3220,3486,3486];

        var k_transform = function(fec, mode, is_short_frame) {     //symrate to bitrate
            if (mode == 1) {  //dvb-s2
                var modulator_bitrate = is_short_frame ? short_frames_bitrates[fec] : long_frames_bitrates[fec];
                var result = (modulator_bitrate) / 1000;
            } else {          //dvb-s1
                var k_fec = fec_dividend[fec] / fec_divisor[fec];
                var k_rs = 187 / 204;   //Reed–Solomon
                var result = k_fec * k_rs;   
            }
            return result;   
        }

        var mode = $('.dvbmode_selector:checked').val();
        var fec = $('.fec_selector').val();
        var rolloff = $('.roloff_selector').val();
        var inf = $('.calc_speed').val();
        var symrate = $('.calc_symrate').val();
        var shortframe = 0;
        if (mode == 2) {
            mode = 1;
            shortframe = 1;
        }
        
        var bw = 0;

        if (inf_to_sym == 2) {
            bw = $('.calc_bandwidth').val();
            symrate = bw / rolloff;
            $('.calc_symrate').val(Math.round(symrate));
            inf_to_sym = 0;
        }

        if (inf_to_sym) {
            symrate = inf / k_transform(fec, mode, shortframe);
            bw = symrate * rolloff;
            $('.calc_symrate').val(Math.round(symrate));
            $('.calc_bandwidth').val(Math.round(bw));
        } else {    //inf to sym
            inf = symrate * k_transform(fec, mode, shortframe);
            bw = symrate * rolloff;
            $('.calc_speed').val(Math.round(inf));
            $('.calc_bandwidth').val(Math.round(bw));
        }

    }

    $('.dvbmode_selector').change(function(){
        if ($(this).val() == 0)   //s1
            $('.roloff_selector').val(1.3);
        else
            $('.roloff_selector').val(1.2)
    });


    var modechange = function() {
        var sel = $('.fec_selector');
        var selopt = sel.find('option');
        selopt.show();
        if ($('.dvbmode_selector:checked').val() != 0)     //dvb-s2
        {
            if(sel.val() < 5) sel.val(5);
            for(var i = 0; i < 5; i++)
                $(selopt[i]).hide();
        }
        else //dvb-s1
        {
            if(sel.val() >= 5) sel.val(0);
            for(var i = 5; i < selopt.length; i++)
                $(selopt[i]).hide();
        }
    }

    $('.calc_speed').blur(function(){  calc(1);  });
    $('.calc_symrate').blur(function(){  calc(0);  });
    $('.calc_bandwidth').blur(function() { calc(2); } )
    $('.roloff_selector').blur(function(){  calc(1);  });
    $('.fec_selector').change(function() {  calc(1);  });
    $('.dvbmode_selector').change(function() {  modechange(); calc(1);  });
    $('.dvbmode_selector').change();
}


var current_network = 0;

function tree_item_click(event, selected) {


    var el;
    if(typeof selected !== 'undefined')
        el = $('#'+selected);
    else
        el = $(this).find('span');

    if (el.length == 0)
        return;

    var idarr = el.attr('id').split('_');
    var net_id = idarr[1];
    var obj_type = idarr[2];    //el.attr('data-type');
    var obj_id = idarr[3];

    var node = el;
    var switchme = function() {
        var path = '';
        //types are: 0 root network, 1 vno, 2 stations folder,
        //3 station, 4 controller folder, 5 controller, 6 nms root

        if (event.type == "contextmenu") {
            switch (obj_type) {
                case "0":
                case "1": path = '/net_configure/'; break;
                case "2": path = '/remote_configure/?depth_all=1'; break;
                case "3": path = '/remote/' + obj_id + '/update/'; break;
                case "4": path = '/controller_configure/'; break;
                case "5": path = '/controller_configure/' + obj_id + '/'; break;
                case "6": path = '/network/'; break;
            }
        } else {
            switch (obj_type) {
                case "0":
                case "1": path = '/net_usage/'; break;
                case "2": path = '/remote/?depth_all=1'; break;
                case "3": path = '/remote_dashboard/' + obj_id + '/'; break;
                case "4": path = '/hub_usage/'; break;
                case "5": path = '/controller_dashboard/' + obj_id + '/'; break;
                case "6": path = '/maintenance/'; break;
            }
        }

        need_load = false;
        $.address.value(path);
        need_load = true;
        
        onContentLoad(path, { 'net_id' : net_id, 'obj_type' : obj_type, 'obj_id' : obj_id });
        current_network = net_id;
    }

/*
    if (net_id != current_network) {
        $.get('/switch_network/'+net_id+'/'+obj_type+'/'+obj_id+'/', {}, switchme);
    } else {
        $.get('/switch_network/0/'+obj_type+'/'+obj_id+'/');
    } */
    if(event)
        switchme();


    $('#nav_tree span').removeClass('nav_selected');
    $('#nav_tree .li_marker').remove();
    $('#nav_tree .triangle_marker').remove();

    el.addClass('nav_selected');
    var li_wrap = $('#'+el.attr('id').replace('item', 'group'));
    li_wrap.prepend('<div class="li_marker"></div><div class="triangle_marker"></div>');

    //if (event.type = "contextmenu")
    return false;
}



var loading;
var pending;

var stopUpdates = function() {
    clearInterval(updateIntervalID);
    clearTimeout(updateTimeoutID);
    console.log("Updates stopped");
    $(document).off("contextmenu", "#nav_tree .Container .Content");
}

var hideTreeItems = function() {
    if (supports_html5_storage()) {

        $('li.ExpandOpen:not(.ExpandLeaf)').each(function(index, node) {
            var name = $(node).attr('id');
            if(localStorage[name] == 1) {
                $(node).children('ul').hide();
                $(node).removeClass('ExpandOpen').addClass('ExpandClosed');
            }
        });
    }
}

$(document).ready(function(){

    var zoom = function(zoom_in)
    {
        $('#graphselect_1\\[zoom\\]').val(zoom_in);
        $('#line_graph').submit();
    }

    $(document).on('click', '#zoom1', function() { zoom(1); });
    $(document).on('click', '#zoom2', function() { zoom(2); });

    $(document).on('click', '#nav_tree', tree_toggle);

    Date.prototype.addHours = function(h){ this.setHours(this.getHours()+h); return this; }
    Date.prototype.addMinutes = function(m){ this.setMinutes(this.getMinutes()+m); return this; }
    Date.prototype.addSeconds = function(seconds) {
        return this.setTime(this.getTime() + seconds * 1000);
        //return this;
    }
    Date.serverNow = function() {
        var now = new Date();
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        now_utc.addSeconds($('#tzoffset').val());
        return now_utc;
    }
    Date.fromUnixTimestamp = function(ts) {
        var date = new Date(ts * 1000);     //create date and interpret as utc
        var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        date_utc.addSeconds($('#tzoffset').val());
        return date_utc;
    }

    pending = 0;
    $("#load").hide();
    jQuery.ajaxSetup({
        beforeSend: function() {
            pending++;
            loading = setTimeout(function(){
                if (pending) {
                    $('#load').show();
                    $('#load').text(pending);
                }
             }, 3000);
        },
        complete: function(){
            clearTimeout(loading);
            if (pending) {
                pending--;
                $('#load').text(pending);
                if (pending == 0)
                    $("#load").hide();
            }
        },
        timeout : 10000
    });

    $(document).on("click", "#nav_tree .Container .Content", tree_item_click );
    $(document).on("contextmenu", "#nav_tree .Container .Content", tree_item_click );

    $('#nav_tree').height($(window).height() - 30);
    $('#nav_tree>div>.Container').height($(window).height() - 30);

    updateIntervalID = setInterval(updateTick, 5000);
    updateTick();

    if ($.address.value() == '/')
        $.address.value('/net_usage/');

    $('#acknowledge').click(function(){
        updateTick([{'what' : 'acknowledge'}]);
    });


    if (supports_html5_storage()) {

        $('li.ExpandOpen:not(.ExpandLeaf)').each(function(index, node) {
            var name = $(node).attr('id');
            if(localStorage[name] == 1) {
                $(node).children('ul').hide();
                $(node).removeClass('ExpandOpen').addClass('ExpandClosed');
            }
        });
    }

    tree_item_click(null, 'menuitem_' +$('#selected_item').val());
    processTreeState();

    $(document).on("click", ".triangle_marker", function(){ 
        $('.navContainer').toggle("slide", { direction: "left" }, 1000);
    });

    var secondInterval = setInterval(function() { 
        updateEverySecond(); 
    }, 1000);
});



function setIcon(event, icon) {
    $('.iconsel').removeClass('current');
    $(event.target).closest('.iconsel').addClass('current');
    $('#remote\\[icon\\]').val(icon);
}

function setColor(event, color) {
    $('.colorsel').removeClass('current');
    $(event.target).closest('.colorsel').addClass('current');
    $('#remote\\[color\\]').val(color);
    $('.icons').css('color', color);
}


function longlat() {

    //longitude and latitude picker
    $('.location').each(function(index, domElement) {
        if (($('input[name="controlleredit[latitude]"]').length && $('input[name*="latitude_deg"]').length == 0) || ($('input[name="controlleredit[longitude]"]').length && $('input[name*="longitude_deg"]').length == 0) || ($('input[name="controlleredit[satlon]"]').length && $('input[name*="satlon_deg"]').length == 0) || ($('input[name="remote[latitude]"]').length && $('input[name*="latitude_deg"]').length == 0) || ($('input[name="remote[longitude]"]').length && $('input[name*="longitude_deg"]').length == 0)) {
            //convert minutes from decimal

            var mult = 1000000.0;

            var lonAbs = Math.abs(Math.round($(this).val() * mult));
            var deg = Math.floor(lonAbs / mult);
            var min = Math.floor(  ((lonAbs/mult) - Math.floor(lonAbs/mult)) * 60);
            var sec = Math.floor(((((lonAbs/mult) - Math.floor(lonAbs/mult)) * 60) - Math.floor(((lonAbs/mult) - Math.floor(lonAbs/mult)) * 60)) * 100000) *60/100000;
            var sign = ( $(this).val() >= 0 ) ? 0 : 1;
            if (sec > 30) min++;
            if (min > 59) { min = 0; deg++; }

            var p = $(this).parent();
            var id = $(this).attr('id').substr(0,$(this).attr('id').length-1);

            var degInp = $('<input type="text" size="4" maxlength="4" name="'+ id + '_deg]"/>').val(deg).appendTo(p);
            p.append(' &deg; ');
            var minInp = $('<input type="text" size="2" maxlength="2" name="'+ id + '_min]"/>').val(min).appendTo(p);
            p.append(' &prime; ');
            var signInp = $('<select class="narrow"/  name="'+ id + '_dir]">');

            var isLongitude = $(this).hasClass('longitude') ? 1 : 0;
            if (isLongitude) {
                signInp.append(   $('<option value="0"/>').text('East'),
                            $('<option value="1"/>').text('West') )
            }
            else {
                signInp.append(   $('<option value="0"/>').text('North'),
                            $('<option value="1"/>').text('South') )
            }
            signInp.val(sign);
            signInp.appendTo(p);

            var inp = $(this);
            var change = function() {

                if (isLongitude) {
                    degInp.val(degInp.val() % 360)

                    if (degInp.val() < 0) {
                        sign = 1;
                        signInp.val(sign);
                        degInp.val(Math.abs(degInp.val()));
                    }

                    if (degInp.val() > 180 && degInp.val() < 360) {
                        degInp.val(360 - degInp.val());
                        sign = (sign == 0) ? 1 : 0;
                        signInp.val(sign);
                    }
                }
                else
                {
                    if (degInp.val() < 0) {
                        sign = 1;
                        signInp.val(sign);
                        degInp.val(Math.abs(degInp.val()));
                    }

                    if (degInp.val() > 90)
                        degInp.val(90);
                }


                minInp.val(minInp.val() % 60)

                var _sign = (signInp.val() == 0) ? 1 : -1;
                var abs_d = Math.abs( Math.round(degInp.val() * mult));

                var abs_m = Math.abs(Math.round(minInp.val() * mult)/mult);  //integer
                abs_m = Math.abs(Math.round(abs_m * mult));  //integer

                //var abs_s = Math.abs(Math.round(0 * mult.)/mult);
                //abs_s = Math.abs(Math.round(abs_s * mult.));         // kept as big integer for now, even if submitted as decimal
                var abs_s = 0;

                inp.val( Math.round(abs_d + (abs_m/60.) + (abs_s/3600.) ) * _sign/mult );

            }
            degInp.change(change);
            minInp.change(change);
            signInp.change(change);
        }
    });
}


function validate(what) {

    var is_valid = function(type, n) {
        switch(type) {
            case 'number': return !isNaN(parseFloat(n)) && isFinite(n);
            case 'int': {
                if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');
                return is_valid('number', n) && parseFloat(n) == parseInt(n, 10);
            }
            case 'bw_range': {
                if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');
                return (is_valid('int', n) && ((n >= 900000 && n <= 2100000) || (n >= 4000000 && n <= 7000000) || (n >= 10700000 && n <= 18000000) || (n >= 26500000 && n <= 40000000)));
            }
            case 'frequency': {
                if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');
                return (is_valid('int', n) && ((n >= 950000 && n <= 2050000) || (n >= 4000000 && n <= 7000000) || (n >= 10700000 && n <= 18000000) || (n >= 26500000 && n <= 40000000)));
            }
            case 'bw_end_freq_sep': {
                    if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');
                    var start_frequency = Number($('#bandwidth\\[start_frequency\\]').val());
                    if ( is_valid('frequency', n) && start_frequency !== '' && n > start_frequency ) {
                        if ( (start_frequency >= 950000 && start_frequency <= 2050000 && n >= 950000 && n <= 2050000) || (start_frequency >= 4000000 && start_frequency <= 7000000 && n >= 4000000 && n <= 7000000) || (start_frequency >= 10700000 && start_frequency <= 18000000 && n >= 10700000 && n <= 18000000) || (start_frequency >= 26500000 && start_frequency <= 40000000 && n >= 26500000 && n <= 40000000) ) {
                            return true;
                        }
                    }

                    return false;
            }
            case 'bw_frequency_tx':
            {
                if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');

                var bw_list_string = $('#bw_list').html();
                if ( bw_list_string != '[]' )
                {
                    var bw_list = $.parseJSON($('#bw_list').html());

                    for ( bw_item in bw_list)
                    {
                        var start_frequency = Number(bw_list[bw_item].start_frequency);
                        var end_frequency = Number(bw_list[bw_item].end_frequency);
                        if ( n >= start_frequency && n <= end_frequency ) return true;
                    }
                }
                else
                {
                    return is_valid('frequency', n);
                }

                return false;
            }
            case 'bw_frequency_rx':
            {
                if ( typeof(n) == 'string' ) n = n.replace(/[^0-9.]/g, '');

                var bw_list_string = $('#bw_list').html();
                if ( bw_list_string != '[]' )
                {
                    var bw_list = $.parseJSON(bw_list_string);

                    for ( bw_item in bw_list)
                    {
                        var satellite_translation = Number(bw_list[bw_item].satellite_translation);
                        var start_frequency = Number(bw_list[bw_item].start_frequency);
                        var end_frequency = Number(bw_list[bw_item].end_frequency);

                        if ( n >= (start_frequency - satellite_translation) && n <= (end_frequency - satellite_translation) ) return true;
                    }
                }
                else
                {
                    return is_valid('frequency', n);
                }

                return false;
            }
            case 'sr':          return (is_valid('int', n) && n >= 1 && n <= 32768);
            case 'tx':          return (is_valid('number', n) && n >= 1.0 && n <= 36.0);
            case 'cn':          return (is_valid('number', n) && n >= 0.1 && n <= 30.0);
            case 'station':     return (is_valid('int', n) && n >= 1 && n <= 2048);
            case 'bw_active':   return (is_valid('int', n) && n >= 1 && n <= 255);
            case 'bw_idle':     return (is_valid('int', n) && n >= 1 && n <= 255);
            case 'bw_down':     return (is_valid('int', n) && n >= 1 && n <= 255);
            case 'bw_timeout':  return (is_valid('int', n) && n >= 0 && n <= 10);
            case 'mask':
                                if ($('input[name=remoteroute\\[typename\\]]:checked').val() == 'rt_ip_station') { // mask 0 in remote ip address drives to network failure (tx map 0.0.0.0 on hub)
                                    return (is_valid('int', n) && n >= 8 && n <= 32);
                                } else {
                                    return (is_valid('int', n) && n >= 0 && n <= 32);
                                }
            case 'framelen':    return (is_valid('int', n) && n >= 16 && n <= 252 && (n%4==0));
            case 'ip': {
                var ip_parts = n.split(".");
                if (ip_parts.length != 4) return false;
                for(i=0; i<4; i++) {
                    if (!(is_valid('int', ip_parts[i]))) return false;
                    if (ip_parts[i] < 0 || ip_parts[i] > 255) return false;
                }
                return true;
            }
            case 'tlc_cn':      return (is_valid('number', n) && n >= 1.0 && n <= 50.0);
            case 'tlc_max':      return (is_valid('number', n) && n >= 1.0 && n <= 36.0);
            case 'acm_and_fec': {
                var fec_id = $('#controlleredit\\[tdmtx_fec\\]').val();
                var acm = $('#controlleredit\\[acm_enable\\]');

                if (acm.is(':checked')) {
                    if (fec_id < 9) {
                        return false;
                    }
                }
                return true;
            }
            case 'acm_ordering': { // проверка каналов ACM по возрастанию
                var enabled = $('#controlleredit\\[acm_enable\\]').is(':checked');
                var cn_limit = 0;
                var prev_cn_limit = 0;
                var ordered = true;
                if (enabled) {
                    $('select[name*=acm_fec]').each(function() {
                        var curr_channel = Number($(this).val());
                        switch (curr_channel) {
                            case 9: cn_limit = 3.3; break;
                            case 10: cn_limit = 4.2; break;
                            case 11: cn_limit = 5.0; break;
                            case 12: cn_limit = 5.5; break;
                            case 13: cn_limit = 6.4; break;
                            case 14: cn_limit = 6.5; break;
                            case 15: cn_limit = 7.6; break;
                            case 16: cn_limit = 7.5; break;
                            case 17: cn_limit = 8.6; break;
                            case 18: cn_limit = 9.9; break;
                            case 19: cn_limit = 11.3; break;
                            case 20: cn_limit = 11.3; break;
                            case 21: cn_limit = 10.3; break;
                            case 22: cn_limit = 11.0; break;
                            case 23: cn_limit = 11.8; break;
                            case 24: cn_limit = 12.2; break;
                            case 25: cn_limit = 13.4; break;
                            case 26: cn_limit = 13.5; break;
                        }

                        if (prev_cn_limit >= cn_limit) {
                            ordered = false;
                        }
                        prev_cn_limit = cn_limit;
                    });
                    if (!ordered) {
                        return false;
                    }
                }
                return true;
            }
        }
        return true;
    };

    var invalid_messages = function(type) {
        switch(type) {
            case 'number': return 'Input a number';
            case 'int': return 'Input an integer';
            case 'frequency': return 'Frequency must be in ranges: 950..2050 MHz, ';
            case 'sr': return 'Symbol rate must be in range 1..32768';
            case 'tx': return 'Tx level must be between in range -360..-10';
            case 'cn': return 'Carrier-to-noise must be in range 1..300';
            case 'station': return 'Station must be in range 1..2048';
            case 'acm_and_fec': return 'With enabled acm must be equal or greater than QPSK 2/3';
            case 'acm_ordering': return 'ACM C/N\'s not in increasing order';
        }
    }

    var resg = true;
    what.find('input, select').each(function(index, domElement) {

        var val = $(this).val();

        validate_tdma_freq = true;
        if ( $(this).hasClass('tdma_freq') )
        {
            var num = $(this).attr('id');
            num = num.replace(/[^0-9]/g, '');

            if ( !$('#controlleredit\\[tdmrf_enable_' + num + '\\]').is(':checked') ) validate_tdma_freq = false;
            $(this).removeClass('error');
            $(this).closest('p').find('.form-horizontal-help.error').removeClass('error').text('');
        }

        if ( $(this).attr('data-validate') && !$(this).is(':hidden') && validate_tdma_freq ) {
            $(this).removeClass('error');
            $(this).closest('p').find('.form-horizontal-help.error').removeClass('error').text('');

            var types = $(this).attr('data-validate').split(' ');

            var res = true;
            var i = 0;
            for (i = 0; i < types.length; i++) {
                if (!is_valid(types[i], val)) {
                    res = false;
                    break;
                }
            }

            if (res == false) {
                resg = false;
                $(this).addClass('error');
                $(this).closest('p').find('.form-horizontal-help').addClass('error').text(invalid_messages(types[i]));
            }
        }
    });

    if ($('span.error').length) {
        var err_offset = $('span.error:first').offset();
        var err_width = $('span.error:first').width();
        var err_height = $('span.error:first').height();

        // Scroll to first error message only if it isn't visible in viewport
        if (err_offset.top >= 0 && err_offset.left >= 0 && (err_offset.left + err_width) <= $(window).width() && (err_offset.top + err_height) <= $(window).height()) {
            $('html, body').animate({
                scrollTop: $('span.error:first').offset().top - 30
            }, 250);
        }
    }

    return resg;
}




function pushtograph(datasrc, data, annotations) {
    var arrayUnique = function(array, getsortfieldfunc){
        var u = {}, a = [];
        var l = array.length-1;
        for(var i = l; i >= 0; --i) {
            var field = getsortfieldfunc(array[i]);
            if(u.hasOwnProperty(field)) {
                continue;
            }
            a.unshift(array[i]);
            u[field] = i+1;
        }
        return a;
    }

    updategraph(datasrc);   //renew subscription
    data = JSON.parse(data);
    if (!data)
        return;

    for (var ix=0;ix<data.length;ix++) {            //to time
        data[ix][0] = new Date(data[ix][0] * 1000); //Date.fromUnixTimestamp(data[ix][0]);
    }
    // data = data.slice(1);  //first point is always null

    var olddata = graphs[datasrc].data;
    olddata = olddata.concat(data);
    olddata = arrayUnique(olddata , function(item) { return item[0].getTime(); });

    olddata.sort(function(a, b){
        return ( a[0].getTime() < b[0].getTime() ? -1 : 1 );
    });

    if (olddata.length > 360)
        olddata = olddata.slice(olddata.length - 360);

    graphs[datasrc].graph.updateOptions( { 'file': olddata } );
    graphs[datasrc].data = olddata;

    //weather
    var oldannotations = graphs[datasrc].graph.annotations();
    if (annotations) {
        annotations = JSON.parse(annotations);
        if (!annotations)
            return;

        annotations = transformAnnotationData(annotations);
        oldannotations = oldannotations.concat(annotations);
        oldannotations = arrayUnique(oldannotations, function(item) { return item.x; });
    }

    var minimal_time = olddata[0][0].getTime();
    var rotten = [];
    for (var i = oldannotations.length - 1; i >= 0; i--) {
        if (oldannotations[i].x < minimal_time) {
            rotten = rotten.concat(oldannotations.splice(i, 1));
        }
    };
    
    if (rotten.length) {
        rotten[0].x = minimal_time;
        oldannotations.unshift(rotten[0])
    }

    graphs[datasrc].graph.setAnnotations(oldannotations);

}

function updategraph(datasrc) {
    var from = parseInt((new Date()).getTime() / 1000, 10) - 5;
    for (var i = graphs[datasrc].data.length - 1; i >= 0; i--) {
        if ( graphs[datasrc].data[i][1] != null) {    //point exists
            from = graphs[datasrc].data[i][0].getTime() / 1000 - 120;    //+3 points
            break;
        }
    };

    //var from = graphs[datasrc].data[graphs[datasrc].data.length-1][0].getTime() / 1000;
    var to = parseInt(5 + (new Date()).getTime() / 1000, 10);

    //if (from !== to)
        subscribe({
            'what' : 'graph',
            'datasrc' : datasrc,
            'from' : from,
            'to' : to
        });

    //updateTick('graph', datasrc, from, to);
}


function logFormHandlers() {

    var form = $('#logc');
    if(!form)
        return;

    var startDateField = $('#logcontrols\\[start_time\\]');
    var endDateField = $('#logcontrols\\[end_time\\]');

    if (!startDateField.length || !endDateField.length)
        return;

    var onTypeChange = function(newval){
        if (newval == 0) {
            $('#log_daterange').hide();
        } else {
            $('#log_daterange').show();
        }
    }
    var typeselector = $('.typeselector');
    onTypeChange($('.typeselector:checked').val());
    typeselector.change(function() { 
        onTypeChange($(this).val());
        form.submit();
    });

    $('.pickdate').datetimepicker({
        controlType: 'select',
        timeFormat: 'HH:mm',
        dateFormat: 'yy-mm-dd',
        onClose: function(dateText, inst) {
            var start = Date.parse(startDateField.val());
            var end = Date.parse(endDateField.val());
            if (start.compareTo(end) > 0) {
                startDateField.val(end.toString('yyyy-MM-dd HH:mm'));
                endDateField.val(start.toString('yyyy-MM-dd HH:mm'));
            }
            //return false;
            form.submit();
        }
    });

    var range = function(start, end) {
        startDateField.val(start.toString('yyyy-MM-dd HH:mm'));
        endDateField.val(end.toString('yyyy-MM-dd HH:mm'));
        form.submit();
    }

    var makeRange = function(hours, days, months) {
        var date = new Date();
        var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); //js utc

        var s = date_utc.clone().add({
            seconds: $('#tzoffset').val(),
            hours: hours,
            days: days,
            months: months
        });

        var e = date_utc.add({
            seconds: $('#tzoffset').val()
        });

        range(s, e); 
    }

    $('#show_hour').click(function() { makeRange(-1, 0, 0); });
    $('#show_day').click(function() { makeRange(0, -1, 0); });
    $('#show_month').click(function() { makeRange(0, 0, -1); });
    
}



function graphFormHandlers() {

    graphClickCallback = null;

    var form = $('#graph_form');
    if(!form)
        return;

    var startDateField = $('#graph\\[start_time\\]');
    var endDateField = $('#graph\\[end_time\\]');

    if (!startDateField.length || !endDateField.length)
        return;

    $('.pickdate').datetimepicker({
        controlType: 'select',
        timeFormat: 'HH:mm',
        dateFormat: 'yy-mm-dd',
        onClose: function(dateText, inst) {
            var start = Date.parse(startDateField.val());
            var end = Date.parse(endDateField.val());
            if (start.compareTo(end) > 0) {
                startDateField.val(end.toString('yyyy-MM-dd HH:mm'));
                endDateField.val(start.toString('yyyy-MM-dd HH:mm'));
            }
            form.submit();
            return false;
        }
    });

    $('#graph\\[source_type\\]').change(function(){ form.submit(); });
    $('#graph\\[display_error\\]').change(function(){ form.submit(); });
    $('.display_faults').change(function(){ form.submit(); });
    if ($('.display_faults').prop('checked'))
        $('.faultslegend').show();

    var pan = function(zoom, offset, center) {
        var start = Date.parse(startDateField.val());
        var end = Date.parse(endDateField.val());

        //graphs[datasrc].data
        var range = end.getTime() - start.getTime();
        if (!center)
            center = start.clone().addMilliseconds(range / 2);
        else
            center = new Date(center);

        range *= zoom;
        if (range < 120000)
            return;

        if(!offset) offset = 0;
            offset *= range;


        start.setTime(center.clone().addMilliseconds(-range/2 + offset));
        end.setTime(center.clone().addMilliseconds(range/2 + offset));
        startDateField.val(start.toString('yyyy-MM-dd HH:mm'));
        endDateField.val(end.toString('yyyy-MM-dd HH:mm'));
        form.submit();
    }

    var range = function(start, end) {
        startDateField.val(start.toString('yyyy-MM-dd HH:mm'));
        endDateField.val(end.toString('yyyy-MM-dd HH:mm'));
        form.submit();
    }

    var makeRange = function(hours, days, months) {
        var date = new Date();
        var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); //js utc

        var s = date_utc.clone().add({
            seconds: $('#tzoffset').val(),
            hours: hours,
            days: days,
            months: months
        });

        var e = date_utc.add({
            seconds: $('#tzoffset').val()
        });

        range(s, e); 
    }

    $('#show_hour').click(function() { makeRange(-1, 0, 0); });
    $('#show_day').click(function() { makeRange(0, -1, 0); });
    $('#show_month').click(function() { makeRange(0, 0, -1); });

    graphClickCallback = function(e, x, points) { pan(1, 0, x); }
    $('#zoom_in').click(function() { pan(0.8); });
    $('#zoom_out').click(function() { pan(2); });
    $('#scroll_left').click(function() { pan(1, -0.5); });
    $('#scroll_right').click(function() { pan(1, 0.5); });


}

function userlogFormHandlers() {
    var form = $('#ulogc');
    if (!form.length) return;

    var startDateField = $('#useractivitylog\\[start_time\\]');
    var endDateField = $('#useractivitylog\\[end_time\\]');

    if (!startDateField.length || !endDateField.length) return;

    var onTypeChange = function(newval) {
        if ( newval == 0 ) {
            $('#ulog_daterange').hide();
        }
        else {
            $('#ulog_daterange').show();
        }
    }
    var typeselector = $('.typeselector');

    onTypeChange($('.typeselector:checked').val());

    typeselector.change(function() { 
        onTypeChange($(this).val());
        form.submit();
    });

    $('.actiontypeselector').change( function() {
        form.submit();
    });

    $('.pickdate').datetimepicker({
        controlType: 'select',
        timeFormat: 'HH:mm',
        dateFormat: 'yy-mm-dd',
        onClose: function(dateText, inst) {
            var start = Date.parse(startDateField.val());
            var end = Date.parse(endDateField.val());
            if (start.compareTo(end) > 0) {
                startDateField.val(end.toString('yyyy-MM-dd HH:mm'));
                endDateField.val(start.toString('yyyy-MM-dd HH:mm'));
            }
            //return false;
            form.submit();
        }
    });

    var range = function(start, end) {
        startDateField.val(start.toString('yyyy-MM-dd HH:mm'));
        endDateField.val(end.toString('yyyy-MM-dd HH:mm'));
        form.submit();
    }

    var makeRange = function(hours, days, months) {
        var date = new Date();
        var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); //js utc

        var s = date_utc.clone().add({
            seconds: $('#tzoffset').val(),
            hours: hours,
            days: days,
            months: months
        });

        var e = date_utc.add({
            seconds: $('#tzoffset').val()
        });

        range(s, e); 
    }

    $('#ulog_show_hour').click(function() { makeRange(-1, 0, 0); });
    $('#ulog_show_day').click(function() { makeRange(0, -1, 0); });
    $('#ulog_show_month').click(function() { makeRange(0, 1, -1); });

    var setActivity = function(activityType) {
        var activityField = $('#useractivitylog\\[activity\\]');
        activityField.val(activityType);
        form.submit();
    }

    $('#show_changes').click(function() { setActivity(1); });
    $('#show_browse').click(function() { setActivity(2); });
}

function reportFormHandlers() {
    var form = $('#report-manager');
    if ( !form.length ) return;

    var type_field = $('#report\\[type\\]');
    var object_field = $('#report\\[object_id\\]');
    var start_time_field = $('#report\\[start_time\\]');
    var end_time_field = $('#report\\[end_time\\]');
    var format_field = $('#report\\[format\\]');

    $('.pickdate').datepicker({
        dateFormat: 'yy-mm-dd',
    });

    var onFilterChange = function() {
        var type_id = $('#report\\[type\\]').val();
        var object_id = $('#report\\[object_id\\]').val();
        var start_time = $('#report\\[start_time\\]').val();
        var end_time = $('#report\\[end_time\\]').val();
        var format = $('#report\\[format\\]').val();

        if ( start_time != '' && end_time != '' ) {
            $('#generate-report').prop('href', '/report/?type=' + type_id + '&object=' + object_id + '&from=' + start_time + '&to=' + end_time + '&format=' + format);
        }
    }

    type_field.change( function() {
        onFilterChange();
    });

    object_field.change( function() {
        onFilterChange();
    });

    start_time_field.change( function() {
        onFilterChange();
    });

    end_time_field.change( function() {
        onFilterChange();
    });

    format_field.change( function() {
        onFilterChange();
    });

    $('#report_day').click(function() { makeRange(0, 0, 0); });
    $('#report_week').click(function() { makeRange(0, -6, 0); });
    $('#report_month').click(function() { makeRange(0, 1, -1); });

    var makeRange = function(hours, days, months) {
        var date = new Date();
        var date_utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); //js utc

        var s = date_utc.clone().add({
            seconds: 0,
            hours: hours,
            days: days,
            months: months
        });

        var e = date_utc.add({
            seconds: 0
        });

        range(s, e); 
    }

    var range = function(start, end) {
        start_time_field.val(start.toString('yyyy-MM-dd'));
        end_time_field.val(end.toString('yyyy-MM-dd'));
        onFilterChange();
    }
}


function transformAnnotationData(annotations) {
    for (var ix=0;ix<annotations.length;ix++) { //timestamp
        annotations[ix].x = annotations[ix].x * 1000;
        annotations[ix].icon = getWeatherIcon(annotations[ix].icon);
        annotations[ix].attachAtBottom = true;
        annotations[ix].width = 16;
        annotations[ix].height = 16;
        annotations[ix].tickHeight = 6;
    }
    return annotations;
}

function buildgraph() {

    $(".graphdiv").each(function() {

        var el = $(this);
        var cont = el.closest('.graphcontainer');

        var labels = JSON.parse(cont.find('.glabels').text());
        var gplotlabels = cont.parent().find('.gplotlabels').get(0);
        var data = JSON.parse(cont.find('.gdata').text());
        var faults = JSON.parse(cont.find('.gfaults').text());
        var datasrc = cont.find('.gdatasrc').text();
        datasrc = datasrc.replace(/#.*/g, '');

        var annotations = cont.find('.gannotations').text();
        if (annotations) 
            annotations = JSON.parse(annotations);
        else 
            annotations = [];
        
        annotations = transformAnnotationData(annotations);

        var options = JSON.parse(cont.find('.gdataopt').text());
        if (!options)
            options = {};

        if (!data || !data.length)
            return;

        for (var ix = 0; ix < data.length; ix++) {
            data[ix][0] = new Date(data[ix][0] * 1000);
        }

        //var underlay_callback = null;
        //if ($('.display_faults').prop('checked')) {
        underlay_callback = function(ctx, area, g) {

            if (!$('.display_faults').prop('checked'))
                return;

            var maxfaults = 13;
            var fault_possible_mask = 0xe3ff;
            var zoneh = area.h / (maxfaults);
            ctx.fillStyle = "rgb(255, 0, 0)";
            //var ts = faults[faults.length-1][1] = 0xffff;
            
            for (var ix = 0; ix < faults.length; ix++) {
                var ts = faults[ix][0];
                var ts_next = (ix+1 < faults.length) ? faults[ix+1][0] : (ts + 5);
                var fault = faults[ix][1];
                var j = -1;
                if (fault)
                    for (var i = 0; i < 16; i++) {
                        if (fault_possible_mask & (1 << i)) j++;
                        if (!(fault & (1 << i))) continue;
                        var centerY = j * zoneh + zoneh / 2;
                        var centerX = g.toDomCoords(ts*1000, 0)[0];
                        var centerX2 = g.toDomCoords((ts_next)*1000, 0)[0];    //tick time
                        var width = centerX2-centerX;
                        ctx.fillRect(centerX-width/2,centerY-2,width,4);
                    }
            }
        }
        //}

        var error_bars = false;
        if ($('#graph\\[display_error\\]').prop('checked')) {
            error_bars = true;
        }

        //if (!error_bars)
        //    fill_graph = (data && data[0].length < 4);

        var draw_callback = function() {
            //drawCallback
                //updategraph(datasrc);
                //timeout 1 s
                //1 update at once
        }

        var defaultOptions = {
                labels: labels,
                yRangePad : 2,
                colors : ['#FF8300', 'DeepSkyBlue', 'darkgreen',
                    'purple', 'blue', 'orangered', 'red'],
                drawPoints: false,
                drawGapEdgePoints : true,
                animatedZooms : false,
                customBars : error_bars,
                includeZero : true,
                yAxisLabelWidth : 50,
                labelsDiv : gplotlabels,
                legend : 'always',
                labelsSeparateLines : false,
                labelsDivStyles : {},
                maxNumberWidth : 9,
                labelsKMB : true,
                drawAxesAtZero : true,
                strokeWidth: 1.5,
                //valueRange : [0, 14],
                gridLineColor : '#ccc',
                clickCallback: graphClickCallback,
                //rollPeriod : 5,
                //showRoller : true,
                //showRangeSelector: true,
                axes: {
                x: {
                    //converts values for displaying labels below graph: real_timezone -> utc -> user_timezone
                    axisLabelFormatter: function(d, gran) {
                        var date_utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
                        date_utc.addSeconds($('#tzoffset').val());
                        //d.addSeconds(-$('#tzoffset').val());
                        return Dygraph.dateAxisFormatter( date_utc, gran);
                    },
                    //converts values for displaying legend: real_timezone -> utc -> user_timezone
                    valueFormatter: function(date) {       //was Dygraph.dateString_ 
                        var zeropad = Dygraph.zeropad;

                        var d = new Date(date);
                        var date_utc = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
                        date_utc.addSeconds($('#tzoffset').val());

                        var year = "" + date_utc.getFullYear();    // Get the year:                    
                        var month = zeropad(date_utc.getMonth() + 1);  // Get a 0 padded month string //months are 0-offset, sigh
                        var day = zeropad(date_utc.getDate()); // Get a 0 padded day string

                        var ret = "";
                        var frac = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
                        if (frac) {
                            ret = " " + //Dygraph.hmsString_(date);
                            Dygraph.zeropad(date_utc.getHours()) + ":" +
                            Dygraph.zeropad(date_utc.getMinutes()) + ":" +
                            Dygraph.zeropad(date_utc.getSeconds());
                        }

                        return year + "-" + month + "-" + day + ret;
                    },
                },
                },
                underlayCallback: underlay_callback
           };

        for (var key in options) {
            defaultOptions[key] = options[key];
        }

        var g = new Dygraph(el.get(0), data, defaultOptions);


       //$('.display_faults').on('change', function() { g.updateOptions(); });

        graphs[datasrc] = {};
        graphs[datasrc].graph = g;
        graphs[datasrc].data = data;

    // var dttt = 1406036425000;
    //annotations = [];
    /*
    annotations.push( {
        series: 'Controller RX C/N',
        x: dttt,
        shortText: 'P',
        text: "Coldest Day",
        icon: '/images/icons/weather/weather-rain.png',
        width: 16,
        height: 16,
        tickHeight: 4
    } );
    */
        if (annotations.length)
            graphs[datasrc].graph.setAnnotations(annotations);

        if (typeof options.update === 'undefined' && options.update != 0)
            updategraph(datasrc);
    } );

    return;
}

function randomStr(m) {
    var m = m || 9;
    s = '';
    r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i=0; i < m; i++) {
        s += r.charAt(Math.floor(Math.random()*r.length));
    }
    return s;
}