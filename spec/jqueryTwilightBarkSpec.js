describe("jQueryErrorReporter", function() {
	var theHandler, theFail;
	beforeEach(function() {
		theHandler =jasmine.createSpy();
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
	
	describe('events', function() {
		var div;
		beforeEach(function() {
			div = $('<div>');
			$('body').append(div);
		});
		afterEach(function() {
			div.remove();
		});
		describe('bind/unbind', function() {
			describe("when there is no data passed in", function() {
				it('fires when event handlers blow up', function() {
					div.bind('click', theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
				});
				it('does not interfere with event unbinding', function() {
					div.bind('click', theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
					div.unbind('click', theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div.click();
					});				
				});
				it('correctly handles the handler === false case', function() {
					div.bind('click', theFail);
					var subDiv = $('<div>')
					div.append(subDiv)
					expectTheHandlerIsCalledWhen(function() {
						subDiv.click();
					});
					subDiv.bind('click', false);
					expectTheHandlerIsNotCalledWhen(function() {
						subDiv.click();
					});				
				});
				describe("not altering bind's default behavior", function() {
					it("passes the correct event object", function() {
						func = function(e) {
							expect(e.type).toEqual('click');
						}
						div.bind('click', func);
						div.click();
					});
					it("does not interfere with the event handler's context", function() {
						func = function(e) {
							expect(this).toEqual(div[0]);
						}
						div.bind('click', func);
						div.click();
					});
					it("returns whatever the event handler returns", function() {
						div.bind('click', theFail);
						var subDiv = $('<div>')
						div.append(subDiv)
						expectTheHandlerIsCalledWhen(function() {
							subDiv.click();
						});
						func = function(e) {
							expect(this).toEqual(subDiv);
							return false;
						}
						subDiv.bind('click', func);
						expectTheHandlerIsNotCalledWhen(function() {
							subDiv.click();
						});
					});
					it("allows chaining", function() {
						expect(div.bind('click', theFail)).toEqual(div);
					});
					it("is not confused with one!", function() {
						func = jasmine.createSpy();
						div.bind('click', func);
						div.click();
						expect(func).toHaveBeenCalled();
						div.click();
						expect(func).toHaveBeenCalled();
					});
				});
			});
			describe("when data is passed in", function() {
				it('fires when event handlers blow up', function() {
					div.bind('click', {my: 'data'}, theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
				});
				it('does not interfere with the data passing functionality', function() {
					var func = jasmine.createSpy();
					div.bind('click', {my: 'data'}, func);
					div.click();
					expect(func).toHaveBeenCalled();
					expect(func.mostRecentCall.args[0].data).toEqual({my: 'data'});
				});
				it('does not interfere with event unbinding', function() {
					div.bind('click', {my: 'data'}, theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
					div.unbind('click', theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div.click();
					});				
				});
				it('correctly handles the handler === false case', function() {
					div.bind('click', {my: 'data'}, theFail);
					var subDiv = $('<div>')
					div.append(subDiv)
					expectTheHandlerIsCalledWhen(function() {
						subDiv.click();
					});
					subDiv.bind('click', {my: 'data'}, false);
					expectTheHandlerIsNotCalledWhen(function() {
						subDiv.click();
					});				
				});				
			});
		});
		describe('shortcut functions', function() {
			var testHandler = function(ev) {
				it("handles " + ev, function() {						
					div[ev](theFail);
					expectTheHandlerIsCalledWhen(function() {
						div[ev]();
					});
					div.unbind(ev, theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div[ev]();
					});
					div[ev]({my: 'data'}, theFail);
					expectTheHandlerIsCalledWhen(function() {
						div[ev]();
					});
					div.unbind(ev, theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div[ev]();
					});						
				});	
			};
			describe('catches errors on handlers bound via shortcut functions', function() {
				var i, ilen, ev;
				var events = ["blur", "focus", "focusin", "focusout", "load", "resize", "scroll", "unload", "click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "mouseenter", "mouseleave", "change", "select", "submit", "keydown", "keypress", "keyup", "error"];
				ilen = events.length;
				for (i = 0 ; i < ilen ; i += 1) {
					testHandler(events[i]);
				}
			});
		});
		describe('one/unbind', function() {
			describe("when there is no data passed in", function() {
				it('fires when event handlers blow up', function() {
					div.one('click', theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
				});
				it('does not interfere with event unbinding', function() {
					div.one('clic', theFail);
					div.unbind('click', theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div.click();
					});
				});
				it('correctly handles the handler === false case', function() {
					div.one('click', false);
					expect(function() {div.click()}).toThrow("Object false has no method 'apply'");
				});
				describe("not altering one's default behavior", function() {
					it("passes the correct event object", function() {
						func = function(e) {
							expect(e.type).toEqual('click');
						}
						div.one('click', func);
						div.click();
					});
					it("does not interfere with the event handler's context", function() {
						func = function(e) {
							expect(this).toEqual(div[0]);
						}
						div.one('click', func);
						div.click();
					});
					it("returns whatever the event handler returns", function() {
						div.bind('click', theFail);
						var subDiv = $('<div>')
						div.append(subDiv)
						expectTheHandlerIsCalledWhen(function() {
							subDiv.click();
						});
						func = function(e) {
							expect(this).toEqual(subDiv);
							return false;
						}
						subDiv.one('click', func);
						expectTheHandlerIsNotCalledWhen(function() {
							subDiv.click();
						});
					});
					it("allows chaining", function() {
						expect(div.one('click', theFail)).toEqual(div);
					});
					it("only allows the event to occur once", function() {
						func = jasmine.createSpy();
						div.one('click', func);
						div.click();
						expect(func).toHaveBeenCalled();
						func.reset();
						div.click();
						expect(func).not.toHaveBeenCalled();
					});
				});
			});
			describe("when data is passed in", function() {
				it('fires when event handlers blow up', function() {
					div.one('click', {my: 'data'}, theFail);
					expectTheHandlerIsCalledWhen(function() {
						div.click();
					});
				});
				it('does not interfere with the data passing functionality', function() {
					var func = jasmine.createSpy();
					div.one('click', {my: 'data'}, func);
					div.click();
					expect(func).toHaveBeenCalled();
					expect(func.mostRecentCall.args[0].data).toEqual({my: 'data'});
				});
				it('does not interfere with event unbinding', function() {
					div.one('click', {my: 'data'}, theFail);
					div.unbind('click', theFail);
					expectTheHandlerIsNotCalledWhen(function() {
						div.click();
					});				
				});
				it('correctly handles the handler === false case', function() {
					div.one('click', {my: 'data'}, false);
					expect(function() {div.click()}).toThrow("Object false has no method 'apply'");
				});				
			});
		});
	});
});