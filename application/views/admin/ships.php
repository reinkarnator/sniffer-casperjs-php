<style type="text/css">
  div.target {
    width: 730px;
    height: 252px;
    overflow: hidden;
    position: relative;
margin:0 auto;
transform: scale(0.8,1);
  }
  div.target iframe {
	border:0;
	width:1920px;
	height:1080px;
	position:absolute;
	top:-235px;
	left:-310px;
  }


  div.target_station {
    width: 730px;
    height: 235px;
    overflow: hidden;
    position: relative;
    margin:0 auto;
transform: scale(0.8,1);
  }
  div.target_station iframe {
	border:0;
	width:1920px;
	height:1080px;
	position:absolute;
	top:-258px;
	right:-120px;
  }
  div.network_state {
    width: 150px;
    height: 155px;
    overflow: hidden;
    position: relative;
    margin:0 auto;
  }
  div.network_state iframe {
	border:0;
	width:1920px;
	height:1080px;
	position:absolute;
	top:-500px;
	right:-180px;
  }
</style>
<script>
  $(function(){

    setInterval(function() {

    var minNumber = 1,
    maxNumber = 44440000;
    var randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber); 

     $('div.target iframe,div.target_station iframe,div.network_state iframe').each(function(){
	      var its_val = $(this).attr('src').split("?")[0];
	      $(this).attr('src',its_val + '?v=' + parseInt(randomNumber));
              //alert(its_val);
     });

    }, 10000);         
  })
</script>            
<?php if ($ships) {?>
	        <?php foreach ($ships as $ship): ?> 
                <div class="module">
                     <h2><span><?php echo $ship['name'];?></span></h2>
                     <div class="module-body" style="text-align:center;">
                <?php if ($ship['selector'] == 'controller'){ ?>
				   <div class="target">
				      <iframe src="<?php echo URL::base().$ship['graph_id'];?>.html" scrolling="no" seamless="seamless"></iframe>
				   </div>    
 				   <div class="network_state">
				      <iframe src="<?php echo URL::base().$ship['graph_id'];?>.html" scrolling="no" seamless="seamless"></iframe>
				   </div>               
                <?php } else { ?>
				   <div class="target_station">
				      <iframe src="<?php echo URL::base().$ship['graph_id'];?>.html" scrolling="no" seamless="seamless"></iframe>
				   </div>                        
                <?php } ?>
                    </div>
                </div>   
                        <?php endforeach; ?>
<?php } ?>
