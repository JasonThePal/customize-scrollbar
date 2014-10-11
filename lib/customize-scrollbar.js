(function ($) {
	'use strict';
	var pluginName = 'scrollbar',
			defaults = {
				scrollbar: '.scrollbar',
				up: '.up',
				thumb: '.thumb',
				down: '.down'
			};
	var Plugin = function (element, options) {
			this.$element = element;
			this.element = element.get(0);
			this.options = $.extend(true, {}, defaults, options);
			this.init();
		};
	$.fn[pluginName] = function (options) {
		return new Plugin(this, options);
	};
	Plugin.prototype = {
		init: function(){
			this.$element.css({'overflow':'hidden'});
			this.$btnBar = $(this.options.thumb);
			this.$btnTop = $(this.options.up);
			this.$btnBottom = $(this.options.down);
			this.$scrollBar = $(this.options.scrollbar);
			this.$dragArea = $('body');
			this.contentClientHeight = this.$element.height();
			this.btnTopHeight = this.$btnTop.outerHeight();
			this.btnBottomHeight = this.$btnBottom.outerHeight();
			this.scrollbarHeight = this.$scrollBar.innerHeight();
			this.scrollbarOffsetTop = this.$scrollBar.offset().top;
			this.refresh();
			this._trigger();
		},
		refresh: function(){
			this.contentScrollTop = 0;
			this.contentScrollHeight = this.element.scrollHeight;
			this.step = this.contentClientHeight / 2 / this.contentScrollHeight;
			this.contentMaxOffset = this.contentScrollHeight - this.contentClientHeight;
			this.resizeBarHeight();
			this.scrollAll(0);
			this.$scrollBar.show();
			if(this.contentMaxOffset <= 0){
				this.$scrollBar.hide();
			}
		},
		resizeBarHeight: function(){
			var len = (this.scrollbarHeight - this.btnBottomHeight - this.btnTopHeight) * (this.contentClientHeight / this.contentScrollHeight);
			this.$btnBar.css({'height' : len});
			this.btnBarHeight = this.$btnBar.outerHeight();
			this.scrollbarMaxOffset = this.scrollbarHeight - this.btnBottomHeight - this.btnTopHeight - this.btnBarHeight;
		},
		scrollTo: function(percent){
			var p = this.range(percent, 0, 1);
			var top = this.btnTopHeight;
			var v = top + p * this.scrollbarMaxOffset;
			this.$btnBar.css({'top' : v});
		},
		contentTo: function(percent){
			var p = this.range(percent, 0, 1);
			var v = p * this.contentMaxOffset;
			this.contentScrollTop = v;
			this.$element.scrollTop(v);
		},
		scrollAll: function(percent){
			this.scrollTo(percent);
			this.contentTo(percent);
		},
		getContentPercent: function(){
			return this.contentScrollTop / this.contentMaxOffset;
		},
		range: function(v, min, max){
			if(v <= min){
				return min;
			}
			if(v >= max){
				return max;
			}
			return v;
		},
		getPercentByPageY: function(y){
			return (y - this.scrollbarOffsetTop - this.btnTopHeight) / this.scrollbarMaxOffset;
		},
		_trigger: function(){
			var that = this;
			var isDown = false;
			var offset = 0;
			this.$element.mousewheel(function(e){
				var p = that.getContentPercent() + that.step * -e.deltaY;
				that.scrollAll(p);
				return false;
			});
			this.$scrollBar.mousedown(function(e){
				var p = that.getPercentByPageY(e.pageY-that.btnBarHeight/2);
				that.scrollAll(p);
				isDown = true;
				offset = that.btnBarHeight/2;
				return false;
			});
			this.$btnBar.mousedown(function(e){
				isDown = true;
				offset = e.offsetY;
				return false;
			});
			this.$dragArea.mouseup(function(){
				isDown = false;
				offset = 0;
				return false;
			});
			this.$dragArea.mousemove(function(e){
				if(isDown){
					var p = that.getPercentByPageY(e.pageY - offset);
					that.scrollAll(p);
					return false;
				}
			});
			this.$btnTop.mousedown(function(){
				that.scrollAll(that.getContentPercent() - that.step/3);
				return false;
			});
			this.$btnBottom.mousedown(function(){
				that.scrollAll(that.getContentPercent() + that.step/3);
				return false;
			});
			this.$element.on('DOMNodeRemoved DOMNodeInserted', function(){
				setTimeout(function(){
					that.refresh();
				}, 50);
			});
		}
	};
})(jQuery, window);
