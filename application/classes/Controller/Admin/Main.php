<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Admin_Main extends Controller_Admin_Common {       
    // Главная страница
    public function action_index() {}

    public function action_nav()
    {

           $artname = $this->request->param('artname');
           $lang_count = $this->lang_path();
           $deflang = Kohana::$config->load('lang')->get('adminLang');

	    if ($this->user->has('roles', ORM::factory('role', array('name' => 'admin'))))
	    {
		$file='admin/'.$artname.'/'.$artname; 
	    }
            elseif ($this->user->has('roles', ORM::factory('role', array('name' => 'login')))) 
            {
		$file='admin/'.$artname.'/'.$artname.'_login'; 
	    }

           $content = View::factory($file)
                      ->bind('lang_count',$lang_count)
                      ->bind('lang',$deflang)
                      ->bind('type',$artname)
                      ->bind('menu_elements',$menu_elements);
	   if ($this->user->has('roles', ORM::factory('role', array('name' => 'admin')))){ 
             $menu_elements = Model::factory('Admin_'.$artname)->get_all();
           } elseif ($this->user->has('roles', ORM::factory('role', array('name' => 'login')))) {
             $menu_elements = Model::factory('Admin_'.$artname)->get_item($this->user->as_array());
           } 

           $this->template->content = $content;


    }


    public function action_logout()
    {
        Session::instance()->set('KCFINDER', array('disabled'=>true)); 
        Auth::instance()->logout();     
        $this->request->redirect(URL::base(TRUE,TRUE).'admin');
    }
    public function action_login() {}    

}
