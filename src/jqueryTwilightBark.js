(function($) {
	var _errorHandler = $.noop;
	var generateEventHandler, customBinder;
	var ready = false;
	var windowSetTimeout = window.setTimeout;
	var windowSetInterval = window.setInterval;
	var jqueryFnBind = $.fn.bind;
	var jqueryFnOne = $.fn.one;
	var jqueryFnLive = $.fn.live;
    var jqueryReady;
	
	
	$.reportErrorsTo = function(errorHandler, options) {
	    /*
            reportErrorsTo(errorHandler, options)
            errorHandler(e, report) is a callback that will receive the original exception raised (e) and a report object.
            options = {
                replaceTimers: BOOL, //If true then window.setTimeout and window.setInterval are overloaded.  If false, you must either wrap your timer callbacks or use $.setTimeout and $.setInterval to track errors.  Defaults to false
            }
	    */
	    options = options || {};
		_errorHandler = $.isFunction(errorHandler) ? errorHandler : $.noop;
		$.fn.bind = customBinder(jqueryFnBind);
		$.fn.one = customBinder(jqueryFnOne);
		$.fn.live = customBinder(jqueryFnLive);
		if (options.replaceTimers) {
		    window.setTimeout = function() {
		        $.setTimeout.apply(window, arguments);
		    }
		    window.setInterval = function() {
		        $.setInterval.apply(window, arguments);
		    }
		}
	};
	
	$.each(['setTimeout', 'setInterval'], function(i, name) {
	    $[name] = function() {
            var args = Array.prototype.slice.call(arguments);
            if (!$.isFunction(args[0])) throw('Please only pass functions to ' + name);
            args[0] = wrapFunction(window, args[0]);
            return (name === 'setTimeout' ? windowSetTimeout : windowSetInterval).apply(window, args);
	    }
	});
	
	$.cleanUpTwilightBark = function() {
	    window.setTimeout = windowSetTimeout;
	    window.setInterval = windowSetInterval;
	    $.fn.bind = jqueryFnBind;
	    $.fn.one = jqueryFnOne;
	    $.fn.live = jqueryFnLive;
	};
	
	
	wrapFunction = function(context, handler) {
		if (handler === false) return false;
		return function() {
			try {
				return handler.apply(context, arguments);
			} catch(e) {
				_errorHandler(e);
			}
		}
	};
	
	customBinder = function(passThrough) {
		return function(type, data, fn, origSelector) {
			handler = ( $.isFunction( data ) || data === false ) ? data : fn;
			_handler = wrapFunction(this, handler);
			if (handler === data) {
				passThrough.call(this, type, _handler, undefined, origSelector);
			} else {
				passThrough.call(this, type, data, _handler, origSelector);
			}
			if (handler !== false) handler.guid = _handler.guid;
			return this;
		}
	};


	
})(jQuery);