<?php defined('SYSPATH') or die('No direct script access');
return array(
        'native' => array(
            'name' => 'session',
            'lifetime' => 0,
        ),
        'cookie' => array(
            'name' => 'cookie',
            'encrypted' => FALSE,
            'lifetime' => 43200,
        ),
        'database' => array(
            'name' => 'cookie',
            'encrypted' => TRUE,
            'lifetime' => 43200,
            'group' => 'default',
            'table' => 'table_name',
            'columns' => array(
                'session_id'  => 'session_id',
                'last_active' => 'last_active',
                'contents'    => 'contents'
            ),
            'gc' => 500,
        ),
);