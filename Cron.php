<?php

include 'Casper.php';


class Cron {

    private $_shipstable = 'table';
    private $_db_name = 'dbname';
    private $_db_user = 'dbuser';
    private $_db_pass = 'pass';


    public function task() {

        $pdo = $this->connect();

        $sql = $pdo->prepare("SELECT graph_id,selector FROM ".$this->_shipstable);
        $sql->execute();

        $result = $sql->fetchAll();


        foreach ($result as $x => $graph) {

            $casper = new Casper('/usr/local/bin/', '/your/www/root/');

            if ($graph['selector'] == 'controller') {

                $casper->start('http://yoururl')
                       ->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                       ->thenOpen('http://yourreverseurl' . $graph['graph_id'] . '/')
                       ->toFile('/your/www/root/' . $graph['graph_id'] . '.html')
                       ->run();

            } else {

                $casper->start('http://yoururl')
                       ->fillFormSelectors('form', array('input[name="login[login]"]' => 'user', 'input[name="login[password]"]' => 'CSat2020' ), true)
                       ->thenOpen('http://yourreverseurl' . $graph['graph_id'] . '/')
                       ->toFile('/your/www/root/' . $graph['graph_id'] . '.html')
                       ->run();

            }

        }

    }

    public function connect() {

        $host = 'localhost';
        $db   = $this->_db_name;
        $user = $this->_db_user;
        $pass = $this->_db_pass;
        $charset = 'utf8';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $opt = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, $user, $pass, $opt);

        return $pdo;

    }



}



$cronthis = new Cron();

$graphs = $cronthis->task();




?>
