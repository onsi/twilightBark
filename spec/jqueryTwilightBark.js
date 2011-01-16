describe("jQueryErrorReporter", function() {
	var theHandler, theFail;
	beforeEach(function() {
		theHandler =jasmine.createSpy('theHandler');
		theFail = function() { throw('Boom!') };
		jQuery.reportErrorsTo(theHandler);
	});
	
	var expectTheHandlerIsCalledWhen = function(callback) {
		expect(theHandler).not.toHaveBeenCalled();
		callback();
		expect(theHandler).toHaveBeenCalled();		
		theHandler.reset();
	}
	
	var expectTheHandlerIsNotCalledWhen = function(callback) {
		expect(theHandler).not.toHaveBeenCalled();
		callback();
		expect(theHandler).not.toHaveBeenCalled();
	}

	describe('onReady', function() {
		it('reports errors that take place on ready', function() {
			expectTheHandlerIsCalledWhen(function() {
				$(document).ready(theFail);
			});
		});		
	});
	
	//Add tests for adding eventData (see http://api.jquery.com/bind/)
	describe('events', function() {
		describe('bind/unbind', function() {
			var div;
			beforeEach(function() {
				div = $('<div>');
				$('body').append(div);
			});
			afterEach(function() {
				div.remove();
			});
			it('fires when event handlers blow up', function() {
				div.click(theFail);
				expectTheHandlerIsCalledWhen(function() {
					div.click();
				});
			});
			it('does not interfere with event unbinding', function() {
				div.click(theFail);
				expectTheHandlerIsCalledWhen(function() {
					div.click();
				});
				div.unbind('click', theFail);
				expectTheHandlerIsNotCalledWhen(function() {
					div.click();
				});				
			});
			it('correctly handles the handler === false case', function() {
				div.click(theFail);
				var subDiv = $('<div>')
				div.append(subDiv)
				expectTheHandlerIsCalledWhen(function() {
					subDiv.click();
				});
				subDiv.click(false);
				expectTheHandlerIsNotCalledWhen(function() {
					subDiv.click();
				});				
			});
		});
		describe('live/die', function() {
			beforeEach(function() {
				$('div').live('click', theFail);
			});
			it('fires when event handlers blow up', function() {
				var div = $('<div>');
				$('body').append(div);
				expectTheHandlerIsCalledWhen(function() {
					div.click();
				});				
			});
		});
	
	});
	
});