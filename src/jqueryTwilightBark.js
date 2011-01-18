/*
	$.twilightBark.reportTo(options) where:
	options = {
		handler: function(e, report),
		throwErrors: true || false, //if true throws errors
		replaceTimers: true || false, //overrides window.setTimeout & window.setInterval
	}
*/
(function($) {
	var _errorHandler = $.noop, _throwErrors = false;
	var customBinder, errorReport;
	var ready = false;
	var original = {}, fnFuncs = ['bind', 'one', 'live', 'ready'], windowFuncs = ['setTimeout', 'setInterval'];
	$(fnFuncs).each(function(i, name) {
		original[name] = $.fn[name];
	});
	$(windowFuncs).each(function(i, name) {
		original[name] = window[name];
	});
	
	$.twilightBark = {};
	
	$.twilightBark.reportErrors = function(options) {
	    options = options || {};
		_errorHandler = $.isFunction(options.handler) ? options.handler : $.noop;
		_throwErrors = (options.throwErrors !== null && options.throwErrors !== undefined) ? options.throwErrors : false;
		$.each(['bind', 'one', 'live'], function(i, name) {
			$.fn[name] = customBinder(original[name]);
		});
		$.fn.ready = function(handler) {
			return original.ready.call(this, $.twilightBark.wrap(handler, document));
		}
		if (options.replaceTimers) {
			$.each(windowFuncs, function(i, name) {
				window[name] = function() {
					$.twilightBark[name].apply(window, arguments)
				};
			});
		}
	};
	
	$.each(windowFuncs, function(i, name) {
	    $.twilightBark[name] = function() {
            var args = Array.prototype.slice.call(arguments);
            if (!$.isFunction(args[0])) throw('Please only pass functions to ' + name);
            args[0] = $.twilightBark.wrap(args[0]);
            return original[name].apply(window, args);
	    }
	});
	
	$.twilightBark.wrap = function(handler, context) {
		if (handler === false) return false;
		if (!$.isFunction(handler)) throw('Can only wrap functions');
		return function() {
			try {
				return handler.apply(context || window, arguments);
			} catch(e) {
				_errorHandler(e, errorReport(e));
				if (_throwErrors) throw(e);
			}
		}
	};
	
	$.twilightBark.cleanUp = function() {
		$.each(windowFuncs, function(i, name) {
			window[name] = original[name];
		});
		$.each(fnFuncs, function(i, name) {
			$.fn[name] = original[name];
		});
	};
	
	customBinder = function(passThrough) {
		return function(type, data, fn, origSelector) {
			var handler = ( $.isFunction( data ) || data === false ) ? data : fn;
			var _handler = $.twilightBark.wrap(handler, this);
			if (handler === data) {
				passThrough.call(this, type, _handler, undefined, origSelector);
			} else {
				passThrough.call(this, type, data, _handler, origSelector);
			}
			if (handler !== false) handler.guid = _handler.guid;
			return this;
		}
	};
	
	errorReport = function(e) {
		var ret = {};
		if (!JSON.stringify) {
			return "Caught exception" + e + ".  Please include a JSON library for comprehensive reports.";
		}
		ret.date = new Date();
		if (e.name && e.message) ret.message = e.name + ": " + e.message;
		ret.exception = e;
		ret.cookies = document.cookie.split(';');
		ret.location = window.location;
		ret.navigator = {};
		for (key in navigator) {
			if (navigator.hasOwnProperty(key) && typeof(navigator[key]) !== typeof({})) ret.navigator[key] = navigator[key];
		}
		if (printStackTrace) {
			ret.stack = printStackTrace({e: e});
		} else {
			ret.stack = 'For a complete stacktrace please include the javascript-stacktrace library.  It can be found at: https://github.com/emwendelin/javascript-stacktrace'
		}
		return JSON.stringify(ret);
	};
	
})(jQuery);