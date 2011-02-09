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
	original.ajax = $.ajax;
	$(fnFuncs).each(function(i, name) {
		original[name] = $.fn[name];
	});
	$(windowFuncs).each(function(i, name) {
		original[name] = window[name];
	});
	
	$.twilightBark = {};
	
	$.twilightBark._original = original;
	
	$.twilightBark.reportErrors = function(options) {
	    options = options || {};
		_errorHandler = $.isFunction(options.handler) ? options.handler : $.noop;
		_throwErrors = (options.throwErrors !== null && options.throwErrors !== undefined) ? options.throwErrors : false;
		$.each(['bind', 'one', 'live'], function(i, name) {
			$.fn[name] = function(type, data, fn, origSelector) {
				var handler = ( $.isFunction( data ) || data === false ) ? data : fn;
				var _handler = $.twilightBark.wrap(handler, this);
				if (handler === data) {
					original[name].call(this, type, _handler, undefined, origSelector);
				} else {
					original[name].call(this, type, data, _handler, origSelector);
				}
				if (handler !== false) handler.guid = _handler.guid;
				return this;
			}
		});
		
		$.fn.ready = function(handler) {
			return original.ready.call(this, $.twilightBark.wrap(handler, document));
		};
		
		$.ajax = function(settings) {
			var s = jQuery.extend(true, {}, settings);
			$(['beforeSend', 'complete', 'dataFilter', 'error', 'success']).each(function(i, name) {
				if ($.isFunction(s[name])) s[name] = $.twilightBark.wrap(s[name]);
			});
			return original.ajax.call(this, s);
		};
		
		if (options.replaceTimers) {
			$.each(windowFuncs, function(i, name) {
				window[name] = function() {
					$.twilightBark[name].apply(window, arguments);
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
			var report;
			try {
				return handler.apply(context || this, arguments);
			} catch(e) {
				report = errorReport(e);
				_errorHandler(e, report);
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
		$.ajax = original.ajax;
	};
		
	errorReport = function(e) {
		var ret = {};
		if (!JSON || !JSON.stringify) {
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
		if (e.stack) {
			ret.exceptionStackTrace = e.stack;
		} else {
			ret.exceptionStackTrace = "Exception did not include a trace";
		}
		if (window.printStackTrace) {
			ret.printStackTrace = window.printStackTrace({e: e});
		} else {
			ret.printStackTrace = 'For a complete stacktrace please include the javascript-stacktrace library.  It can be found at: https://github.com/emwendelin/javascript-stacktrace'
		}
		return JSON.stringify(ret);
	};
})(jQuery);