// Copyright (c) 2011 Link2Click.com
// Originally found at http://www.link2click.com
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
	( function($) {
		$.fn.l2block = function(){
				this.each(function(){
					var $this = jQuery(this);
					$(".l2error"+this.id).remove();
					$(".l2success"+this.id).remove();
					/*
					$this.before('<div class="l2loader" id="l2loader'+this.id+'"><img src="'+siteurl+'/images/loader.gif"></div>');
					$this.hide();
					*/
					var bgcolor = '#FFFFFF';
					var opacity = 50;
					var $this = jQuery(this);
					bwith = $this.width();
					bheight = $this.height();
					opacity2 = opacity/100;
					$this.prepend('<div class="l2loader" id="l2loader'+this.id+'"></div>');
					$this.children(".l2loader").css({'width': bwith+'px', 'height': bheight+'px', 'background':bgcolor, 'position': 'absolute', 'filter': 'alpha(opacity='+opacity+')', 'opacity': opacity2, 'z-index':'99'}); 
					$this.prepend('<div class="l2loader2 loader" id="l2loader2'+this.id+'"></div>');
					$this.children(".l2loader2").css({'width': bwith+'px', 'height': bheight+'px', 'position': 'absolute', 'z-index':'9999'}); 
				});
		}
		
		$.fn.l2unblock = function(){
				this.each(function(){
					var $this = jQuery(this);
					$("#l2loader"+this.id).remove();
					$("#l2loader2"+this.id).remove();
					$this.show();
				});
		}
		
		$.fn.l2load = function(){
				this.each(function(){
					var $this = jQuery(this);
					$(".l2error"+this.id).remove();
					$(".l2success"+this.id).remove();
					$this.before('<div class="l2loader" id="l2loader'+this.id+'"><div class="loader2"></div></div>');
					$this.hide();
				});
		}
		
		$.fn.l2error = function(msg){
				this.each(function(){
					var $this = jQuery(this);
					$this.before('<div class="l2error'+this.id+' error_box" style="display:none">'+msg+'</div>');
					$(".l2error"+this.id).fadeIn();
				});
		}
		$.fn.l2success = function(msg){
				this.each(function(){
					var $this = jQuery(this);
					$this.before('<div class="l2success'+this.id+' success_box" style="display:none"><span class="icon"></span>'+msg+'</div>');
					$(".l2success"+this.id).fadeIn();
				});
		}
		
		$.fn.l2adblock = function(bgcolor, opacity){
				this.each(function(){
					$(".l2error"+this.id).remove();
					$(".l2success"+this.id).remove();
					var $this = jQuery(this);
					bwith = $this.width();
					bheight = $this.height();
					opacity2 = opacity/100;
					$this.prepend('<div class="l2adblocked"></div>');
					$this.children(".l2adblocked").css({'width': bwith+'px', 'height': bheight+'px', 'background':bgcolor, 'position': 'absolute', 'filter': 'alpha(opacity='+opacity+')', 'opacity': opacity2}); 
				});
		}
		
		$.fn.l2adunblock = function(){
				this.each(function(){
					var $this = jQuery(this);
					$this.children(".l2adblocked").remove();
				});
		}
	})(jQuery);