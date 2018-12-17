##Sniffer based on CasperJS, PhantomJS and PHP (Kohana)

**!!!NOTE: Before using this app, don't forget to install CasperJS and PhantomJS to your host!!!**

Make directories *application/cache* and *application/logs* writable

Configure database access in *application/config/database.php*, use **alternate** version, it's already using PDO driver and integrated with migrations, if you prefer different driver, don't forget to edit *application/config/migration.php*



After setting up database setting and hosting connection, run migrations in console

```PHP
php index.php db:migrate
 ```
OR (if not working)

```PHP
/.minion db:migrate
 ```
 
By default your admin panel access http://yourdomain/admin

login: admin
pass: 123456

You can change it by editing it in user section of admin panel
 
Edit *application/config/casper.php* and fill your own settings in array format. You can find all supported methods in *modules/phpcasperjs/classes/Kohana/Casper.php*

Currently i've installed minion (cli) task for running it in crontab. You can find minion tas in *application/classes/Task/Cron.php*

Modify default languages in *application/config/lang.php*, first for website's front, second - for admin panel. Don't forget put your language files directly into application/i18n 

In *application/config/security.php* file you can give privileges to users, I've presetted read/add/write/remove (CRUD correctly) rights to admin user with role = 2, and read/save to other users
 
 

