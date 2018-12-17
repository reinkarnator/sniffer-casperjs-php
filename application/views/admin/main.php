<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title><?php echo __("Титул для главной",null); ?></title>

        <!-- CSS Reset -->
		<link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/reset.css";?>" media="screen" />

        <!-- Fluid 960 Grid System - CSS framework -->
		<link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/grid.css";?>" media="screen" />

        <!-- IE Hacks for the Fluid 960 Grid System -->
        <!--[if IE 6]><link rel="stylesheet" type="text/css" href="css/ie6.css" tppabs="http://www.xooom.pl/work/magicadmin/css/ie6.css" media="screen" /><![endif]-->
		<!--[if IE 7]><link rel="stylesheet" type="text/css" href="css/ie.css" tppabs="http://www.xooom.pl/work/magicadmin/css/ie.css" media="screen" /><![endif]-->

        <!-- Main stylesheet -->
        <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/styles.css";?>" media="screen" />

        <!-- WYSIWYG editor stylesheet -->
        <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/jquery.wysiwyg.css";?>" media="screen" />

        <!-- Table sorter stylesheet -->
        <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/tablesorter.css";?>" media="screen" />

        <!-- Thickbox stylesheet -->
        <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/thickbox.css";?>" media="screen" />

        <!-- Themes. Below are several color themes. Uncomment the line of your choice to switch to different color. All styles commented out means blue theme. -->
        <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/theme-blue.css";?>" media="screen" />
        <!--<link rel="stylesheet" type="text/css" href="css/theme-red.css" media="screen" />-->
        <!--<link rel="stylesheet" type="text/css" href="css/theme-yellow.css" media="screen" />-->
        <!--<link rel="stylesheet" type="text/css" href="css/theme-green.css" media="screen" />-->
        <!--<link rel="stylesheet" type="text/css" href="css/theme-graphite.css" media="screen" />-->

		<!-- JQuery engine script-->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery-latest.js";?>" ></script>

		<!-- JQuery WYSIWYG plugin script -->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery.wysiwyg.js";?>" ></script>

        <!-- JQuery tablesorter plugin script-->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery.tablesorter.min.js";?>" ></script>

		<!-- JQuery pager plugin script for tablesorter tables -->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery.tablesorter.pager.js";?>" ></script>

		<!-- JQuery password strength plugin script -->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery.pstrength-min.1.2.js";?>" ></script>

		<!-- JQuery thickbox plugin script -->
		<script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/thickbox.js";?>" ></script>



        <script language="javascript" type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/ckeditor/ckeditor.js";?>"></script>
        <script language="javascript" type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/validation.js";?>"></script>
        <script>
        CKEDITOR.dtd.$removeEmpty['span'] = false;
        $(document).ready(function(){
            $("#commentForm").validate();
          });
        </script>
        <script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery-ui-1.7.1.custom.min.js";?>"></script>
        <!-- Initiate tablesorter script -->
        <script type="text/javascript">
			$(document).ready(function() {
				$("#myTable")
				.tablesorter({widgets: ['zebra']})
		  //	.tablesorterPager({container: $("#pager")});
		});
		</script>

        <!-- Initiate password strength script -->
		<script type="text/javascript">
			$(function() {
			$('.password').pstrength();
			});
        </script>
<style>
#contentWrap {
	width: 700px;
	margin: 0 auto;
	height: auto;
	overflow: hidden;
}

#contentTop {
	width: 600px;
	padding: 10px;
	margin-left: 30px;
}

#contentLeft {
	float: left;
	width: 400px;
}

#contentLeft li {
	list-style: none;
	margin: 0 0 4px 0;
	padding: 10px;
	background-color:#00CCCC;
	border: #CCCCCC solid 1px;
	color:#fff;
}




#contentRight {
	float: right;
	width: 260px;
	padding:10px;
	background-color:#336600;
	color:#FFFFFF;
}

/*  TABS STYLES */
.fade { background:#EEE; padding:12px; overflow:hidden;height:auto;width:95%; }
.fade .tabs { float:left; overflow:auto; }
.fade .tabs li {
  float:left; list-style:none; border:1px solid #fff; margin:1px; -moz-border-radius:2px;  background:#CCC;}
.fade .tabs li a { 
  display:block; float:left; width:16px; height:16px; text-align:center; color:#000;
  text-decoration:none; font:bold 10pt Verdana; padding: 10px;}
.fade .tabs li:hover { margin:0; border-width:2px; }
.fade .tabs li a.selected { background: #01B7E7; color: #fff; padding: 10px; }
.fade .items { clear:both; padding:6px 0; position:relative; top:0; left:0;float:left; }
.fade .items .item { display:none; position:relative; top:0; left:0; padding-top:6px; float: left; }


</style>        
	</head>
	<body>
    	<!-- Header -->
        <div id="header">
            <!-- Header. Main part -->
            <div id="header-main">
                 <input id="path_for_ckeditor" type="hidden" value="<?php echo URL::base(TRUE,TRUE); ?>" />  

                <div class="container_12">
                    <div>
                        <a href="<?php echo URL::base(TRUE,TRUE);?>admin/logout" id="logout">
                        <?php echo __("Выйти",null); ?>
                        </a>
                    </div>
                    <div style="float:left;">
                            <ul id="nav">
                                <?php foreach ($menus as $key=>$menu): ?>
                                <li><a href="<?php echo URL::base(TRUE,TRUE);?>admin/<?php echo $menu; ?>"><?php echo $key; ?></a></li>
                                <?php endforeach; ?>
                            </ul>
                     
                    </div><!-- End. .grid_12-->
                    <div style="clear: both;"></div>
                </div><!-- End. .container_12 -->
            </div> <!-- End #header-main -->
            <div style="clear: both;"></div>
            <!-- Sub navigation -->
            <div id="subnav">
                <div class="container_12">
                </div><!-- End. .container_12 -->
                <div style="clear: both;"></div>
            </div> <!-- End #subnav -->
        </div> <!-- End #header -->

		<div class="container_12">


                <?php echo $content; ?>

        <!--TABS -->
        <script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery.idTabs.js";?>" ></script> 
        <script type="text/javascript">
        var fade = function(id,s){
          s.tabs.removeClass(s.selected);
          s.tab(id).addClass(s.selected);
          s.items.fadeOut();
          s.item(id).fadeIn();
          return false;
        };
        $.fn.fadeTabs = $.idTabs.extend(fade);
        $(".fade").fadeTabs();
        </script>
        <div style="clear:both;"></div>
        </div> <!-- End .container_12 -->


        <!-- Footer -->
        <div id="footer">
        	<div class="container_12">
            	<div class="grid_12">
                	<!-- You can change the copyright line for your own -->
                	<p>&copy; <?php echo date('Y'); ?>. <a href="<?php echo URL::base(TRUE,TRUE);?>" target="_blank"><?php echo __("Титул для главной",null); ?></a></p>
        	</div>
            </div>
            <div style="clear:both;"></div>
        </div> <!-- End #footer -->
	</body>
</html>
