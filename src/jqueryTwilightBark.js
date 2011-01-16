(function($) {
	var _errorHandler = $.noop;
	var ready = false;
	var jqueryReady, jqueryEventAdd;
	
	$.reportErrorsTo = function(errorHandler) {
		_errorHandler = $.isFunction(errorHandler) ? errorHandler : $.noop;
		if (ready) return;
		jqueryEventAdd = $.event.add;
		
		$.event.add = function(elem, types, handler, data) {
			if (handler === false) {
				jqueryEventAdd(elem, types, handler, data);
				return;			
			}
			_handler = function() {
				try {
					handler.apply(this, arguments);
				} catch(e) {
					_errorHandler(e);
				}
			}
			jqueryEventAdd(elem, types, _handler, data);
			handler.guid = _handler.guid;
		}
		ready = true;
	};
})(jQuery);