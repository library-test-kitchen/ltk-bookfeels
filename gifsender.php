//Code borrowed from here: http://milos.gavrilovic.rs/how-to-send-email-with-attachment-using-php-and-swiftmailer/

<?php

require_once 'lib/swift_required.php';
 
if ( // Maybe add some validation here, like check for value of some hidden field or whatever ) {
 
    $from = urldecode($from);
  if (eregi("\r",$from) || eregi("\n",$from)){
    die("Spammer detected");
  }
    
    // Catch your $_POST
    // I get that I need to catch the $_post, but what goes here? Is it the name of the form?
    $yourName = $_POST['yourName'];
    // etc
    
 
    // File validation
    // Max size allowed by Tumblr - paulina
//     $maxFileSize = 10240; // file size in KB
//     $maxFileSizeMb = $maxFileSize / 1024; // file size in MB
 
    // Specify what extension you are accepting for your file
  //   $allowedExtensions = "gif";
 
    $uploadedFileName = basename($_FILES['yourFile']['name']);
    $uploadedFileType = substr($uploadedFileName, strrpos($uploadedFileName, '.') + 1);
    $uploadedFileSize = $_FILES["yourFile"]["size"] / 1024;
 
    if ( $uploadedFileSize > $maxFileSize ) {
        $errors .= "Size of file should be less than $maxFileSizeMb MB rn";
    } else {
        $extensionAllowed = false;
 
        for ( $i = 0; $i < sizeof($allowedExtensions); $i++ ) {
            if ( strcasecmp($allowedExtensions[$i], $uploadedFileType) == 0 ) {
                $extensionAllowed = true;
            }
        }
 
        if ( ! $extensionAllowed ) {
            $errors .= "The uploaded file is not supported file type. Only the following file types are supported: " . implode(',',$allowedExtensions) . " rn";
        } else {
            $pathOfUploadedFile = "some-writable-directory/$uploadedFileName";
            //So I just need to find this, right?
 
            $tmp_path = $_FILES["yourFile"]["tmp_name"];
 
            if ( is_uploaded_file($tmp_path) ) {
                if( ! copy($tmp_path, $pathOfUploadedFile) ) {
                    $errors .= "error while copying the uploaded file rn";
                } else {
                    // Set up message text
                    $messageText = "#bookfeels" + " #" + bookName + " #" + bookAuthor ;
                    // etc
                    
                    $messageSubject= bookName + " - " + bookAuthor
 
                    // Start up swiftmailer
                    // Do I need to choose a SMTP server? How does that work?
                    $transport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, 'ssl')
                    	->setUsername('bookfeels@gmail.com')
                    	->setPassword('librarytestkitchen')
                    	;
 
                    //Create the Mailer using your created Transport
                    $mailer = Swift_Mailer::newInstance($transport);
                    
                    //Create a message
                    $message = Swift_Message::newInstance('Test Post Subject')
                      ->setFrom(array('beepboop@gmail.com' => BeepBoop ) )
                      //A setFrom isn't necessary, right?
                      ->setTo(array("z5vrnudwxdicc@tumblr.com" => 'Tumblr'))
                      ->setBody('TestContent of post kthx')
//                       ->attach(Swift_Attachment::fromPath( $pathOfUploadedFile ))
                      ;
 
 //                    //Create a message
//                     $message = Swift_Message::newInstance($messageSubject)
//                       ->setFrom(array($yourEmail => $yourFullName ) )
//                       //A setFrom isn't necessary, right?
//                       ->setTo(array("z5vrnudwxdicc@tumblr.com" => 'Tumblr'))
//                       ->setSubject($messageSubject)
//                       ->setBody($messageText)
//                       ->attach(Swift_Attachment::fromPath( $pathOfUploadedFile ))
//                       ;
 
                    //Send the message
                    if( $mailer->send($message) ) {
                        // if mail has been sent -> delete uploaded file from your server
                        unlink($pathOfUploadedFile);
                    }
                }
            } else {
                $errors .= "tmp_path fail rn";
            }
        }
    }
 
}

?>