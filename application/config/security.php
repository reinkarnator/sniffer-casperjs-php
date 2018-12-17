<?php defined('SYSPATH') or die('No direct script access.');

return array(
    # Order
    'Controller_Admin_Users' => array(
        'index'     => array('login', 'admin'),
        'addremove' => array('admin'),
        'remove' => array('admin'),
    ),
    
    # Auth
    'Controller_Admin_Common' => array(
        'all_actions' => array('public'),
    ),

    # Organization   
    'Controller_Admin_Main' => array(
        'all_actions' => array('public'),
    ),
    # Organization   
    'Controller_Admin_Ships' => array(
        'index' => array('admin'),
        'addremove' => array('admin'),
    ),

);
