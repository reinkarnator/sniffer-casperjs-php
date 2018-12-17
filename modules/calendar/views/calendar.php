<?php defined('SYSPATH') OR die('No direct access allowed.');

// Get the day names
$days = Calendar::days(2);

// Previous and next month timestamps
$next = mktime(0, 0, 0, $month + 1, 1, $year);
$prev = mktime(0, 0, 0, $month - 1, 1, $year);

// Import the GET query array locally and remove the day
$qs = $_GET;
unset($qs['day']);

// Previous and next month query URIs
$path_info = Arr::get($_SERVER, 'PATH_INFO');
$prev = $path_info.URL::query(array_merge($qs, array('month' => date('n', $prev), 'year' => date('Y', $prev))));
$next = $path_info.URL::query(array_merge($qs, array('month' => date('n', $next), 'year' => date('Y', $next))));

$month = sprintf("%02d", $month);



$dt = strftime('%B', mktime(0, 0, 0, $month, 1, $year));

    switch ($dt) {
        case 'January':
        $mnth = __('Yanvar',null);
        break;
        case 'February':
        $mnth = __('Fevral',null);
        break;
        case 'March':
        $mnth = __('Mart',null);
        break;
        case 'April':
        $mnth = __('Aprel',null);
        break;
        case 'May':
        $mnth = __('May',null);
        break;
        case 'June':
        $mnth = __('İyun',null);
        break;
        case 'July':
        $mnth = __('İyul',null);
        break;
        case 'August':
        $mnth = __('Avgust',null);
        break;
        case 'September':
        $mnth = __('Sentyabr',null);
        break;
        case 'October':
        $mnth = __('Oktyabr',null);
        break;
        case 'November':
        $mnth = __('Noyabr',null);
        break;
        case 'December':
        $mnth = __('Dekabr',null);
        break;
	}
?>
		<div class="month">
			<a href="<?php echo $prev; ?>" class="cal_left_arr"></a>
	        <span class="monthname"> <?php echo $mnth.' '.$year; ?></span>
	        <a href="<?php echo $next; ?>" class="cal_right_arr"></a>
		</div>
		<?php foreach ($weeks as $wk => $week): 
        ?>
		<ul>

			<?php foreach ($week as $day):

				list($number, $current, $data) = $day;
				
				$output = NULL;
				$classes = array();
				if (is_array($data))
				{
					$classes = $data['classes'];
					if ( ! empty($data['output']))
					{
						$output = '<ul class="output"><li>'.implode('</li><li>', $data['output']).'</li></ul>';
					}
				}

                $day[0] = sprintf("%02d", $day[0]);
			?>
			<li class="<?php echo implode(' ', $classes) ?>"><a href="<?php echo URL::base(TRUE).'az/calendar/'.$year.'-'.$month.'-'.$day[0] ?>#1"><?php echo $day[0] ?></a><?php echo $output ?></li>
			<?php endforeach ?>
		</ul>
		<?php endforeach ?>