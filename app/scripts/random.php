<?php
    $settings = json_decode(file_get_contents("../conf.json"));

    define('BASE_FOLDER', $settings->base_folder);
    define('IGNORE_FOLDERS', $settings->ignore_folders);

    function getRandomFile($path, $type=NULL, $contents=TRUE) {
        if (is_dir($path)) {
            if ($dh = opendir($path)) {
                $arr = [];
                while (false !== ($file = readdir($dh))) {
                    //  not a directory
                    if (!is_dir("$path/$file") && !preg_match('/^\.{1,2}$/', $file)) {
                        //  fits file type
                        if(is_null($type)) $arr[] = $file;
                        elseif (is_string($type) && preg_match("/\.($type)$/", $file)) $arr[] = $file;
                        elseif (is_array($type)) {
                            $type = implode('|', $type);
                            if (preg_match("/\.($type)$/", $file)) $arr[] = $file;
                        }
                    }
                }
                closedir($dh);
                if (!empty($arr)) {
                    shuffle($arr);
                    $file = $arr[mt_rand(0, count($arr)-1)];
                    return empty($contents) ? $file : ($contents == 'path' ? "$path/$file" : file_get_contents($file));
                }
            }
        }
        return NULL;
    }

    function getRandomDir($path, $full=TRUE, $indexOf=NULL) {
        if (is_dir($path)) {
            if ($dh = opendir($path)) {
                $arr = [];
                while (false !== ($dir = readdir($dh))) {
                    if (is_dir("$path/$dir") && !preg_match('/^\.{1,2}$/', $dir) && !in_array($dir,IGNORE_FOLDERS)) {
                        if(is_null($indexOf)) $arr[] = $dir;
                        if (is_string($indexOf) && strpos($dir, $indexOf) !== FALSE) $arr[] = $dir;
                        elseif (is_array($indexOf)) {
                            $indexOf = implode('|', $indexOf);
                            if (preg_match("/$indexOf/", $dir)) $arr[] = $dir;
                        }
                    }
                }
                closedir($dh);
                if (!empty($arr)) {
                    shuffle($arr);
                    $dir = $arr[mt_rand(0, count($arr)-1)];
                    return $full ? "$path/$dir" : $dir;
                }
            }
        }
        return NULL;
    }

    function getBottomDir($base_dir){
        $dir = getRandomDir($base_dir);
        $current_dir = $dir;
        while($current_dir != null){
            $dir = $current_dir;
            $current_dir = getRandomDir($dir);
        }

        return $dir;
    }

    $directory = getBottomDir(BASE_FOLDER);
    $file = getRandomFile($directory, 'mp3|waw|flac');

    while($file == NULL){
        $directory = getBottomDir(BASE_FOLDER);
        $file = getRandomFile($directory, 'mp3|waw|flac');
    }

    header("Content-Transfer-Encoding: binary"); 
    header("Content-Type: audio/mpeg, audio/x-mpeg, audio/x-mpeg-3, audio/mpeg3"); 
    header('Content-Disposition: attachment; filename="'.$file.'"');

    readfile($file);
    exit;
