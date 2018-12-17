<?php defined('SYSPATH') or die('No direct script access.');

// -- Environment setup --------------------------------------------------------

// Load the core Kohana class
require SYSPATH.'classes/Kohana/Core'.EXT;

if (is_file(APPPATH.'classes/Kohana'.EXT))
{
	// Application extends the core
	require APPPATH.'classes/Kohana'.EXT;
}
else
{
	// Load empty core extension
	require SYSPATH.'classes/Kohana'.EXT;
}

/**
 * Set the default time zone.
 *
 * @link http://kohanaframework.org/guide/using.configuration
 * @link http://www.php.net/manual/timezones
 */
date_default_timezone_set('Asia/Tbilisi');

/**
 * Set the default locale.
 *
 * @link http://kohanaframework.org/guide/using.configuration
 * @link http://www.php.net/manual/function.setlocale
 */
setlocale(LC_ALL, 'en_GB.utf-8');

/**
 * Enable the Kohana auto-loader.
 *
 * @link http://kohanaframework.org/guide/using.autoloading
 * @link http://www.php.net/manual/function.spl-autoload-register
 */
spl_autoload_register(array('Kohana', 'auto_load'));

/**
 * Optionally, you can enable a compatibility auto-loader for use with
 * older modules that have not been updated for PSR-0.
 *
 * It is recommended to not enable this unless absolutely necessary.
 */
//spl_autoload_register(array('Kohana', 'auto_load_lowercase'));

/**
 * Enable the Kohana auto-loader for unserialization.
 *
 * @link http://www.php.net/manual/function.spl-autoload-call
 * @link http://www.php.net/manual/var.configuration#unserialize-callback-func
 */
ini_set('unserialize_callback_func', 'spl_autoload_call');

/**
 * Set the mb_substitute_character to "none"
 *
 * @link http://www.php.net/manual/function.mb-substitute-character.php
 */
mb_substitute_character('none');

// -- Configuration and initialization -----------------------------------------

/**
 * Set the default language
 */
//I18n::lang('en-us');

Kohana::$environment = Kohana::DEVELOPMENT;
//Kohana::$environment = Kohana::PRODUCTION;

if (isset($_SERVER['SERVER_PROTOCOL']))
{
	// Replace the default protocol.
	HTTP::$protocol = $_SERVER['SERVER_PROTOCOL'];
}

Cookie::$salt = 'foobar';

/**
 * Set Kohana::$environment if a 'KOHANA_ENV' environment variable has been supplied.
 *
 * Note: If you supply an invalid environment name, a PHP warning will be thrown
 * saying "Couldn't find constant Kohana::<INVALID_ENV_NAME>"
 */
if (isset($_SERVER['KOHANA_ENV']))
{
	Kohana::$environment = constant('Kohana::'.strtoupper($_SERVER['KOHANA_ENV']));
}



/**
 * Initialize Kohana, setting the default options.
 *
 * The following options are available:
 *
 * - string   base_url    path, and optionally domain, of your application   NULL
 * - string   index_file  name of your index file, usually "index.php"       index.php
 * - string   charset     internal character set used for input and output   utf-8
 * - string   cache_dir   set the internal cache directory                   APPPATH/cache
 * - integer  cache_life  lifetime, in seconds, of items cached              60
 * - boolean  errors      enable or disable error handling                   TRUE
 * - boolean  profile     enable or disable internal profiling               TRUE
 * - boolean  caching     enable or disable internal caching                 FALSE
 * - boolean  expose      set the X-Powered-By header                        FALSE
 */


Kohana::init(array(
'base_url'   => '/',
'index_file' => FALSE,   
'charset' => 'utf-8', 
'caching' => (Kohana::$environment == Kohana::PRODUCTION) ? TRUE : FALSE,
'cache_dir' => APPPATH.'/cache',
'cache_life' => 80,
'errors' => (Kohana::$environment == Kohana::DEVELOPMENT) ? TRUE : FALSE,
'profile' => (Kohana::$environment == Kohana::DEVELOPMENT) ? TRUE : FALSE
));


(Kohana::$environment == Kohana::DEVELOPMENT) ? error_reporting(E_ALL & ~E_NOTICE) : error_reporting(0);
(Kohana::$environment == Kohana::PRODUCTION) ? Kohana_Exception::$error_view = 'errors/default' : FALSE;


/**
 * Attach the file write to logging. Multiple writers are supported.
 */
Kohana::$log->attach(new Log_File(APPPATH.'logs'));

/**
 * Attach a file reader to config. Multiple readers are supported.
 */
Kohana::$config->attach(new Config_File);

/**
 * Enable modules. Modules are referenced by a relative or absolute path.
 */

Kohana::modules(array(
    	'auth'          => MODPATH.'auth',       // Basic authentication
        // 'email'      => MODPATH.'email',      // Basic authentication     
        //  'calendar'   => MODPATH.'calendar',   // Basic authentication     
    	// 'cache'      => MODPATH.'cache',      // Caching with multiple backends
    	// 'codebench'  => MODPATH.'codebench',  // Benchmarking tool
    	'database'      => MODPATH.'database',   // Database access
        //'image'      => MODPATH.'image',      // Image manipulation
        'minion'        => MODPATH.'minion',     // CLI Tasks
    	'migrations'    => MODPATH.'migrations',     // migrations
    	'orm'           => MODPATH.'orm',        // Object Relationship Mapping
    	// 'unittest'   => MODPATH.'unittest',   // Unit testing
        // 'userguide'  => MODPATH.'userguide',  // User guide and API documentation
        // 'smarty'     => MODPATH.'smarty3',    // Smarty templates
        'casper'        => MODPATH.'phpcasperjs',    // Smarty templates
	));

Database::$default = 'alternate';
/**
 * Set the routes. Each route must have a minimum of a name, a URI and a set of
 * defaults for the URI.
 */
Route::set('loginout', 'admin/logout')
    ->defaults(array(
    'directory'  => 'Admin',
    'controller' => 'Main',
    'action'     => 'logout',
));

Route::set('login', 'admin/login')
    ->defaults(array(
    'directory'  => 'Admin',
    'controller' => 'Main',
    'action'     => 'login',
));

Route::set('cron', 'cron/task')
    ->defaults(array(
    'controller' => 'Cron',
    'action'     => 'task',
));

Route::set('adminre', 'admin/<controller>/<ob>/<ret>', array('ob' => '[0-9]+'), array('ret' => '.+'))
     ->defaults(array(
        'directory'  => 'Admin',
        'action'     => 'remove',
));

Route::set('adminedit', 'admin/<controller>/<id>-<artname>/<method>', array('id' => '[0-9]+'), array('artname' => '.+'), array('method' => '.+'))
     ->defaults(array(
        'directory'  => 'Admin',
        'action'     => 'index',
));


Route::set('adminaddremove', 'admin/<controller>/<method>',array('method' => '.+'))
     ->defaults(array(
        'directory'  => 'Admin',
        'action'     => 'addremove'
));


    
Route::set('adminmenu', 'admin/<artname>', array('artname' => '.+'))
     ->defaults(array(
        'directory'  => 'Admin',
        'controller' => 'Main',
        'action'     => 'nav',
));


    
Route::set('admin', '(admin(/<controller>(/<action>(/<id>))))')
     ->defaults(array(
        'directory'  => 'Admin',
        'controller' => 'Main',
        'action'     => 'index',
));
/*
Route::set('default', '(<lang>(/<controller>(/<action>(/<id>))))',array('lang' => '(ru|en|az)'))
    ->defaults(array(
    'controller' => 'Menu',
    'action'     => 'mainpage',
));
*/


