<?php defined('SYSPATH') or die('No direct script access.');

class Controller_Admin_Ships extends Controller_Admin_Common {
    
    /**
     * 
     */

    public function action_index()
    {

            $action = HTML::chars($this->request->param('method'));
            $id = HTML::chars($this->request->param('id'));
            $artname = HTML::chars($this->request->param('artname'));
            $type = HTML::chars($this->request->controller());


            $name = HTML::chars($this->request->post('name'));
            $u_id = HTML::chars($this->request->post('user_id'));
            $graph_id = HTML::chars($this->request->post('graph_id'));
            $selector = HTML::chars($this->request->post('selector'));

            $conf = Kohana::$config->load('casper')->as_array();
            $startUrl = $conf['firstURL'];    
            //$return_url_c = $conf['returnURLController'];
            //$return_url_s = $conf['returnURLStation'];                    

            switch ($action){
                case 'edit':
                    $content = View::factory('admin/'.$type.'/'.$type.'_edit')
                        ->bind('category',$categories)
                        ->bind('type',$type)
                        ->bind('artname',$artname)
                        ->bind('action',$action)
                        ->bind('id',$id);
                    $categories = Model::factory('Admin_'.$type)->edit_element($id);
                    $this->template->content = $content;
                    break;
                case 'update':
                    $content = View::factory('admin/'.$type.'/'.$type.'_edit')
                        ->bind('category',$categories)
                        ->bind('type',$type)
                        ->bind('artname',$artname)
                        ->bind('action',$action)
                        ->bind('id',$id);
                    $categories = Model::factory('Admin_'.$type)->update_element($id,$name,$u_id,$graph_id,$selector);
                    $this->template->content = $content;
                break;
                case 'track':
                    $categories = Model::factory('Admin_'.$type)->edit_element($id);
                     if ($categories['graph_id']) {
                         if ($selector == 'controller') {
                             Casper::factory()
                                ->start($startUrl)
                                //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                                //->thenOpen($return_url_c . $categories['graph_id'] . '/')
                                ->toFile($categories['graph_id'] . '.html')
                                ->run();
                         } else {
                             Casper::factory()
                                ->start($startUrl)
                                //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                                //->thenOpen($return_url_s . $categories['graph_id'] . '/')
                                ->toFile($categories['graph_id'] . '.html')
                                ->run();
                         }
                     }
                    $url=URL::base(TRUE,TRUE).'admin/'.$type;
                    $this->request->redirect($url);
                break;
                case 'remove':
                    $categories = Model::factory('Admin_'.$type)->remove_element($id);
                    $url=URL::base(TRUE,TRUE).'admin/'.$type;
                    $this->request->redirect($url);
                    break;
            }
    }

    public function action_addremove()
    {

            $action = HTML::chars($this->request->param('method'));
            $id = HTML::chars($this->request->param('id'));
            $artname = HTML::chars($this->request->param('artname'));
            $type = HTML::chars($this->request->controller());


            $name = HTML::chars($this->request->post('name'));
            $u_id = HTML::chars($this->request->post('user_id'));
            $graph_id = HTML::chars($this->request->post('graph_id'));
            $selector = HTML::chars($this->request->post('selector'));

            $conf = Kohana::$config->load('casper')->as_array();
            $startUrl = $conf['firstURL'];    
            //$return_url_c = $conf['returnURLController'];
            //$return_url_s = $conf['returnURLStation'];              


            switch ($action){
             case 'add':
             $content = View::factory('admin/'.$type.'/'.$type.'_edit')
                            ->bind('category',$categories)
                            ->bind('type',$type)
                            ->bind('artname',$artname)
                            ->bind('action',$action)
                            ->bind('id',$id);

             $categories = Model::factory('Admin_'.$type)->add_element();
             $this->template->content = $content;
             break;
             case 'save':
             $categories = Model::factory('Admin_'.$type)->save_element($name,$u_id,$graph_id,$selector);

             if ($graph_id) {
                 if ($selector == 'controller') {
                     Casper::factory()
                        ->start($startUrl)
                        //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                        ->toFile($graph_id . '.html')
                        ->run();
                 } else {
                     Casper::factory()
                        ->start($startUrl)
                        //->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                        ->toFile($graph_id . '.html')
                        ->run();
                 }
             }
             $url=URL::base(TRUE,TRUE).'admin/'.$type;
             $this->request->redirect($url);
             break;
             }
    }
}
