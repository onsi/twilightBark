describe("jQueryErrorReporter", function() {
	var theHandler, theFail;
	beforeEach(function() {	    
    	theHandler = jasmine.createSpy();
    	theFail = function() { throw('Boom!') };
	});
	
	afterEach(function() {
	    $.twilightBark.cleanUp();
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

	describe('overriding $.ready', function() {
	    beforeEach(function() {
	        $.twilightBark.reportErrors({handler: theHandler});
	    });
		it('reports errors that take place on ready', function() {
			expectTheHandlerIsCalledWhen(function() {
				$(document).ready(theFail);
			});
		});		
		it('reports errors that take place on ready', function() {
			expectTheHandlerIsCalledWhen(function() {
				$().ready(theFail);
			});
		});		
		it('reports errors that take place on ready', function() {
			expectTheHandlerIsCalledWhen(function() {
				$(theFail);
			});
		});
		it('returns the correct object', function() {
			expect($(document).ready(function() {})).toEqual($(document));
		});
		it ('calls the function in the document context and passes it the jQuery object', function() {
			var func = function(a) {
				expect(this).toEqual(document);
				expect(a).toEqual($);
			}
			$(document).ready(func);
		})
	});
	
	describe('simple binding events', function() {
	    beforeEach(function() {
    		$.twilightBark.reportErrors({handler: theHandler});
    	});
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
	
	describe('persistent live/delegate events', function() {
	    beforeEach(function() {
    		$.twilightBark.reportErrors({handler: theHandler});
    	});
    	describe('live/die', function() {
    		var addDiv = function(classString) {
    			var div = $('<div>', {'class': classString || ''});
    			$('body').append(div);			
    			return div;
    		}
    		afterEach(function() {
    			$('div').die();
    		});
    		describe("when there is no data passed in", function() {
    			it('fires when event handlers blow up', function() {
    				var div;
    				$('div').live('click', theFail);
    				div = addDiv();
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});
    				div.remove();
    			});
    			it('does not interfere with die', function() {
    				var div;
    				$('div').live('click', theFail);
    				div = addDiv();
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});
    				$('div').die('click', theFail);
    				expectTheHandlerIsNotCalledWhen(function() {
    					div.click();
    				});	
    				div = addDiv();
    				expectTheHandlerIsNotCalledWhen(function() {
    					div.click();
    				});								
    			});
    			describe("not altering live's default behavior", function() {
    				it("passes the correct event object", function() {
    					func = function(e) {
    						expect(e.type).toEqual('click');
    					}
    					$('div').live('click', func);
    					div = addDiv();
    					div.click();
    					div.remove();
    				});
    				it("does not interfere with the event handler's context", function() {
    					func = function(e) {
    						expect(this).toEqual(div[0]);
    					}
    					var div;
    					$('div').live('click', func);
    					div = addDiv();
    					div.click();
    					div.remove();
    				});
    			});
    		});
    		describe("when data is passed in", function() {
    			it('fires when event handlers blow up', function() {
    				var div;
    				$('div').live('click', {my: 'data'}, theFail);
    				div = addDiv();
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});
    				div.remove();
    			});
    			it('does not interfere with the data passing functionality', function() {
    				var div;
    				var func = jasmine.createSpy();
    				$('div').live('click', {my: 'data'}, func);
    				div = addDiv();
    				div.click();
    				expect(func).toHaveBeenCalled();
    				expect(func.mostRecentCall.args[0].data).toEqual({my: 'data'});
    				div.remove();
    			});
    			it('does not interfere with die', function() {
    				var div;
    				$('div').live('click', {my: 'data'}, theFail);
    				div = addDiv();
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});
    				$('div').die('click', theFail);
    				expectTheHandlerIsNotCalledWhen(function() {
    					div.click();
    				});
    				div.remove();
    			});
    		});
		});
		describe('delegate/undelegate', function() {
		    var parent, child, other;
		    beforeEach(function() {
		        parent = $('<div>', {'class': 'parent'});
		        child = $('<div>', {'class': 'clicker'});
		        other = $('<div>', {'class': 'clicker'});
		        parent.append(child);
		        $('body').append(parent)
		        $('body').append(other)
		    });
    		afterEach(function() {
                parent.remove();
                other.remove();
    		});
    		var addDiv = function(classString) {
    			var div = $('<div>', {'class': classString || ''});
    			$('body').append(div);			
    			return div;
    		}
    		describe("when there is no data passed in", function() {
    			it('fires when event handlers blow up', function() {
    			    parent.delegate('div.clicker', 'click', theFail);
    				expectTheHandlerIsCalledWhen(function() {
    					child.click();
    				});
    				expectTheHandlerIsNotCalledWhen(function() {
    					other.click();
    				});
    				var div = $('<div>', {'class': 'clicker'});
                    parent.append(div);
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});                        
    			});
    			it('does not interfere with undelegate', function() {
    			    parent.delegate('div.clicker', 'click', theFail);
    				expectTheHandlerIsCalledWhen(function() {
    					child.click();
    				});
    				parent.undelegate('div.clicker', 'click', theFail);
    				expectTheHandlerIsNotCalledWhen(function() {
    					child.click();
    				});        				
    				var div = $('<div>', {'class': 'clicker'});
                    parent.append(div);
    				expectTheHandlerIsNotCalledWhen(function() {
    					div.click();
    				});                        
    			});
    			describe("not altering live's default behavior", function() {
    				it("passes the correct event object", function() {
    					func = function(e) {
    						expect(e.type).toEqual('click');
    					}
        			    parent.delegate('div.clicker', 'click', func);
        			    child.click();
    				});
    				it("does not interfere with the event handler's context", function() {
    					func = function(e) {
    						expect(this).toEqual(child[0]);
    					}
        			    parent.delegate('div.clicker', 'click', func);
        			    child.click();
    				});
    			});
    		});
    		describe("when data is passed in", function() {
    			it('fires when event handlers blow up', function() {
    			    parent.delegate('div.clicker', 'click', {my: 'data'}, theFail);
    				expectTheHandlerIsCalledWhen(function() {
    					child.click();
    				});
    				expectTheHandlerIsNotCalledWhen(function() {
    					other.click();
    				});
    				var div = $('<div>', {'class': 'clicker'});
                    parent.append(div);
    				expectTheHandlerIsCalledWhen(function() {
    					div.click();
    				});                        
    			});
    			it('does not interfere with the data passing functionality', function() {
    				var func = jasmine.createSpy();
    			    parent.delegate('div.clicker', 'click', {my: 'data'}, func);
    				child.click();
    				expect(func).toHaveBeenCalled();
    				expect(func.mostRecentCall.args[0].data).toEqual({my: 'data'});
    			});
    			it('does not interfere with undelegate', function() {
    			    parent.delegate('div.clicker', 'click', {my: 'data'}, theFail);
    				expectTheHandlerIsCalledWhen(function() {
    					child.click();
    				});
    				parent.undelegate('div.clicker', 'click', theFail);
    				expectTheHandlerIsNotCalledWhen(function() {
    					child.click();
    				});        				
    				var div = $('<div>', {'class': 'clicker'});
                    parent.append(div);
    				expectTheHandlerIsNotCalledWhen(function() {
    					div.click();
    				});                        
    			});
    		});
		});
	});
	
	describe('setInterval and setTimeout', function() {
	    describe('setting the replaceTimers boolean to true', function() {
	        beforeEach(function() {
	            $.twilightBark.reportErrors({handler: theHandler, replaceTimers: true});
	            spyOn($.twilightBark, 'setTimeout');
	            spyOn($.twilightBark, 'setInterval');
	        });
	        it('overloads the browser defined setTimeout function', function() {
	            var func = function() {};
	            window.setTimeout(func, 100, 'param1', 'param2');
	            expect($.twilightBark.setTimeout).toHaveBeenCalled();
	            expect($.twilightBark.setTimeout.mostRecentCall.args[0]).toEqual(func);
	            expect($.twilightBark.setTimeout.mostRecentCall.args[1]).toEqual(100);
	            expect($.twilightBark.setTimeout.mostRecentCall.args[2]).toEqual('param1');
	            expect($.twilightBark.setTimeout.mostRecentCall.args[3]).toEqual('param2');
	        });
	        it('overloads the browser defined setInterval function', function() {
	            var func = function() {};
	            window.setInterval(func, 100, 'param1', 'param2');
	            expect($.twilightBark.setInterval).toHaveBeenCalled();
	            expect($.twilightBark.setInterval.mostRecentCall.args[0]).toEqual(func);
	            expect($.twilightBark.setInterval.mostRecentCall.args[1]).toEqual(100);
	            expect($.twilightBark.setInterval.mostRecentCall.args[2]).toEqual('param1');
	            expect($.twilightBark.setInterval.mostRecentCall.args[3]).toEqual('param2');	            
	        });
	    });
	    describe('setting the replaceTimers boolean to false', function() {
	        beforeEach(function() {
	            $.twilightBark.reportErrors({handler: theHandler}); //false is the default
	            spyOn($.twilightBark, 'setTimeout');
	            spyOn($.twilightBark, 'setInterval');
	        });
	        it('does not overload the browser defined setTimeout function', function() {
	            var func = function() {};
	            window.setTimeout(func, 100, 'param1', 'param2');
	            expect($.twilightBark.setTimeout).not.toHaveBeenCalled();
	        });
	        it('does not overload the browser defined setInterval function', function() {
	            var func = function() {};
	            window.setInterval(func, 100, 'param1', 'param2');
	            expect($.twilightBark.setInterval).not.toHaveBeenCalled();
	        });
	    });
	    describe('the custom setTimeout and setInterval implementations', function() {
	        beforeEach(function() {
	            jasmine.Clock.useMock()
	            $.twilightBark.reportErrors({handler: theHandler});
            });
            afterEach(function() {
                jasmine.Clock.reset();
            })
            describe('setTimeout', function() {
    	        it('catches errors', function() {
    	            $.twilightBark.setTimeout(theFail, 100);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            expectTheHandlerIsCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });
    	        });
    	        it('returns the correct timer ID', function() {
    	            var id = $.twilightBark.setTimeout(theFail, 100);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            clearTimeout(id);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });    	            
    	        });
    	        it('does not allow strings to be passed (no eval!)', function() {
    	            expect(function() {$.twilightBark.setTimeout("execute this code please", 100)}).toThrow("Please only pass functions to setTimeout")
    	        });
    	        xit('passes all passed arguments and executes the handler in the global (window) context', function() {
    	            //This is working but jasmine doesn't mock out setTimeout correctly
    	            var func = function(a, b) {
    	                expect(a).toEqual(17);
    	                expect(b).toEqual({more: 'args'});
    	                expect(this).toEqual(window);
    	            }
    	            $.twilightBark.setTimeout(func, 100, 17, {more: 'args'});
    	            jasmine.Clock.tick(100);
    	        });
            });
            describe('setInterval', function() {
    	        it('catches errors', function() {
    	            $.twilightBark.setInterval(theFail, 100);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            expectTheHandlerIsCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            expectTheHandlerIsCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });
    	        });
    	        it('returns the correct timer ID', function() {
    	            var id = $.twilightBark.setInterval(theFail, 100);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(99);
    	            });
    	            clearTimeout(id);
    	            expectTheHandlerIsNotCalledWhen(function() {
    	                jasmine.Clock.tick(1);
    	            });
    	        });
    	        it('does not allow strings to be passed (no eval!)', function() {
    	            expect(function() {$.twilightBark.setInterval("execute this code please", 100)}).toThrow("Please only pass functions to setInterval")
    	        });
    	        xit('passes all passed arguments and executes the handler in the global (window) context', function() {
    	            //This is working but jasmine doesn't mock out setInterval correctly
    	            var func = function(a, b) {
    	                expect(a).toEqual(17);
    	                expect(b).toEqual({more: 'args'});
    	                expect(this).toEqual(window);
    	            }
    	            $.twilightBark.setInterval(func, 100, 17, {more: 'args'});
    	            jasmine.Clock.tick(100);
    	        });
            });
	    });
	});
	describe('Custom function wrapping with $.twilightBark.wrap', function() {
	    beforeEach(function() {
    		$.twilightBark.reportErrors({handler: theHandler});
    	});
	    it('wraps the function and applies the supplied context', function() {
	        expect(theFail).toThrow('Boom!')
	        var obj = {};
	        var func = $.twilightBark.wrap(theFail, obj);
	        expectTheHandlerIsCalledWhen(func);
	        var func = $.twilightBark.wrap(function(a, b, c) {
	            expect(this).toEqual(obj);
	            expect(a).toEqual(17);
	            expect(b).toEqual({my: 'data'});
	            expect(c).toEqual(obj);
	        }, obj);
	        func(17, {my: 'data'}, obj);
	    });
	    it('accepts a function without an associated context', function() {
	        expect(theFail).toThrow('Boom!')
	        var obj = {};
	        var func = $.twilightBark.wrap(theFail);
	        expectTheHandlerIsCalledWhen(func);
	        var func = $.twilightBark.wrap(function(a, b, c) {
	            expect(this).toEqual(window);
	            expect(a).toEqual(17);
	            expect(b).toEqual({my: 'data'});
	            expect(c).toEqual(obj);
	        });
	        func(17, {my: 'data'}, obj);	        
	    });
	    it('throws an error if the object being wrapped is not a function', function() {
	        expect(function() {
	            $.twilightBark.wrap('not a function')
	        }).toThrow('Can only wrap functions');
	    });
	});
	describe('Config options', function() {
		describe('throwErrors', function() {
			describe('when set to true', function() {
				it('calls the handler and throws errors', function() {
					$.twilightBark.reportErrors({handler: theHandler, throwErrors: true});
					expect(theHandler).not.toHaveBeenCalled();
					expect(function() {$(theFail)}).toThrow('Boom!');
					expect(theHandler).toHaveBeenCalled();
				});
			});
			describe('when set to false (the default value)', function() {
				it('calls the handler but does not throw errors', function() {
					$.twilightBark.reportErrors({handler: theHandler});
					expect(theHandler).not.toHaveBeenCalled();
					expect(function() {$(theFail)}).not.toThrow('Boom!');
					expect(theHandler).toHaveBeenCalled();					
				});
			});
		});
	});
	
});