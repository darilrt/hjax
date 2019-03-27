var hjax = {
	drawers: {},
	ajaxs: {},
	onready: undefined,
	
	init: function() {
		var draws = document.getElementsByTagName("draw");
		
		for(var i=0; i < draws.length; i++) {
			hjax.create_drawer(draws[i]);
		}
		
		var ajaxs = document.getElementsByTagName("ajax");
		
		for(var i=0; i < ajaxs.length; i++) {
			hjax.create_ajax(ajaxs[i]);
		}
		
		if (hjax.onready) hjax.onready();
	},
	
	create_drawer: function(element) {
		var name = element.getAttribute("name");
		hjax.drawers[name] = new hjax.Drawer(element);
	},
	
	create_ajax: function(element) {
		var name = element.getAttribute("name");
		hjax.ajaxs[name] = new hjax.Ajax(element);
	},
	
	get_drawer: function(name) {
		return hjax.drawers[name];
	},
	
	get_ajax: function(name) {
		return hjax.ajaxs[name];
	},
	
	Drawer: function(element) {
		this.parent = undefined;
		this.struct = undefined;
		
		this.init = function(element) {
			this.parent = element.parentElement;
			this.struct = element.cloneNode(true);
		};
		
		this.draw = function(item) {
			var draw = this._copy_and_replace(this.struct, item);
			
			var list = draw.children;
			for(var i=0; i < list.length; i++) {
				this.parent.appendChild(list[i]);
			}
		};
		
		this._copy_and_replace = function(element, item) {
			var new_e;
			
			if (element.tagName == "VALUE") {
				var prop = element.getAttribute("name");
				new_e = document.createTextNode(item[prop]);
			}
			else {
				new_e = element.cloneNode(false);
				
				var list = element.children;
				for(var i=0; i < list.length; i++) {
					var child = list[i];
					var ret = this._copy_and_replace(child, item);
					
					new_e.appendChild(ret);
				}
			}
			
			return new_e;
		}
		
		this.draw_array = function(list) {
			list.forEach((e) => {this.draw(e);});
		};
		
		this.fill = function(list) {
			this.parent.innerHTML = "";
			this.draw_array(list);
		};
		
		this.init(element);
	},

	Ajax: function(element) {
		this.url = undefined;
		this.onload = undefined;
		this.content_type = undefined;
		this.type = "GET";
		this.sync = false;
		
		this.init = function(element) {
			this.url = element.getAttribute("url");
			
			if (element.getAttribute("GET") != null) {
				this.type = "GET";
			}
			else if (element.getAttribute("POST") != null) {
				this.type = "POST";
			}
			
			if (element.getAttribute("sync") != null) {
				this.sync = true;
			}
			else if (element.getAttribute("async") != null) {
				this.sync = false;
			}
			
			if (element.getAttribute("type")) {
				this.content_type = element.getAttribute("type");
			}
			
			if (element.getAttribute("for")) {
				this.onload = function(request) {
					var target = element.getAttribute("for");
					hjax.get_drawer(target).fill(request);
				};
			}
		};
		
		this.send = function(parameters) {
			var xhttp = new XMLHttpRequest();
			
			var self = this;
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					var resp = self.parser(this.responseText);
					if (self.onload) {
						self.onload(resp);
					}
				}
			};
			
			xhttp.open(this.type, this.url, !this.sync);
			
			if (this.content_type)
				xhttp.setRequestHeader('Content-Type', this.content_type);
			
			xhttp.send(parameters);
		};
		
		// can override
		this.parser = function(request) {
			return JSON.parse(request);
		};
		
		this.init(element);
	}
};

window.onload = function() {
	hjax.init();
};
