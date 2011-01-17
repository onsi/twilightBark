(function($) {
	var _errorHandler = $.noop;
	var generateEventHandler, customBinder;
	var ready = false;
	var jqueryReady, jqueryFnBind, jqueryFnOne, jqueryFnLive;
	
	generateEventHandler = function(context, handler) {
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
			_handler = generateEventHandler(this, handler);
			if (handler === data) {
				passThrough.call(this, type, _handler, undefined, origSelector);
			} else {
				passThrough.call(this, type, data, _handler, origSelector);
			}
			if (handler !== false) handler.guid = _handler.guid;
			return this;
		}
	};

	$.reportErrorsTo = function(errorHandler) {
		_errorHandler = $.isFunction(errorHandler) ? errorHandler : $.noop;
		if (ready) return;
		jqueryFnBind = $.fn.bind;
		jqueryFnOne = $.fn.one;
		jqueryFnLive = $.fn.live;
		$.fn.bind = customBinder(jqueryFnBind);
		$.fn.one = customBinder(jqueryFnOne);
		$.fn.live = customBinder(jqueryFnLive);
		ready = true;
	};
})(jQuery);