# Twilight Bark, a jQuery plugin #

Twilight Bark is a simple little jQuery plugin that aims to provide drop-in exception reporting support.  In most cases all you need to do is include Twilight Bark and initialize it with an error handling callback before any calls to $(document).ready().  Your handler will be called and passed an exception and comprehensive(ish) error report.  You can then post this error to a server and provide your users with feedback.

# Usage & Options #

- First make sure to include jqueryTwilightBark.js after you include jQuery.
- Then, define an error handler.  This function will be called with two arguments: the exception raised and an error report.
- Initialize twilightBark, passing the handler and any other options in through the options hash:

<script type="text/javascript">
    var handler = function(e, report) {
        $.post("http://my.server.com/handleJSError", {report: report});
        alert('An error occurred! Whoops!');
    }
    $.twilightBark.reportTo({handler: handler});
    $(document).ready(
        //Your code here
    );
</script>

`$.twilightBark.reportTo` takes a hash of options.

# Under the hood #

# What's with the name? #

$.twilightBark.reportTo
    - options
    
$.twilightBark.wrap

$.twilightBark.setTimeout

$.twilightBark.setInterval

$.twilightBark.cleanUp
