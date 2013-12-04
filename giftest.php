<?php
require_once 'lib/swift_required.php';
 
// Create the SMTP configuration
$transport = Swift_SmtpTransport::newInstance('smtp.gmail.com', 465, 'ssl')
	->setUsername($this->"bookfeels@gmail.com")
	->setPassword($this->"librarytestkitchen");

//create the mailer
$this->mailer = Swift_Mailer::newInstance($transporter);

// assign variables post data and header info
$EmailFrom = "contact_form@yourdomain.com";
$EmailTo = "paulina.haduong@gmail.com";
$Subject = "Message from YourDomain.com visitor";
$Book = $_POST["txt_bookName"];
$Author = $_POST["txt_bookAuthor"];

//email body
$Body = $Book + "-" + $Author;

$mailer = Swift_Mailer::newInstance($transporter);
$message=Swift_Message::newInstance();
$message->setSubject($Subject);
$message->setFrom(array($EmailFrom =>'YourDomain site visitor'));
$headers = $message->getHeaders();
$message->setTo(array($EmailTo =>'Comments'));
$message->setBody($Body);
$success=$mailer->send($message);

// redirect to success page, this is where the URL key "mode" comes in
if ($success){
  print "Success!";
}
else{
  print "Fail!>";
}
 
// Create the message
// $message = Swift_Message::newInstance();
// $message->setTo(array(
//    "paulina.haduong@gmail.com" => "Paulina"
// ));
// $message->setSubject("This email is sent using Swift Mailer");
// $message->setBody("You're our best client ever.");
// $message->setFrom("account@bank.com", "Your bank");
// $message->attach(Swift_Attachment::fromPath("path/to/file/file.zip"));
//  
// Send the email
// $mailer = Swift_Mailer::newInstance($transport);
// $mailer->send($message, $failedRecipients);
//  
// // Show failed recipients
// print_r($failedRecipients);

?>