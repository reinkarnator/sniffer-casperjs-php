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
class Roles extends Migration {

	public function up()
	{
		$this->create_table( "roles", array(
			'id' => array('primary_key', 'unsigned' => TRUE),
			'name' => array('string', 'null' => FALSE),
			'description' => array('string', 'null' => FALSE),
			), array(
				'id' => TRUE,
				'options' => 'ENGINE=innoDB CHARSET=utf8'
			)
		);

		$this->add_index("roles", "uniq_name", "name", "unique");

		$this->execute(
			"INSERT INTO `roles` (`name`, `description`) VALUES('login', 'Access to system');
			 INSERT INTO `roles` (`name`, `description`) VALUES('admin', 'System administrator');
			"
		);		
	}

	public function down()
	{
	}
}
