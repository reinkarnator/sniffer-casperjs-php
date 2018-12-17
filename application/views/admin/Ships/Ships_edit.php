<!-- Form elements -->
<div class="grid_12">

    <div class="module">
        <h2><span><?php echo __("Ship editing",null); ?></span></h2>

        <div class="module-body">
            <?php switch ($action){  
                   case 'add': ?>
            <form action="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/save'; ?>" id="commentForm" method="POST" enctype="multipart/form-data">
            <?php break; case 'edit': ?>
            <form action="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$id.'-'.$artname.'/update'; ?>" id="commentForm" method="POST" enctype="multipart/form-data">
            <?php break; case 'update': ?>
            <form action="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$id.'-'.$artname.'/update'; ?>" id="commentForm" method="POST" enctype="multipart/form-data">
                                    <div>
                                        <span class="notification n-success"><?php echo __("Ship was changed",null); ?></span>
                                    </div>   
            <?php break; }?>  
                <div style="float:left;padding-right:50px;border-right:1px dotted #DDDDDD;height:300px;">
                    <p>
                        <label><?php echo __("Имя",null); ?></label>
			<?php switch ($action){ 
                              case 'add': ?>
                        <input type="text" id="cname" name="name" class="required" style="width:250px;" value="" />
                        <?php break; case 'edit': case 'update': ?>
                        <input type="text" id="cname" name="name" class="required" style="width:250px;" value="<?php echo $category['name']; ?>" />
                        <?php break; }?> 
                    </p>
                    <p>
                            <label><?php echo __("Аккаунт",null); ?></label>
		            <select name="user_id" style="width:250px;">
		            <?php switch ($action){  case 'add': ?>       
		                <option value=""></option>
		                <?php
		                   foreach ($category as $cat) {    
		                      echo '<option value="'.$cat['id'].'">'.$cat['username'].'</option>'; 
		                   }
		                 ?>
		             <?php break; case 'edit'; case 'update'; ?>
		             <?php foreach ($category['user'] as $key => $value) : ?>  
		                      <option value="<?php echo $value['id'] ?>" <?php echo ($value['id'] == $category['user_id']) ? 'selected' : FALSE ; ?> ><?php echo $value['username'] ?></option>
		             <?php endforeach; ?> 
		            <?php break; }?>   
		            </select>   
                    </p>
                    <p>
                            <label><?php echo __("Селектор",null); ?></label>
		            <select name="selector" style="width:250px;">
		            <?php switch ($action){  case 'add': ?>       
		                <option value=""></option>
                                <option value="controller">controller</option>
                                <option value="station">station</option>
		             <?php break; case 'edit'; case 'update';
                                      if ($category['selector'] == 'controller') {
		                      echo '<option value="controller" selected>controller</option>
                                      <option value="station">station</option>';
                                      } else {
                                      echo '<option value="station" selected>station</option>
		                      <option value="controller">controller</option>';
                                      }
		             
		             break; }?>   
		            </select>   
                    </p>
                    <p>
                        <label><?php echo __("Graph ID",null); ?></label>
			<?php switch ($action){ 
                              case 'add': ?>
                        <input type="text" id="cname3" name="graph_id" class="required" style="width:200px;" value=""/>
                        <?php break; case 'edit': case 'update': ?>
                        <input type="text" id="cname3" name="graph_id" readonly class="required" style="width:200px;" value="<?php echo $category['graph_id']; ?>"/>
                        <?php break; }?> 
                    </p>
 
                        <?php switch ($action){ case 'edit': case 'update': ?>
                    <p>
                        <label><?php echo __("Start tracking",null); ?></label>
                        <a style="padding:5px 10px;background:red;color:#fff;" href="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$id.'-'.$artname.'/track'; ?>" >Start</a>
                    </p>
                        <?php break; }?> 
                </div>
                <br clear="all" />
                            <fieldset>
                                <input class="submit-green" name="saved" type="submit" value="Submit" />
                                <input class="submit-gray"  name="back" onclick="window.location='<?php echo URL::base(TRUE,TRUE);?>admin/<?php echo $type;?>/'" type="button" value="Back" />
                            </fieldset>
            </form>
        </div> <!-- End .module-body -->

    </div>  <!-- End .module -->
    <div style="clear:both;"></div>
</div> <!-- End .grid_12 -->
