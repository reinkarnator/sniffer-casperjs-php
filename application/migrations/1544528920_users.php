<?php defined('SYSPATH') OR die('No direct script access.');
/**
* create_table($table_name, $fields, array('id' => TRUE, 'options' => ''))
* drop_table($table_name)
* rename_table($old_name, $new_name)
* add_column($table_name, $column_name, $params)
* rename_column($table_name, $column_name, $new_column_name)
* change_column($table_name, $column_name, $params)
* remove_column($table_name, $column_name)
* add_index($table_name, $index_name, $columns, $index_type = 'normal')
* remove_index($table_name, $index_name)
*/
class Users extends Migration {

	public function up()
	{
		$this->create_table( "users", array(
				'id' => 'primary_key',
				'username' => array('string', 'null' => FALSE),
				'password' => array('string', 'null' => FALSE),
				'email' => array('string', 'null' => TRUE),
				'join' => array('integer', 'null' => FALSE, 'default' => 0),
				'last_login' => array('integer', 'null' => FALSE, 'default' => 0),
				'logins' => array('integer', 'null' => FALSE, 'default' => 0),
				'photo' => array('string', 'null' => TRUE),
				'name' => array('string', 'null' => FALSE)
			), array(
				'id' => TRUE,
				'options' => 'ENGINE=innoDB CHARSET=utf8'
			)
		);

		$this->execute(
			"INSERT INTO `users` (`username`, `password`, `email`, `join`, `last_login`, `logins`, `photo`, `name`) VALUES('admin', '".Auth::instance()->hash_password('123456')."', 'email@email.com', '0', '0', '0', '', 'Admin');"
		);
	}

	public function down()
	{
	}
}
