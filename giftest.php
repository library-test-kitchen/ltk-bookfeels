<?php
require_once 'lib/swift_required.php';
 
// Create the SMTP configuration
$transport = Swift_SmtpTransport::newInstance("smtp.audero.it", 25);
$transport->setUsername("Username");
$transport->setPassword("Password");
 
// Create the message
$message = Swift_Message::newInstance();
$message->setTo(array(
   "paulina.haduong@gmail.com" => "Paulina"
));
$message->setCc(array("a.derosa@audero.it" => "Aurelio De Rosa"));
$message->setBcc(array("boss@bank.com" => "Bank Boss"));
$message->setSubject("This email is sent using Swift Mailer");
$message->setBody("You're our best client ever.");
$message->setFrom("account@bank.com", "Your bank");
$message->attach(Swift_Attachment::fromPath("path/to/file/file.zip"));
 
// Send the email
$mailer = Swift_Mailer::newInstance($transport);
$mailer->send($message, $failedRecipients);
 
// Show failed recipients
print_r($failedRecipients);