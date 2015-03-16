<?php

require_once 'lib/PHPMailerAutoload.php';


$mail = new PHPMailer;

$mail->isSMTP();                                      // Set mailer to use SMTP
$mail->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
$mail->Port = 25;                                    // TCP port to connect to
$mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
$mail->SMTPAuth = true;                               // Enable SMTP authentication
$mail->Username = 'YOUREMAIL@EMAIL.com';                 // SMTP username
$mail->Password = 'YOUR PASSWORD';                           // SMTP password

$mail->setFrom = 'YOUREMAIL@EMAIL.com';
$mail->addAddress('YOUREMAIL@EMAIL.com');     // Add a recipient
$mail->Subject = $_POST["title"]." - ".$_POST["author"];
$mail->Body = ' ';
$mail->addAttachment($_FILES["image"]["tmp_name"], 'cool.gif');

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message has been sent';
}

?>