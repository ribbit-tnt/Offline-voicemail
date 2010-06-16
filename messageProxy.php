<?php
/*
This script proxies requests to download from the Ribbit platform.
/t returns data as base64 encoded uris.
/t is session unaware, has no secrets, and will only proxy requests to ribbit
*/


//the uri parameter passed up is a fully signed request; this is handled by the Ribbit Javascript library
$file = $_GET["uri"];

//Only proxy requests to ribbit platform
$ep = "https://rest.ribbit.com/";
if (substr($file,0,strlen($ep))!=$ep){
    //not a request i want to proxy, thanks very much!
    header("HTTP/1.0 400 Bad Request");
}
else{
    header("Content-Type","text/plain");
    
    //set up some curl options
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); //saves some math, and some servers may not have access to keys
    curl_setopt($ch, CURLOPT_HTTPGET,true);
    curl_setopt($ch, CURLOPT_URL, $file);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT,100);
    
    //go get the raw binary mp3
    $mp3 = curl_exec ($ch);
    $err = curl_error($ch);
    curl_close($ch);
    
    if ($err){
        header("HTTP/1.0 500 Server Error");
        die($err);
    }
    else{
        //base64_encode the mp3 and write it out as a data uri        
        echo("data:audio/mpeg;base64," . base64_encode($mp3));
    }
}
 
?>

