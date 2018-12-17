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
class User_Tokens extends Migration {

	public function up()
	{
		$this->create_table( "user_tokens", array(
			'id' => array('primary_key', 'unsigned' => TRUE),
			'user_id' => array('integer', 'null' => FALSE, 'unsigned' => TRUE),
			'user_agent' => array('string', 'null' => FALSE),
			'token' => array('string', 'null' => FALSE),
			'created' => array('integer', 'null' => FALSE, 'unsigned' => TRUE),
			'expires' => array('integer', 'null' => FALSE, 'unsigned' => TRUE),
			), array(
				'id' => TRUE,
				'options' => 'ENGINE=innoDB CHARSET=utf8'
			)
		);

		$this->add_index("user_tokens", "uniq_token", "token", "unique");
		$this->add_index("user_tokens", "user_id", "user_id", "normal");
	}

	public function down()
	{}
}
