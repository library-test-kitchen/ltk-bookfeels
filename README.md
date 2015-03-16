book feels
=========

[make a gif!](http://library-test-kitchen.github.io/ltk-bookfeels) or [check out the blog](http://ltk-bookfeels.tumblr.com/)!

Created by [Paulina Haduong](http://www.paulinahaduong.com/) for [Library Test Kitchen](http://librarytestkitchen.org/).<br />
Based on [Horia Dragomir's](http://hdragomir.com/) awesome [facetogif](http://hdragomir.github.io/facetogif/). Also relies on [Bootstrap](http://getbootstrap.com/) and [PHPMailer](https://github.com/PHPMailer/PHPMailer).

Overview
--------
[index.html](index.html) is where the gif-photobooth lives, with most of the javascript in [js/app.js](js/app.js). Here, the 
user creates a gif, adds author and title information, and then clicks upload to send everything over to sendit.php.
<br />
[sendit.php](sendit.php) uses the PHP library PHPMailer library to email 
all that information to an address you designate, with the "TITLE - AUTHOR" as the subject and the gif as an attachment.
<br />
An [If This Then That](https://ifttt.com/) recipe then listens for these emails, and when they are received, post the gif to tumblr. (You could just as easily set up a recipe to post to twitter or another platform.)

Setup
-----
1. Download everything.
2. Create a tumblr account for your bookfeels.
3. In [js/app.js](js/app.js), edit the url for your tumblr:<br/>
```
	var tumblrURL = 'http://ltk-bookfeels.tumblr.com';
```
4. In [sendit.php](sendit.php), fill in your email address, password, and proper host information. 
The code here is set up for gmail, but [PHPMailer](https://github.com/PHPMailer/PHPMailer) has some useful examples.
5. Register at [If This Then That](https://ifttt.com/) and fork [this recipe](https://ifttt.com/recipes/269737-if-i-send-myself-an-email-then-create-tumblr-post-with-photo-attachments). 
We created a gmail address just to listen for new bookfeels. When it gets an email from itself, it posts the email to tumblr. You can set it up differently in 
sendit.php as long as your IFTTT recipe is listening for the right conditions.

