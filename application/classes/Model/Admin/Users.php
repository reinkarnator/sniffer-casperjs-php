<?php defined('SYSPATH') or die('No direct script access.');

class Model_Admin_users extends Model_Admin_ModelPresets {

    protected $_table_name = 'users';

    public function get_all(){

          $query = DB::select()->from($this->_table_name)
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
                    ->where('id','=',':id')
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

          if($result)
              return $result[0];
          else
              return FALSE;

    }

public function add_element(){}
    public function update_element($id,$name,$uname,$pass,$photo,$email){
     
            $id=$id;
            $name=$name;
            $uname=$uname;
            $pass=$pass;
            $photo=$photo;
            $email=$email;

            $update = DB::update($this->_table_name)
                      ->set(array('name'=>$name))
                      ->set(array('username'=>$uname))
                      ->set(array('password'=>$pass))
                      ->set(array('email'=>$email))
                      ->set(array('photo'=>$photo));

            $update->where('id','=',':id')
                      ->param(':id', (int)$id)
                      ->execute();

            $query = DB::select()->from($this->_table_name)->where('id','=',':id')
                      ->param(':id', (int)$id)
                      ->execute();

            $result = $query->as_array();


            if($result)
                  return $result[0];
            else
                  return FALSE;

    }
      public function save_element($id,$name,$uname,$pass,$photo,$email){
    
              $sql = DB::insert($this->_table_name);
              $col = array('name','username','password','email','photo');
              $val = array($name,$uname,$pass,$email,$photo);
       
              $sql->columns($col); 
              $sql->values($val); 
              $result = $sql->execute();


            if($result) {
                  $this->add_role($name);
                  return $result;
            }else{
                  return FALSE;
	    }

      }
	public function add_role($name){
		    $query = DB::select('id')->from($this->_table_name)->where('name','=',':id')
		              ->param(':id', $name)
		              ->execute();

		    $result = $query->as_array();

		      $sql = DB::insert('roles_'.$this->_table_name);
		      $col = array('user_id','role_id');
		      $val = array($result[0]['id'],'1');
	       
		      $sql->columns($col); 
		      $sql->values($val); 
		      $result = $sql->execute();

		    if($result)
		          return $result;
		    else
		          return FALSE;

	}

      public function remove_userrole($id){

                return $sql = DB::delete('roles_'.$this->_table_name)->where('user_id','=',':id')
                              ->param(':id', (int)$id)
                              ->execute();

      }
      public function remove_element($id){

                return $sql = DB::delete($this->_table_name)->where('id','=',':id')
                              ->param(':id', (int)$id)
                              ->execute(); 

                $this->remove_userrole($id);                          
      }
}

