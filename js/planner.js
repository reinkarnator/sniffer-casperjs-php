

    var FrequencyPlannerControls = function() {}

    FrequencyPlannerControls.prototype.init = function() {
        if (this.f) {
            this.f.destroy();
            this.f = null;
        }

        this.canvas = document.getElementById('frequency_planner_canvas');
        if(this.canvas) {
            this.create();
            this.createBindings();    
        }

    }

    FrequencyPlannerControls.prototype.getBounds = function() {
        var start = Math.floor(this.f.transformer.startTimestamp);
        var end = Math.floor(this.f.transformer.endTimestamp);

        //temp timezone bugfix
        start -= 86400;
        end += 86400;

        return { start : start, end : end };
    }


    FrequencyPlannerControls.prototype.updateTimestamps = function(updateRequest) {
        if(!this.f || !this.f.transformer)
            return;

        for (var i = updateRequest.length - 1; i >= 0; i--) {
            if (updateRequest[i].what == 'frequency_planner') {
                updateRequest[i].datasrc = this.getBounds();
                break;
            }
        };
    }

    FrequencyPlannerControls.prototype.create = function() {
        if(!this.f && this.canvas) {
            var canvas = this.canvas;

            var data = {
                "bandwidth" : [],
                "allocation" : [],
            };

            canvas.height = $(window).height() - 270;
            canvas.width = $('#frequency_planner').width();
            this.f = new FrequencyPlanner(canvas, data, {
                tzOffset : $('#tzoffset').val(),
                autoupdate : true,
                clickHandler : this.clickHandler()
            });

            subscribe({
                'what' : 'frequency_planner',
                'datasrc' : this.getBounds(),
            });
            updateTick([{ 'what' : 'frequency_planner', datasrc: this.getBounds() }]);
        }

        var display_canvas = $('#frequency_display_canvas')[0];
        display_canvas.width = $('#frequency_planner').width();
        var display_data = JSON.parse($('#frequency_plan').html());

        $('.frequency-display-switcher').click(function() {
            if ( $(this).hasClass('closed') ) {
                $('.white_lightshadow').animate({height: "75px"}, 100);
                $('.frequency_display_switched').show();
                $(this).removeClass('closed').addClass('opened');
                $('.frequency-display-switcher i').removeClass('fa-caret-down').addClass('fa-caret-up');
            } else {
                $('.white_lightshadow').animate({height: "2px"}, 100);
                $('.frequency_display_switched').hide();
                $(this).removeClass('opened').addClass('closed');
                $('.frequency-display-switcher i').removeClass('fa-caret-up').addClass('fa-caret-down');
            }
        })


        subscribe({
            'what' : 'frequency_display'
        });
        this.fdisp = new FrequencyDisplay(display_canvas, display_data, {});
    }

    FrequencyPlannerControls.prototype.serviceForm = function(planner_id, alloc_id, self) {
        var self = this;
        var params = {'action' : 'getform', 'planner_id' : planner_id, 'alloc_id' : alloc_id };

        $('#add_res_form').draggable();

        $.get('/frequency_plan/', params, function(data){

            $('#fp_form_content').html(data);

            self.pickDateText = $('.custom_start_date').text();

            $('#add_res_form').slideDown(100);

            $('.custom_start_date').click(function(){
                $('.start_datepicker_container').toggle();
            });

            $('.custom_end_date').click(function(){
                $('.end_datepicker_container').toggle();
            });

            var set_duration = function() {
                var count = parseInt($('.duration').val());
                var start_time = $('.start_hm').val();
                var start_date = $('.start_date').val();
                time = Date.parse(start_date + ' ' + start_time);
                time.add(count).minutes();
                $('.end_hm').val(time.toString('HH:mm'));
                var end_date = time.toString('yyyy-MM-dd')
                if ($('.end_date').val() != end_date) {
                    $('.end_date').val(end_date);
                    $('.end_date_type').removeClass('selected');
                    $('.custom_end_date').text(end_date);
                    $('.custom_end_date').addClass('selected');       
                }
            }
            $('.set_duration').click(set_duration);
            $('.duration').blur(set_duration);

            $('.start_date_label').click(function(){
                var selected_date = $(this).attr('data-date');
                $('.start_date').val(selected_date);
                $('.start_date_type').removeClass('selected');
                $(this).addClass('selected');
                $('.custom_start_date').text(self.pickDateText);
                $('.start_datepicker_container').hide();
            });

            $('.end_date_label').click(function(){
                var selected_date = $(this).attr('data-date');
                $('.end_date').val(selected_date);
                $('.end_date_type').removeClass('selected');
                $(this).addClass('selected');
                $('.custom_end_date').text(self.pickDateText);
                $('.end_datepicker_container').hide();
            });


            $('.start_datepicker').datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: "yy-mm-dd",
                defaultDate: $('.start_date').val(),
                altField: ".start_date",
                altFormat: "yy-mm-dd",
                onSelect : function(date) {
                    $('.start_date_type').removeClass('selected');
                    $('.custom_start_date').text(date);
                    $('.custom_start_date').addClass('selected');
                    $('.start_datepicker_container').hide();
                }
            });

            $('.end_datepicker').datepicker({
                changeMonth: true,
                changeYear: true,
                dateFormat: "yy-mm-dd",
                defaultDate: $('.end_date').val(),
                altField: ".end_date",
                altFormat: "yy-mm-dd",
                onSelect : function(date) {
                    $('.end_date_type').removeClass('selected');
                    $('.custom_end_date').text(date);
                    $('.custom_end_date').addClass('selected');
                    $('.end_datepicker_container').hide();
                }
            });

            var lvl_auto = function(){
                if ($('.txlvl_auto').is(':checked')) {
                    $('.txlvl_val').hide();
                } else {
                    $('.txlvl_val').show();
                }
            }
            $('.txlvl_auto').click(lvl_auto);
            lvl_auto();

            $('.timepicker').timepicker();

            $('.t_advanced').click(function() { $('.sh_advanced').slideToggle('fast') })

            $('#cancel').click(function(){
                self.add_res_form_cnt++;
                $('#add_res_form').slideUp(100);
                return false;
            });


            addDbFieldsHandlers();


            var processJsonResponce = function(data) {
                var text = $('<div>').html(data).html();    //html entities to unicode
                var obj = JSON.parse(text);

                if(obj.error == 0){
                    $('#add_res_form').slideUp(100);
                    self.add_res_form_cnt++;

                    self.f.update(obj);

                } else {
                    $('#error_desc').html(obj.data).show();
                }
            }


            $('#add_submit').click(function() {

                var url = '/frequency_plan/insert/';
                if ($('#frequencyplannerallocation\\[alloc_id\\]').val() != 0)
                    url = '/frequency_plan/' + $('#frequencyplannerallocation\\[alloc_id\\]').val() + '/update/';

                $.post(url, $('#form_add').serializeArray(), processJsonResponce);
                return false;
            })

            $('#delete_submit').click(function() {

                if ($('#frequencyplannerallocation\\[alloc_id\\]').val() == 0)
                    return false;

                var url = '/frequency_plan/' + $('#frequencyplannerallocation\\[alloc_id\\]').val() + '/delete/';
                $.get(url, null, processJsonResponce);
                return false;
            });

            //onContentReady();  
        });
    }


    FrequencyPlannerControls.prototype.clickHandler = function() {
        var self = this;
        return function(data) {
            var planner_id = $('#sh_id').val();
            self.serviceForm(planner_id, data.id);
        }
    }


    FrequencyPlannerControls.prototype.createBindings = function() {

        var self = this;

        self.add_res_form_cnt = 0;
        $('#add_reservation').click(function() { 
            if (self.add_res_form_cnt % 2 == 0)
                self.serviceForm($('#sh_id').val(), 0)
            else
                $('#add_res_form').slideUp(100);

            self.add_res_form_cnt++;
        });


        $('#range_hour').click(function(){ self.f.updateRange(3600); });
        $('#range_day').click(function(){ self.f.updateRange(86400); });
        $('#range_twodays').click(function(){ self.f.updateRange(2*86400); });
        $('#range_week').click(function(){ self.f.updateRange(7*86400); });
        $('#range_month').click(function(){ self.f.updateRange(30*86400); });
         


        var getDiff = function() {
            var period = $('#period').val();
            var diff = 86400;
            switch(period) {
                case 'hour': diff = 3600; break;
                case 'day': diff = 86400; break;
                case 'twodays': diff = 86400; break;
                case 'week': diff = 86400; break;
                case 'month': diff = 86400; break;
            }
            return diff;
        }

        var plusminus = function(sign){
           var diff = getDiff();
           var start_time = $('#start_time').val() - (-1 * diff * sign);
           $('#start_time').val(start_time);
           chart_reload();
        }

        $('#minus').click(function() { plusminus(-1); return false; });
        $('#plus').click(function() { plusminus(1); return false; });

    }

    /*
    //bw: startf endf
    //alloc: freq width start end 
    var data = {
        "bandwidth" : [
            [1, 3000000, 5000000],
            [2, 6000000, 7000000],
        ],
        "allocation" : [
            //[ 3500000, 14000, 1, 2000000000 ],
            [ 1, 3800000, 50000, <?php echo time()-1200 ?>,  <?php echo time()-400?> ],
            [ 2, 6500000, 60000, <?php echo time() ?>, <?php echo time()+600?> ]
        ]
    };
    */


