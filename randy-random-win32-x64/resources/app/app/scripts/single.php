<?php 
$file = $_GET('p');

$settings = json_decode(file_get_contents("conf.json"));

header("Content-Transfer-Encoding: binary"); 
header("Content-Type: audio/mpeg, audio/x-mpeg, audio/x-mpeg-3, audio/mpeg3"); 
header('Content-Disposition: attachment; filename="'.$file.'"');

readfile($file);
exit;
