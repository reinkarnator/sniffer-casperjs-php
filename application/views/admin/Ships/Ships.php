<div class="float-right">
    <a class="button" href="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/add'; ?>">
<span>
<?php echo __("New ship",null); ?>
<img width="12" height="9" alt="New article" src="<?php echo URL::base().'html/admin/images/plus-small.gif'; ?>">
</span>
</a>
</div>
<br/>
<br/>
<div class="module">
    <h2><span><?php echo __("Ships",null); ?></span></h2>

    <div class="module-table-body">
        <form action="">
            <table id="myTable" class="tablesorter">
                <thead>
                <tr>
                    <th style="width:5%;">#</th>
                    <th style="width:25%"><?php echo __("Name",null); ?></th>
                    <th style="width:25%"><?php echo __("Аккаунт",null); ?></th>
                    <th style="width:10%"><?php echo __("Graph",null); ?></th>
                    <th style="width:10%"><?php echo __("Активность",null); ?></th>
                </tr>
                </thead>
                <tbody>
                <?php 
                if ($menu_elements) :
                foreach ($menu_elements as $material) :?>
                <tr>
                    <td><?php echo $material['id']; ?></td>
                    <td><a href="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$material['id'].'-m/edit';?>"><?php echo $material['name']; ?></a></td>
                    <td><?php echo $material['username']; ?></td>
                    <td><?php echo $material['graph_id']; ?></td>
                    <td align="center">
                        <a href="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$material['id'].'-m/edit';?>"><img src="<?php echo URL::base().'html/admin/images/pencil.gif"'; ?>" width="16" height="16" /></a>
                        <a href="<?php echo URL::base(TRUE,TRUE).'admin/'.$type.'/'.$material['id'].'-m/remove';?>"><img src="<?php echo URL::base().'html/admin/images/cross-on-white.gif"'; ?>" width="16" height="16" /></a>
                    </td>
                </tr>
                <?php 
                endforeach; 
                endif; ?>
                </tbody>
            </table>
        </form>
        <div style="clear: both"></div>
    </div> <!-- End .module-table-body -->
</div> <!-- End .module -->
