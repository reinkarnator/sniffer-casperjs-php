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
class Ships extends Migration {

	public function up()
	{
		$this->create_table( "ships", array(
				'id' => 'primary_key',
				'name' => array('string', 'null' => FALSE),
				'user_id' => array('integer', 'null' => FALSE),
				'graph_id' => array('integer', 'null' => FALSE),
				'selector' => array('string', 'null' => FALSE)
			), array(
				'id' => TRUE,
				'options' => 'ENGINE=innoDB CHARSET=utf8'
			)
		);

	}

	public function down()
	{
		$this->drop_table('ships');
	}
}
