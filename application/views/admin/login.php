<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <title>Admin panel entrance</title>

    <!-- CSS Reset -->
    <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/reset.css";?>" media="screen" />

    <!-- Main stylesheet -->
    <link rel="stylesheet" type="text/css" href="<?php echo URL::base(TRUE)."html/admin/css/login.css";?>" media="screen" />


    <!--<link rel="stylesheet" type="text/css" href="css/theme-red.css" media="screen" />-->
    <!--<link rel="stylesheet" type="text/css" href="css/theme-yellow.css" media="screen" />-->
    <!--<link rel="stylesheet" type="text/css" href="css/theme-green.css" media="screen" />-->
    <!--<link rel="stylesheet" type="text/css" href="css/theme-graphite.css" media="screen" />-->

    <!-- JQuery engine script-->
    <script type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/jquery-latest.js";?>" ></script>

    <script language="javascript" type="text/javascript" src="<?php echo URL::base(TRUE)."html/admin/js/validation.js";?>"></script>

    <script>
        $(document).ready(function(){
            $("#commentForm").validate();
        });
    </script>
    <!-- Initiate password strength script -->
    <script type="text/javascript">
        $(function() {
            $('.password').pstrength();
        });
    </script>
</head>
<body>
<form id="commentForm" method="POST" action="<?php echo URL::base(TRUE,TRUE).'admin/';?>">
    <fieldset>

        <legend>Entrance</legend>

        <label for="login">Login</label>
        <input type="text" id="login" class="required" name="username" style="width: 200px" value="">
        <div class="clear"></div>

        <label for="password">Password</label>
        <input type="password" id="password" class="required" name="password" style="width: 200px" value="">
        <div class="clear"></div>


        <br />

        <input type="submit" style="margin: -20px 0 0 287px;" class="button" name="commit" value="Enter"/>
    </fieldset>
</form>

</body>
