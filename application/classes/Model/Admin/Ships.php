<?php defined('SYSPATH') or die('No direct script access.');

class Model_Admin_Ships extends Model_Admin_ModelPresets {

    protected $_table_name = 'ships';
    protected $_table_user = 'users';
    public $process = array();

    public function get_all(){

          $query = DB::select($this->_table_name.'.id',array($this->_table_name.'.name','name'),array($this->_table_name.'.user_id','user_id'),array($this->_table_name.'.selector','selector'),array($this->_table_name.'.graph_id','graph_id'),array($this->_table_user.'.username','username'))
                    ->from($this->_table_name)
                    ->join($this->_table_user)
            ->on($this->_table_name.'.user_id','=',$this->_table_user.'.id')
                    ->execute();

          $result = $query->as_array();

          if($result)
              return $result;
          else
              return FALSE;

    }

    public function get_ships(){

          $query = DB::select('graph_id','selector')->from($this->_table_name)
                    ->execute();

          $result = $query->as_array();

          if($result)
              return $result;
          else
              return FALSE;      

    }

    public function get_user(){

          $query = DB::select('id','username')->from($this->_table_user)
                    ->execute();

          $result = $query->as_array();

          if($result)
              return $result;
          else
              return FALSE;

    }
    public function get_item($user){
          $query = DB::select()
                    ->from($this->_table_name)
                    ->where('user_id','=',':id')
                    ->param(':id',(int)$user['id'])
                    ->execute();

          $result = $query->as_array();

          if($result)
              return $result;
          else
              return FALSE;
    }
    public function edit_element($id){


          $query = DB::select()->from($this->_table_name)->where('id','=',':id')
                    ->param(':id', (int)$id)
                    ->execute();

          $result = $query->as_array();

          if($result){
              $result[0]['user'] = $this->get_user();
              return $result[0];
          }else{
              return FALSE;
      }
    }

    public function add_element(){
       return $this->get_user();
    }

    public function update_element($id,$name,$u_id,$graph_id,$selector){

            $update = DB::update($this->_table_name)
                      ->set(array('name'=>$name))
                      ->set(array('user_id'=>$u_id))
                      ->set(array('selector'=>$selector))
                      ->set(array('graph_id'=>$graph_id));

            $update->where('id','=',':id')
                      ->param(':id', (int)$id)
                      ->execute();

            $query = DB::select()->from($this->_table_name)->where('id','=',':id')
                      ->param(':id', (int)$id)
                      ->execute();

            $result = $query->as_array();


            if($result) {
                  $result[0]['user'] = $this->get_user();
                  return $result[0];
            } else {
                  return FALSE;
            }
    }

    public function save_element($name,$u_id,$graph_id,$selector){

        $sql = DB::insert($this->_table_name);
        $col = array('name','user_id','graph_id','selector');
        $val = array($name,$u_id,$graph_id,$selector);

        $sql->columns($col);
        $sql->values($val);
        
        $result = $sql->execute();
        
        if($result) {
              return $result;
        } else {
              return FALSE;
        }        

     }

     public function remove_element($id){

          $query = DB::select('graph_id')
                    ->from($this->_table_name)
                    ->where('id','=',':id')
                    ->param(':id', (int)$id)
                    ->execute();

          $result = $query->as_array();

          @unlink(DOCROOT.$result[0]['graph_id'].'.php');
          @unlink(DOCROOT.$result[0]['graph_id'].'.js');
          @unlink(DOCROOT.$result[0]['graph_id'].'.html');


          return DB::delete($this->_table_name)
                          ->where('id','=',':id')
                          ->param(':id', (int)$id)
                          ->execute();

     }
}

