(function($) {
	var _errorHandler = $.noop;
	var generateEventHandler, generateBindAndOne;
	var ready = false;
	var jqueryReady, jqueryFnBind, jqueryFnOne;
	
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
	
	bindAndOne = function(passThrough) {
		return function(type, data, fn) {
			handler = ( $.isFunction( data ) || data === false ) ? data : fn;
			_handler = generateEventHandler(this, handler);
			if (handler === data) {
				passThrough.call(this, type, _handler);
			} else {
				passThrough.call(this, type, data, _handler);
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
		$.fn.bind = bindAndOne(jqueryFnBind);
		$.fn.one = bindAndOne(jqueryFnOne);
		ready = true;
	};
})(jQuery);