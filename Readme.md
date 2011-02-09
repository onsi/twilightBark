# Twilight Bark, a jQuery plugin #
Twilight Bark is a simple little jQuery plugin that provides exception reporting.  In most cases all you need to do is include Twilight Bark and initialize it with an error handling callback before any calls to $(document).ready().  Your handler will be called and passed a comprehensive(ish) error report whenever an exception takes place.  You can then post this error to a server and provide your users with feedback.

# Requirements #
Twilight Bark requires:

- jQuery 1.4.4 (haven't tested jQuery 1.5 yet!)
- A JSON library to generate complete error reports
- The javascript-stacktrace library (available [https://github.com/emwendelin/javascript-stacktrace](here), but also provided in the lib directory)

# Usage & Options #

## Getting Started ##

- First: include `jqueryTwilightBark.js`, make sure jQuery is loaded first.
- Then: define an error handler.  This function will be called with two arguments: the exception raised and an error report.
- Finally: Initialize twilightBark, passing the handler in through the options hash.

Here's an example:

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


## Initialization Options ##

`$.twilightBark.reportTo` takes a hash of options:

- `handler`: this is required and is expected to be a function.  The handler will be called whenever an exception occurs and will be passed two arguments: the exception object and the error report.  The report is JSON representation of a dictionary object containing detailed information about the error.
- `throwErrors`: if set to `true` the exception caught by twilightBark will be thrown right **after** your handler returns.  Defaults to `false`.
- `replaceTimers`: if set to `true` twilightBark will overload `window.setTimeout` and `window.setInterval` with equivalent functions that automatically wrap the passed-in handlers with twilightBark's exception handling.  Defaults to `false`.  Note that the overloaded versions expect to receive functions as handlers, not strings to be evaled.

# Methods #

## `$.twilightBark.reportErrors({handler: YOURHANDLER, throwErrors: false, replaceTimers: false})` ##

Call this function once just before your first `$(document).ready()` The options hash is described above.

## `$.twilightBark.wrap(functionToWrap, context)` ##

Functions called via `$(document).ready()` and any jQuery's event bindings and/or AJAX callbacks are automatically wrapped with Twilight Bark's error handling code.  If you have any callbacks defined outside of these scopes you may need to wrap them with `$.twilightBark.wrap` first.

`$.twilightBark.wrap` takes two arguments:
- `functionToWrap`: is required and expected to be a JavaScript function.
- `context`: is optional and provided as a convenience method to allow you to simultaneously set the context (i.e. the value of `this`) for `functionToWrap`.  If a `context` is not set then the context that the wrapped function receives at runtime will be passed to `functionToWrap`

`$.twilightBark.wrap` returns a new function that calls through to and catches any errors thrown by `functionToWrap`

## `$.twilightBark.setTimeout` and `$.twilightBark.setInterval` ##

If you do not set `replaceTimers` to `true` when you call `$.twilightBark.reportTo` you will need to use Twilight Bark's internal versions of setTimeout and setInterval when setting timers.  These have the same signature as the timer functions provided by the browser.

## `$.twilightBark.cleanup` ##

Call this to turn twilightBark off.  This detaches the event handler overrides