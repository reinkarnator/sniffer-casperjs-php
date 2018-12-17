<?php defined('SYSPATH') or die('No direct script access.');

class Model_Cron extends Model
{
    protected $_tableMenu = 'ships';

    public function get_ships()
    {
        $query = DB::select('id', 'graph_id', 'selector')
                    ->from($this->_tableMenu)  
                    ->execute();

        $result = $query->as_array();

        if($result) 
           return $result;
        else
           return FALSE;      
    }    


}