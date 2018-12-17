<div class="module">
    <h2><span><?php echo __("user",null); ?></span></h2>

    <div class="module-table-body">
        <form action="">
            <table id="myTable" class="tablesorter">
                <thead>
                <tr>
                    <th style="width:5%;">#</th>
                    <th style="width:25%"><?php echo __("Имя",null); ?></th>
                    <th style="width:25%"><?php echo __("Аккаунт",null); ?></th>
                    <th style="width:25%"><?php echo __("email",null); ?></th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($menu_elements as $material) :?>
                <tr>
                    <td><?php echo $material['id']; ?></td>
                    <td><a href="<?php echo URL::base(TRUE,TRUE).'admin/users/'.$material['id'].'-'.$material['username'].'/edit';?>"><?php echo $material['name']; ?></a></td>
                    <td><?php echo $material['username']; ?></td>
                    <td><?php echo $material['email']; ?></td>
                </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </form>
        <div style="clear: both"></div>
    </div> <!-- End .module-table-body -->
</div> <!-- End .module -->
