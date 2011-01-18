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
	
	$.twilightBark = {};
	
	$.twilightBark.reportTo = function(errorHandler, options) {
	    options = options || {};
		_errorHandler = $.isFunction(errorHandler) ? errorHandler : $.noop;
		$.fn.bind = customBinder(jqueryFnBind);
		$.fn.one = customBinder(jqueryFnOne);
		$.fn.live = customBinder(jqueryFnLive);
		if (options.replaceTimers) {
		    window.setTimeout = function() {
		        $.twilightBark.setTimeout.apply(window, arguments);
		    }
		    window.setInterval = function() {
		        $.twilightBark.setInterval.apply(window, arguments);
		    }
		}
	};
	
	$.each(['setTimeout', 'setInterval'], function(i, name) {
	    $.twilightBark[name] = function() {
            var args = Array.prototype.slice.call(arguments);
            if (!$.isFunction(args[0])) throw('Please only pass functions to ' + name);
            args[0] = $.twilightBark.wrap(args[0]);
            return (name === 'setTimeout' ? windowSetTimeout : windowSetInterval).apply(window, args);
	    }
	});
	
	$.twilightBark.wrap = function(handler, context) {
		if (handler === false) return false;
		if (!$.isFunction(handler)) throw('Can only wrap functions');
		return function() {
			try {
				return handler.apply(context || window, arguments);
			} catch(e) {
				_errorHandler(e);
			}
		}
	};
	
	$.twilightBark.cleanUp = function() {
	    window.setTimeout = windowSetTimeout;
	    window.setInterval = windowSetInterval;
	    $.fn.bind = jqueryFnBind;
	    $.fn.one = jqueryFnOne;
	    $.fn.live = jqueryFnLive;
	};
	
	customBinder = function(passThrough) {
		return function(type, data, fn, origSelector) {
			handler = ( $.isFunction( data ) || data === false ) ? data : fn;
			_handler = $.twilightBark.wrap(handler, this);
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