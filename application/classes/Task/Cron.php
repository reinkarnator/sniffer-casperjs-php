<?php defined('SYSPATH') or die('No direct script access.');

class Task_Cron extends Minion_Task {

    /**
     * [_execute default minion task execution]
     * @param  array  $params [additional params if needed]
     * @return [type]         [description]
     */
    protected function _execute(array $params) {
 	
	        $result = Model::factory('Admin_Ships')->get_ships(); 
	        $config = Kohana::$config->load('casper')->as_array();
	        $url = $config['firstURL'];
	        //$return_url_c = $config['returnURLController'];
	        //$return_url_s = $config['returnURLStation'];

	        if ($result) {
	            
	            foreach ($result as $x => $graph) {

	                if ($graph['selector'] == 'controller') {

	                     Casper::factory()
	                        ->start($url)
	                        //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
	                       // ->thenOpen($return_url_c . $graph['graph_id'] . '/')
	                        ->toFile($graph['graph_id'] . '.html')
	                        ->run();

	                } else {

	                     Casper::factory()
	                        ->start($url)
	                        //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
	                       // ->thenOpen($return_url_s . $graph['graph_id'] . '/')
	                        ->toFile($graph['graph_id'] . '.html')
	                        ->run();

	                }

	            }

	        } 
	    }

    }

}




?>
