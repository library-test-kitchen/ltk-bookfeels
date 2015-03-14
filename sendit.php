<?php
require_once 'lib/swift_required.php';



$message = Swift_Message::newInstance()
	->setSubject($_POST["title"]." - ".$_POST["author"])
 	->setFrom(array('USERNAME@YOUREMAIL.COM' => 'EMAIL NAME'))
	->setTo(array('USERNAME@YOUREMAIL.COM' => 'EMAIL NAME'))
	->attach(Swift_Attachment::fromPath($_FILES["image"]["tmp_name"])->setFilename('cool.gif'));
 
// change options depending on your email provider
$transport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, 'ssl')
  ->setUsername('USERNAME@YOUREMAIL.COM')
  ->setPassword('EMAIL PASSWORD');
  
// Send the email
$mailer = Swift_Mailer::newInstance($transport);
$result = $mailer->send($message, $fail);

print_r($fail);

?>