<?php
require_once 'lib/swift_required.php';
 
// Create the SMTP configuration
$transport = Swift_SmtpTransport::newInstance("smtp.gmail.com", 465, 'ssl');
$transport->setUsername("bookfeels@gmail.com");
$transport->setPassword("librarytestkitchen");
 
// Create the message
$message = Swift_Message::newInstance();
$message->setTo(array(
   "paulina.haduong@gmail.com" => "Paulina"
));
$message->setSubject("This email is sent using Swift Mailer");
$message->setBody("You're our best client ever.");
$message->setFrom("account@bank.com", "Your bank");
// $message->attach(Swift_Attachment::fromPath("path/to/file/file.zip"));
 
// Send the email
$mailer = Swift_Mailer::newInstance($transport);
$mailer->send($message, $failedRecipients);
 
// Show failed recipients
print_r($failedRecipients);