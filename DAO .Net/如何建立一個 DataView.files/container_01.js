/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.2.1
*/
/**
* Config is a utility used within an Object to allow the implementer to maintain a list of local configuration properties and listen for changes to those properties dynamically using CustomEvent. The initial values are also maintained so that the configuration can be reset at any given point to its initial state.
* @namespace YAHOO.util
* @class Config
* @constructor
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config = function(owner) {
	if (owner) {
		this.init(owner);
	}
};

/**
 * Constant representing the CustomEvent type for the config changed event.
 * @property YAHOO.util.Config.CONFIG_CHANGED_EVENT
 * @private
 * @static
 * @final
 */
YAHOO.util.Config.CONFIG_CHANGED_EVENT = "configChanged";

/**
 * Constant representing the boolean type string
 * @property YAHOO.util.Config.BOOLEAN_TYPE
 * @private
 * @static
 * @final
 */
YAHOO.util.Config.BOOLEAN_TYPE = "boolean";

YAHOO.util.Config.prototype = {
	
	/**
	* Object reference to the owner of this Config Object
	* @property owner
	* @type Object
	*/
	owner : null,

	/**
	* Boolean flag that specifies whether a queue is currently being executed
	* @property queueInProgress
	* @type Boolean
	*/
	queueInProgress : false,

	/**
	* Maintains the local collection of configuration property objects and their specified values
	* @property config
	* @private
	* @type Object
	*/ 
	config : null,

	/**
	* Maintains the local collection of configuration property objects as they were initially applied.
	* This object is used when resetting a property.
	* @property initialConfig
	* @private
	* @type Object
	*/ 
	initialConfig : null,

	/**
	* Maintains the local, normalized CustomEvent queue
	* @property eventQueue
	* @private
	* @type Object
	*/ 
	eventQueue : null,

	/**
	* Custom Event, notifying subscribers when Config properties are set (setProperty is called without the silent flag
	* @event configChangedEvent
	*/
	configChangedEvent : null,

	/**
	* Validates that the value passed in is a Boolean.
	* @method checkBoolean
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/	
	checkBoolean: function(val) {
		return (typeof val == YAHOO.util.Config.BOOLEAN_TYPE);
	},

	/**
	* Validates that the value passed in is a number.
	* @method checkNumber
	* @param	{Object}	val	The value to validate
	* @return	{Boolean}	true, if the value is valid
	*/
	checkNumber: function(val) {
		return (!isNaN(val));
	},

	/**
	* Fires a configuration property event using the specified value. 
	* @method fireEvent
	* @private
	* @param {String}	key			The configuration property's name
	* @param {value}	Object		The value of the correct type for the property
	*/ 
	fireEvent : function( key, value ) {
		var property = this.config[key];

		if (property && property.event) {
			property.event.fire(value);
		}	
	},

	/**
	* Adds a property to the Config Object's private config hash.
	* @method addProperty
	* @param {String}	key	The configuration property's name
	* @param {Object}	propertyObject	The Object containing all of this property's arguments
	*/
	addProperty : function( key, propertyObject ) {
		key = key.toLowerCase();

		this.config[key] = propertyObject;

		propertyObject.event = new YAHOO.util.CustomEvent(key, this.owner);
		propertyObject.key = key;

		if (propertyObject.handler) {
			propertyObject.event.subscribe(propertyObject.handler, this.owner);
		}

		this.setProperty(key, propertyObject.value, true);
		
		if (! propertyObject.suppressEvent) {
			this.queueProperty(key, propertyObject.value);
		}
		
	},

	/**
	* Returns a key-value configuration map of the values currently set in the Config Object.
	* @method getConfig
	* @return {Object} The current config, represented in a key-value map
	*/
	getConfig : function() {
		var cfg = {};
			
		for (var prop in this.config) {
			var property = this.config[prop];
			if (property && property.event) {
				cfg[prop] = property.value;
			}
		}
		
		return cfg;
	},

	/**
	* Returns the value of specified property.
	* @method getProperty
	* @param {String} key	The name of the property
	* @return {Object}		The value of the specified property
	*/
	getProperty : function(key) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			return property.value;
		} else {
			return undefined;
		}
	},

	/**
	* Resets the specified property's value to its initial value.
	* @method resetProperty
	* @param {String} key	The name of the property
	* @return {Boolean} True is the property was reset, false if not
	*/
	resetProperty : function(key) {
		key = key.toLowerCase();

		var property = this.config[key];
		if (property && property.event) {
			if (this.initialConfig[key] && !YAHOO.lang.isUndefined(this.initialConfig[key]))	{
				this.setProperty(key, this.initialConfig[key]);
			}
			return true;
		} else {
			return false;
		}
	},

	/**
	* Sets the value of a property. If the silent property is passed as true, the property's event will not be fired.
	* @method setProperty
	* @param {String} key		The name of the property
	* @param {String} value		The value to set the property to
	* @param {Boolean} silent	Whether the value should be set silently, without firing the property event.
	* @return {Boolean}			True, if the set was successful, false if it failed.
	*/
	setProperty : function(key, value, silent) {
		key = key.toLowerCase();

		if (this.queueInProgress && ! silent) {
			this.queueProperty(key,value); // Currently running through a queue... 
			return true;
		} else {
			var property = this.config[key];
			if (property && property.event) {
				if (property.validator && ! property.validator(value)) { // validator
					return false;
				} else {
					property.value = value;
					if (! silent) {
						this.fireEvent(key, value);
						this.configChangedEvent.fire([key, value]);
					}
					return true;
				}
			} else {
				return false;
			}
		}
	},

	/**
	* Sets the value of a property and queues its event to execute. If the event is already scheduled to execute, it is
	* moved from its current position to the end of the queue.
	* @method queueProperty
	* @param {String} key	The name of the property
	* @param {String} value	The value to set the property to
	* @return {Boolean}		true, if the set was successful, false if it failed.
	*/	
	queueProperty : function(key, value) {
		key = key.toLowerCase();

		var property = this.config[key];
							
		if (property && property.event) {
			if (!YAHOO.lang.isUndefined(value) && property.validator && ! property.validator(value)) { // validator
				return false;
			} else {

				if (!YAHOO.lang.isUndefined(value)) {
					property.value = value;
				} else {
					value = property.value;
				}

				var foundDuplicate = false;
				var iLen = this.eventQueue.length;
				for (var i=0; i < iLen; i++) {
					var queueItem = this.eventQueue[i];

					if (queueItem) {
						var queueItemKey = queueItem[0];
						var queueItemValue = queueItem[1];
						
						if (queueItemKey == key) {
							// found a dupe... push to end of queue, null current item, and break
							this.eventQueue[i] = null;
							this.eventQueue.push([key, (!YAHOO.lang.isUndefined(value) ? value : queueItemValue)]);
							foundDuplicate = true;
							break;
						}
					}
				}
				
				if (! foundDuplicate && !YAHOO.lang.isUndefined(value)) { // this is a refire, or a new property in the queue
					this.eventQueue.push([key, value]);
				}
			}

			if (property.supercedes) {
				var sLen = property.supercedes.length;
				for (var s=0; s < sLen; s++) {
					var supercedesCheck = property.supercedes[s];
					var qLen = this.eventQueue.length;
					for (var q=0; q < qLen; q++) {
						var queueItemCheck = this.eventQueue[q];

						if (queueItemCheck) {
							var queueItemCheckKey = queueItemCheck[0];
							var queueItemCheckValue = queueItemCheck[1];
							
							if ( queueItemCheckKey == supercedesCheck.toLowerCase() ) {
								this.eventQueue.push([queueItemCheckKey, queueItemCheckValue]);
								this.eventQueue[q] = null;
								break;
							}
						}
					}
				}
			}

			return true;
		} else {
			return false;
		}
	},

	/**
	* Fires the event for a property using the property's current value.
	* @method refireEvent
	* @param {String} key	The name of the property
	*/
	refireEvent : function(key) {
		key = key.toLowerCase();

		var property = this.config[key];
		if (property && property.event && !YAHOO.lang.isUndefined(property.value)) {
			if (this.queueInProgress) {
				this.queueProperty(key);
			} else {
				this.fireEvent(key, property.value);
			}
		}
	},

	/**
	* Applies a key-value Object literal to the configuration, replacing any existing values, and queueing the property events.
	* Although the values will be set, fireQueue() must be called for their associated events to execute.
	* @method applyConfig
	* @param {Object}	userConfig	The configuration Object literal
	* @param {Boolean}	init		When set to true, the initialConfig will be set to the userConfig passed in, so that calling a reset will reset the properties to the passed values.
	*/
	applyConfig : function(userConfig, init) {
		if (init) {
			this.initialConfig = userConfig;
		}
		for (var prop in userConfig) {
		  //alert(prop + ":" + userConfig);
			this.queueProperty(prop, userConfig[prop]);
		}
	},

	/**
	* Refires the events for all configuration properties using their current values.
	* @method refresh
	*/
	refresh : function() {
		for (var prop in this.config) {
			this.refireEvent(prop);
		}
	},

	/**
	* Fires the normalized list of queued property change events
	* @method fireQueue
	*/
	fireQueue : function() {
		this.queueInProgress = true;
		for (var i=0;i<this.eventQueue.length;i++) {
			var queueItem = this.eventQueue[i];
			if (queueItem) {
				var key = queueItem[0];
				var value = queueItem[1];
				
				var property = this.config[key];
				property.value = value;

				this.fireEvent(key,value);
			}
		}
		
		this.queueInProgress = false;
		this.eventQueue = [];
	},

	/**
	* Subscribes an external handler to the change event for any given property. 
	* @method subscribeToConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @param {Boolean}	override	Optional. If true, will override "this" within the handler to map to the scope Object passed into the method.
	* @return {Boolean}				True, if the subscription was successful, otherwise false.
	*/	
	subscribeToConfigEvent : function(key, handler, obj, override) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			if (! YAHOO.util.Config.alreadySubscribed(property.event, handler, obj)) {
				property.event.subscribe(handler, obj, override);
			}
			return true;
		} else {
			return false;
		}
	},

	/**
	* Unsubscribes an external handler from the change event for any given property. 
	* @method unsubscribeFromConfigEvent
	* @param {String}	key			The property name
	* @param {Function}	handler		The handler function to use subscribe to the property's event
	* @param {Object}	obj			The Object to use for scoping the event handler (see CustomEvent documentation)
	* @return {Boolean}				True, if the unsubscription was successful, otherwise false.
	*/
	unsubscribeFromConfigEvent : function(key, handler, obj) {
		var property = this.config[key.toLowerCase()];
		if (property && property.event) {
			return property.event.unsubscribe(handler, obj);
		} else {
			return false;
		}
	},

	/**
	* Returns a string representation of the Config object
	* @method toString
	* @return {String}	The Config object in string format.
	*/
	toString : function() {
		var output = "Config";
		if (this.owner) {
			output += " [" + this.owner.toString() + "]";
		}
		return output;
	},

	/**
	* Returns a string representation of the Config object's current CustomEvent queue
	* @method outputEventQueue
	* @return {String}	The string list of CustomEvents currently queued for execution
	*/
	outputEventQueue : function() {
		var output = "";
		for (var q=0;q<this.eventQueue.length;q++) {
			var queueItem = this.eventQueue[q];
			if (queueItem) {
				output += queueItem[0] + "=" + queueItem[1] + ", ";
			}
		}
		return output;
	}
};


/**
* Initializes the configuration Object and all of its local members.
* @method init
* @param {Object}	owner	The owner Object to which this Config Object belongs
*/
YAHOO.util.Config.prototype.init = function(owner) {
	this.owner = owner;
	this.configChangedEvent = new YAHOO.util.CustomEvent(YAHOO.util.CONFIG_CHANGED_EVENT, this);
	this.queueInProgress = false;
	this.config = {};
	this.initialConfig = {};
	this.eventQueue = [];
};

/**
* Checks to determine if a particular function/Object pair are already subscribed to the specified CustomEvent
* @method YAHOO.util.Config.alreadySubscribed
* @static
* @param {YAHOO.util.CustomEvent} evt	The CustomEvent for which to check the subscriptions
* @param {Function}	fn	The function to look for in the subscribers list
* @param {Object}	obj	The execution scope Object for the subscription
* @return {Boolean}	true, if the function/Object pair is already subscribed to the CustomEvent passed in
*/
YAHOO.util.Config.alreadySubscribed = function(evt, fn, obj) {
	for (var e=0;e<evt.subscribers.length;e++) {
		var subsc = evt.subscribers[e];
		if (subsc && subsc.obj == obj && subsc.fn == fn) {
			return true;
		}
	}
	return false;
};
/**
*  The Container family of components is designed to enable developers to create different kinds of content-containing modules on the web. Module and Overlay are the most basic containers, and they can be used directly or extended to build custom containers. Also part of the Container family are four UI controls that extend Module and Overlay: Tooltip, Panel, Dialog, and SimpleDialog.
* @module container
* @title Container
* @requires yahoo,dom,event,dragdrop,animation
*/

/**
* Module is a JavaScript representation of the Standard Module Format. Standard Module Format is a simple standard for markup containers where child nodes representing the header, body, and footer of the content are denoted using the CSS classes "hd", "bd", and "ft" respectively. Module is the base class for all other classes in the YUI Container package.
* @namespace YAHOO.widget
* @class Module
* @constructor
* @param {String} el			The element ID representing the Module <em>OR</em>
* @param {HTMLElement} el		The element representing the Module
* @param {Object} userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
*/
//2007/05/14 chingwei (+) ??????icon?????????????????????widget??????
YAHOO.widget.Module = function(el, userConfig, icon) {
	if (el) {
		this.init(el, userConfig, icon);
	} else {
	}
};

/**
* Constant representing the prefix path to use for non-secure images
* @property YAHOO.widget.Module.IMG_ROOT
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT = null;

/**
* Constant representing the prefix path to use for securely served images
* @property YAHOO.widget.Module.IMG_ROOT_SSL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.IMG_ROOT_SSL = null;

/**
* Constant for the default CSS class name that represents a Module
* @property YAHOO.widget.Module.CSS_MODULE
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_MODULE = "yui-module";

/**
* Constant representing the module header
* @property YAHOO.widget.Module.CSS_HEADER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_HEADER = "hd";

//2007/4/16 chingwei (+) ??????edit???css
YAHOO.widget.Module.CSS_EDIT = "ed";
/**
* Constant representing the module body
* @property YAHOO.widget.Module.CSS_BODY
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_BODY = "bd";

/**
* Constant representing the module footer
* @property YAHOO.widget.Module.CSS_FOOTER
* @static
* @final
* @type String
*/
YAHOO.widget.Module.CSS_FOOTER = "ft";

/**
* Constant representing the url for the "src" attribute of the iframe used to monitor changes to the browser's base font size
* @property YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL
* @static
* @final
* @type String
*/
YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL = "javascript:false;";

/**
* Singleton CustomEvent fired when the font size is changed in the browser.
* Opera's "zoom" functionality currently does not support text size detection.
* @event YAHOO.widget.Module.textResizeEvent
*/
YAHOO.widget.Module.textResizeEvent = new YAHOO.util.CustomEvent("textResize");

/**
* Constant representing the name of the Module's events
* @property YAHOO.widget.Module._EVENT_TYPES
* @private
* @final
* @type Object
*/

// 2007/4/16 chingwei (+) ??????show and hide EDIT(???????????????event??????????????????)
YAHOO.widget.Module._EVENT_TYPES = {

    "BEFORE_INIT": "beforeInit",
    "INIT": "init",
    "APPEND": "append",
    "BEFORE_RENDER": "beforeRender",
    "RENDER": "render",
    "CHANGE_HEADER": "changeHeader",
    "CHANGE_BODY": "changeBody",
    "CHANGE_FOOTER": "changeFooter",
    "CHANGE_CONTENT": "changeContent",
    "DESTORY": "destroy",
    "BEFORE_SHOW": "beforeShow",
    "SHOW": "show",
    "BEFORE_HIDE": "beforeHide",
    "HIDE": "hide",
    "SHOW_EDIT": "showEdit",
    "HIDE_EDIT": "hideEdit"
};
    
/**
* Constant representing the Module's configuration properties
* @property YAHOO.widget.Module._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Module._DEFAULT_CONFIG = {

    "VISIBLE": { 
        key: "visible", 
        value: true, 
        validator: YAHOO.lang.isBoolean 
    },

    "EFFECT": { 
        key: "effect", 
        suppressEvent:true, 
        supercedes:["visible"] 
    },

    "MONITOR_RESIZE": { 
        key: "monitorresize", 
        value:true  
    }

};


YAHOO.widget.Module.prototype = {
  /**
	 * 2007/5/17
   * ??????Widget???????????????????????????
   * author : chingwei
	 */
  vars : new Array(),
  
  /**
   * 2007/5/17 (+) ???????????????
   * @method setVar
   * @param {string} key and value
   * @author chingwei
   */ 
	setVar : function(key,value) {
	  this.vars[key]=value;
	},
	
	/**
   * 2007/5/17 (+) ???????????????
   * @method getVar
   * @param {string} key
   * @author chingwei
   */ 
	getVar : function(key) {
	  return this.vars[key];
	}	,
	
	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.Module,

	/**
	* The main module element that contains the header, body, and footer
	* @property element
	* @type HTMLElement
	*/
	element : null,

	/**
	* The header element, denoted with CSS class "hd"
	* @property header
	* @type HTMLElement
	*/
	header : null,

	edit : null,	// 2007/04/16 chingwei (+) BGN ??????EDIT??????

	/**
	* The body element, denoted with CSS class "bd"
	* @property body
	* @type HTMLElement
	*/
	body : null,

	/**
	* The footer element, denoted with CSS class "ft"
	* @property footer
	* @type HTMLElement
	*/
	footer : null,

	/**
	* The id of the element
	* @property id
	* @type String
	*/
	id : null,

	/**
	* The String representing the image root
	* @property imageRoot
	* @type String
	*/
	imageRoot : YAHOO.widget.Module.IMG_ROOT,
	
	// chingwei (+) ???????????????
	widgetIcon : null,
	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	* @method initEvents
	*/
	initEvents : function() {

        var EVENT_TYPES = YAHOO.widget.Module._EVENT_TYPES;

		/**
		* CustomEvent fired prior to class initalization.
		* @event beforeInitEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/
		this.beforeInitEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_INIT, this);

		/**
		* CustomEvent fired after class initalization.
		* @event initEvent
		* @param {class} classRef	class reference of the initializing class, such as this.beforeInitEvent.fire(YAHOO.widget.Module)
		*/		
		this.initEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.INIT, this);

		/**
		* CustomEvent fired when the Module is appended to the DOM
		* @event appendEvent
		*/
		this.appendEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.APPEND, this);

		/**
		* CustomEvent fired before the Module is rendered
		* @event beforeRenderEvent
		*/
		this.beforeRenderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_RENDER, this);

		/**
		* CustomEvent fired after the Module is rendered
		* @event renderEvent
		*/
		this.renderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.RENDER, this);
	
		/**
		* CustomEvent fired when the header content of the Module is modified
		* @event changeHeaderEvent
		* @param {String/HTMLElement} content	String/element representing the new header content
		*/
		this.changeHeaderEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_HEADER, this);
		
		/**
		* CustomEvent fired when the body content of the Module is modified
		* @event changeBodyEvent
		* @param {String/HTMLElement} content	String/element representing the new body content
		*/		
		this.changeBodyEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_BODY, this);
		
		/**
		* CustomEvent fired when the footer content of the Module is modified
		* @event changeFooterEvent
		* @param {String/HTMLElement} content	String/element representing the new footer content
		*/
		this.changeFooterEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_FOOTER, this);

		/**
		* CustomEvent fired when the content of the Module is modified
		* @event changeContentEvent
		*/
		this.changeContentEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.CHANGE_CONTENT, this);

		/**
		* CustomEvent fired when the Module is destroyed
		* @event destroyEvent
		*/
		this.destroyEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.DESTORY, this);
		
		/**
		* CustomEvent fired before the Module is shown
		* @event beforeShowEvent
		*/
		this.beforeShowEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_SHOW, this);

		/**
		* CustomEvent fired after the Module is shown
		* @event showEvent
		*/
		this.showEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.SHOW, this);

		/**
		* CustomEvent fired before the Module is hidden
		* @event beforeHideEvent
		*/
		this.beforeHideEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_HIDE, this);

		/**
		* CustomEvent fired after the Module is hidden
		* @event hideEvent
		*/
		this.hideEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.HIDE, this);
	}, 

	/**
	* String representing the current user-agent platform
	* @property platform
	* @type String
	*/
	platform : function() {
					var ua = navigator.userAgent.toLowerCase();
					if (ua.indexOf("windows") != -1 || ua.indexOf("win32") != -1) {
						return "windows";
					} else if (ua.indexOf("macintosh") != -1) {
						return "mac";
					} else {
						return false;
					}
				}(),

	/**
	* String representing the current user-agent browser
	* @property browser
	* @type String
	*/
	browser : function() {
			var ua = navigator.userAgent.toLowerCase();
				  if (ua.indexOf('opera')!=-1) { // Opera (check first in case of spoof)
					 return 'opera';
				  } else if (ua.indexOf('msie 7')!=-1) { // IE7
					 return 'ie7';
				  } else if (ua.indexOf('msie') !=-1) { // IE
					 return 'ie';
				  } else if (ua.indexOf('safari')!=-1) { // Safari (check before Gecko because it includes "like Gecko")
					 return 'safari';
				  } else if (ua.indexOf('gecko') != -1) { // Gecko
					 return 'gecko';
				  } else {
					 return false;
				  }
			}(),

	/**
	* Boolean representing whether or not the current browsing context is secure (https)
	* @property isSecure
	* @type Boolean
	*/
	isSecure : function() {
		if (window.location.href.toLowerCase().indexOf("https") === 0) {
			return true;
		} else {
			return false;
		}
	}(),

	/**
	* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
	*/
	initDefaultConfig : function() {
		// Add properties //

    	var DEFAULT_CONFIG = YAHOO.widget.Module._DEFAULT_CONFIG;

		/**
		* Specifies whether the Module is visible on the page.
		* @config visible
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty(
		          DEFAULT_CONFIG.VISIBLE.key, 
		          {
		              handler: this.configVisible, 
		              value: DEFAULT_CONFIG.VISIBLE.value, 
		              validator: DEFAULT_CONFIG.VISIBLE.validator
                  }
              );

		/**
		* Object or array of objects representing the ContainerEffect classes that are active for animating the container.
		* @config effect
		* @type Object
		* @default null
		*/
		this.cfg.addProperty(
                    DEFAULT_CONFIG.EFFECT.key, 
                    {
                        suppressEvent: DEFAULT_CONFIG.EFFECT.suppressEvent, 
                        supercedes: DEFAULT_CONFIG.EFFECT.supercedes
                    }
                );

		/**
		* Specifies whether to create a special proxy iframe to monitor for user font resizing in the document
		* @config monitorresize
		* @type Boolean
		* @default true
		*/
		this.cfg.addProperty(
		          DEFAULT_CONFIG.MONITOR_RESIZE.key,
		          {
		              handler: this.configMonitorResize,
		              value: DEFAULT_CONFIG.MONITOR_RESIZE.value
                  }
              );
		
	},

	/**
	* The Module class's initialization method, which is executed for Module and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
	* @method init
	* @param {String}	el	The element ID representing the Module <em>OR</em>
	* @param {HTMLElement}	el	The element representing the Module
	* @param {Object}	userConfig	The configuration Object literal containing the configuration that should be set for this module. See configuration documentation for more details.
	*/
	//init : function(el, userConfig) {
  init : function(el, userConfig, icon) {	  
    //chingwei widgetIcon
    this.widgetIcon = icon;
		this.initEvents();

		this.beforeInitEvent.fire(YAHOO.widget.Module);

		/**
		* The Module's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);

		if (this.isSecure) {
			this.imageRoot = YAHOO.widget.Module.IMG_ROOT_SSL;
		}

		if (typeof el == "string") {
			var elId = el;

			el = document.getElementById(el);
			if (! el) {
				el = document.createElement("div");
				el.id = elId;
			}
		}

		this.element = el;

		if (el.id) {
			this.id = el.id;
		}

		var childNodes = this.element.childNodes;

		if (childNodes) {
			for (var i=0;i<childNodes.length;i++) {
				var child = childNodes[i];
				switch (child.className) {
					case YAHOO.widget.Module.CSS_HEADER:
						this.header = child;
						break;
					case YAHOO.widget.Module.CSS_EDIT:
						this.edit = child;
						break;
					case YAHOO.widget.Module.CSS_BODY:
						this.body = child;
						break;
					case YAHOO.widget.Module.CSS_FOOTER:
						this.footer = child;
						break;
					
				}
			}
		}

		this.initDefaultConfig();

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Module.CSS_MODULE);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}

		// Subscribe to the fireQueue() method of Config so that any queued configuration changes are
		// excecuted upon render of the Module
		if (! YAHOO.util.Config.alreadySubscribed(this.renderEvent, this.cfg.fireQueue, this.cfg)) {
			this.renderEvent.subscribe(this.cfg.fireQueue, this.cfg, true);
		}

		this.initEvent.fire(YAHOO.widget.Module);
	},

	/**
	* Initialized an empty IFRAME that is placed out of the visible area that can be used to detect text resize.
	* @method initResizeMonitor
	*/
	initResizeMonitor : function() {

        if(this.browser != "opera") {

            var resizeMonitor = document.getElementById("_yuiResizeMonitor");

            if (! resizeMonitor) {

                resizeMonitor = document.createElement("iframe");

                var bIE = (this.browser.indexOf("ie") === 0);

                if(this.isSecure && YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL && bIE) {
                   resizeMonitor.src = YAHOO.widget.Module.RESIZE_MONITOR_SECURE_URL;
                }

                resizeMonitor.id = "_yuiResizeMonitor";
                resizeMonitor.style.visibility = "hidden";

                document.body.appendChild(resizeMonitor);

                resizeMonitor.style.width = "10em";
                resizeMonitor.style.height = "10em";
                resizeMonitor.style.position = "absolute";

                var nLeft = -1 * resizeMonitor.offsetWidth;
                var nTop = -1 * resizeMonitor.offsetHeight;

                resizeMonitor.style.top = nTop + "px";
                resizeMonitor.style.left = nLeft + "px";
                resizeMonitor.style.borderStyle = "none";
                resizeMonitor.style.borderWidth = "0";
                YAHOO.util.Dom.setStyle(resizeMonitor, "opacity", "0");

                resizeMonitor.style.visibility = "visible";

                if(!bIE) {

                    var doc = resizeMonitor.contentWindow.document;

                    doc.open();
                    doc.close();

                }
            }

			var fireTextResize = function() {
				YAHOO.widget.Module.textResizeEvent.fire();
			};

            if(resizeMonitor && resizeMonitor.contentWindow) {
                this.resizeMonitor = resizeMonitor;

				YAHOO.widget.Module.textResizeEvent.subscribe(this.onDomResize, this, true);

				if (! YAHOO.widget.Module.textResizeInitialized) {
					if (! YAHOO.util.Event.addListener(this.resizeMonitor.contentWindow, "resize", fireTextResize)) {
						// This will fail in IE if document.domain has changed, so we must change the listener to
						// use the resizeMonitor element instead
						YAHOO.util.Event.addListener(this.resizeMonitor, "resize", fireTextResize);
					}
					YAHOO.widget.Module.textResizeInitialized = true;
				}
            }

        }

	},

	/**
	* Event handler fired when the resize monitor element is resized.
	* @method onDomResize
	* @param {DOMEvent} e	The DOM resize event
	* @param {Object} obj	The scope object passed to the handler
	*/
	onDomResize : function(e, obj) {

        var nLeft = -1 * this.resizeMonitor.offsetWidth,
            nTop = -1 * this.resizeMonitor.offsetHeight;

        this.resizeMonitor.style.top = nTop + "px";
        this.resizeMonitor.style.left =  nLeft + "px";

	},

	/**
	* Sets the Module's header content to the HTML specified, or appends the passed element to the header. If no header is present, one will be automatically created.
	* @method setHeader
	* @param {String}	headerContent	The HTML used to set the header <em>OR</em>
	* @param {HTMLElement}	headerContent	The HTMLElement to append to the header
	*/
	setHeader : function(headerContent) {
		if (! this.header) {
			this.header = document.createElement("div");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}

		if (typeof headerContent == "string") {
			this.header.innerHTML = headerContent;
		} else {
			this.header.innerHTML = "";
			this.header.appendChild(headerContent);
		}
		
		this.changeHeaderEvent.fire(headerContent);
		this.changeContentEvent.fire();

	},

	/**
	* Appends the passed element to the header. If no header is present, one will be automatically created.
	* @method appendToHeader
	* @param {HTMLElement}	element	The element to append to the header
	*/
	appendToHeader : function(element) {
		if (! this.header) {
			this.header = document.createElement("div");
			this.header.className = YAHOO.widget.Module.CSS_HEADER;
		}

		this.header.appendChild(element);
		this.changeHeaderEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's body content to the HTML specified, or appends the passed element to the body. If no body is present, one will be automatically created.
	* @method setBody
	* @param {String}	bodyContent	The HTML used to set the body <em>OR</em>
	* @param {HTMLElement}	bodyContent	The HTMLElement to append to the body
	*/
	setBody : function(bodyContent) {
		if (! this.body) {
			this.body = document.createElement("div");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		if (typeof bodyContent == "string")
		{
			this.body.innerHTML = bodyContent;
		} else {
			this.body.innerHTML = "";
			this.body.appendChild(bodyContent);
		}

		//this.changeBodyEvent.fire(bodyContent);
		//this.changeContentEvent.fire();
	},

	// 2007/04/16 chingwei (+) BGN ??????EDIT??????
	setEdit : function(editContent) {
		if (! this.edit) {
			this.edit = document.createElement("div");
			this.edit.className = YAHOO.widget.Module.CSS_EDIT;
		}
    YAHOO.util.Dom.setStyle(this.edit, "display", "none"); //wesley:??????????????????EDIT??????
		if (typeof editContent == "string")
		{
			this.edit.innerHTML = editContent;
		} else {
			this.edit.innerHTML = "";
			this.edit.appendChild(editContent);
		}

		this.changeBodyEvent.fire(editContent);
		//this.changeContentEvent.fire();
		
		
		
	},
    // 2007/04/16 chingwei (+) END ??????EDIT??????	
	
	/**
	* Appends the passed element to the body. If no body is present, one will be automatically created.
	* @method appendToBody
	* @param {HTMLElement}	element	The element to append to the body
	*/
	appendToBody : function(element) {
		if (! this.body) {
			this.body = document.createElement("div");
			this.body.className = YAHOO.widget.Module.CSS_BODY;
		}

		this.body.appendChild(element);
		this.changeBodyEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Sets the Module's footer content to the HTML specified, or appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method setFooter
	* @param {String}	footerContent	The HTML used to set the footer <em>OR</em>
	* @param {HTMLElement}	footerContent	The HTMLElement to append to the footer
	*/
	setFooter : function(footerContent) {
		if (! this.footer) {
			this.footer = document.createElement("div");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		if (typeof footerContent == "string") {
			this.footer.innerHTML = footerContent;
		} else {
			this.footer.innerHTML = "";
			this.footer.appendChild(footerContent);
		}

		this.changeFooterEvent.fire(footerContent);
		this.changeContentEvent.fire();
	},

	/**
	* Appends the passed element to the footer. If no footer is present, one will be automatically created.
	* @method appendToFooter
	* @param {HTMLElement}	element	The element to append to the footer
	*/
	appendToFooter : function(element) {
		if (! this.footer) {
			this.footer = document.createElement("div");
			this.footer.className = YAHOO.widget.Module.CSS_FOOTER;
		}

		this.footer.appendChild(element);
		this.changeFooterEvent.fire(element);
		this.changeContentEvent.fire();
	},

	/**
	* Renders the Module by inserting the elements that are not already in the main Module into their correct places. Optionally appends the Module to the specified node prior to the render's execution. NOTE: For Modules without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
	* @method render
	* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
	* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering
	* @param {HTMLElement}	moduleElement	OPTIONAL. The element that represents the actual Standard Module container.
	* @return {Boolean} Success or failure of the render
	*/
	render : function(appendToNode, moduleElement) {
		this.beforeRenderEvent.fire();

		if (! moduleElement) {
			moduleElement = this.element;
		}

		var me = this;
		var appendTo = function(element) {
			if (typeof element == "string") {
				element = document.getElementById(element);
			}

			if (element) {
				element.appendChild(me.element);
				me.appendEvent.fire();
			}
		};

		if (appendToNode) {
			appendTo(appendToNode);
		} else { // No node was passed in. If the element is not pre-marked up, this fails
			if (! YAHOO.util.Dom.inDocument(this.element)) {
				return false;
			}
		}

		// Need to get everything into the DOM if it isn't already
		if (this.header && ! YAHOO.util.Dom.inDocument(this.header)) {
			// There is a header, but it's not in the DOM yet... need to add it
			var firstChild = moduleElement.firstChild;
			if (firstChild) { // Insert before first child if exists
				moduleElement.insertBefore(this.header, firstChild);
			} else { // Append to empty body because there are no children
				moduleElement.appendChild(this.header);
			}
		}

		// 2007/04/16 chingwei (+) BGN ??????EDIT??????
		if (this.edit && ! YAHOO.util.Dom.inDocument(this.edit)) {
			if (this.body && YAHOO.util.Dom.isAncestor(this.moduleElement, this.body)) { 
				moduleElement.insertBefore(this.edit, this.body);
			} else { 
				moduleElement.appendChild(this.edit);
			}
		}
		// 2007/04/16 chingwei (+) BGN ??????EDIT??????

		if (this.body && ! YAHOO.util.Dom.inDocument(this.body)) {
			// There is a body, but it's not in the DOM yet... need to add it
			if (this.footer && YAHOO.util.Dom.isAncestor(this.moduleElement, this.footer)) { // Insert before footer if exists in DOM
				moduleElement.insertBefore(this.body, this.footer);
			} else { // Append to element because there is no footer
				moduleElement.appendChild(this.body);
			}
		}

		if (this.footer && ! YAHOO.util.Dom.inDocument(this.footer)) {
			// There is a footer, but it's not in the DOM yet... need to add it
			moduleElement.appendChild(this.footer);
		}

    
    //2007/5/14 chingwei(+) ??????Header???????????????

/**wesley: ????????????
		var hideEditObj = document.createElement("img");
		hideEditObj.id = 'hideEdit';
		hideEditObj.src = 'img/expand.gif';
		//hideEditObj.onClick = 'test()';
		this.header.appendChild(hideEditObj);
*/    
  if(this.widgetIcon != undefined){  
    var showEditObj = document.createElement("img");
		showEditObj.id = this.id+'_showEdit'; //wesley:?????????id??????,????????????module???id(this.id).
		showEditObj.src = 'img/s.gif';
		showEditObj.className='icon widget-settings';

    var showEditDiv = document.createElement("div");
    showEditDiv.className='header-icons';
    showEditDiv.appendChild(showEditObj);

		var expandObj = document.createElement("img");
		expandObj.id = this.id+'_expand'; //wesley:?????????id??????,????????????module???id(this.id).
		expandObj.src = 'img/s.gif';
		expandObj.className='icon widget-collapse';

    var expandDiv = document.createElement("div");
    expandDiv.className='header-icons';
    expandDiv.appendChild(expandObj);

		var destroyObj = document.createElement("img");
		destroyObj.id = this.id+'_destroy'; //wesley:?????????id??????,????????????module???id(this.id).
		destroyObj.src = 'img/s.gif';
		destroyObj.className='icon widget-destroy';

    var destroyDiv = document.createElement("div");
    destroyDiv.className='header-icons';
    destroyDiv.appendChild(destroyObj);

		var iconObj = document.createElement("img");
		iconObj.id = this.id+'_icon'; //wesley:?????????id??????,????????????module???id(this.id).
		iconObj.src = this.widgetIcon;
		//iconObj.className='icon widget-destroy';

    var iconDiv = document.createElement("div");
    iconDiv.className='widget-icons';
    iconDiv.appendChild(iconObj);
    
    var firstChild = moduleElement.firstChild;
    moduleElement.insertBefore(iconDiv,firstChild);
    moduleElement.insertBefore(destroyDiv,firstChild);
    moduleElement.insertBefore(expandDiv,firstChild);
    moduleElement.insertBefore(showEditDiv,firstChild);
    //2007/5/14 chingwei(+) ??????Header???????????????


		// wesley:???????????? BGN>>
		YAHOO.util.Event.addListener(showEditObj.id, "click", this.showEdit, this, true);
		YAHOO.util.Event.addListener(expandObj.id, "click", this.expand, this, true);
		YAHOO.util.Event.addListener(destroyObj.id, "click", this.destroy, this, true);
		// wesley:???????????? END<<


    } 
		


		this.renderEvent.fire();
		return true;
	},

	/**
	* Removes the Module element from the DOM and sets all child elements to null.
	* @method destroy
	*/
	destroy : function() {
		var parent;

		if (this.element) {
			YAHOO.util.Event.purgeElement(this.element, true);
			parent = this.element.parentNode;
		}
		if (parent) {
			parent.removeChild(this.element);
		}

		this.element = null;
		this.header = null;
		this.body = null;
		this.footer = null;

		for (var e in this) {
			if (e instanceof YAHOO.util.CustomEvent) {
				e.unsubscribeAll();
			}
		}

		YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this);

		this.destroyEvent.fire();
	},

	/**
	* Shows the Module element by setting the visible configuration property to true. Also fires two events: beforeShowEvent prior to the visibility change, and showEvent after.
	* @method show
	*/
	show : function() {
		this.cfg.setProperty("visible", true);
	},

	/**
	* Hides the Module element by setting the visible configuration property to false. Also fires two events: beforeHideEvent prior to the visibility change, and hideEvent after.
	* @method hide
	*/
	hide : function() {
		this.cfg.setProperty("visible", false);
	},
/**wesley: ????????????
	// 2007/4/16 chingwei (+) BGN ??????EDIT??????
	hideEdit : function() {
		YAHOO.util.Dom.setStyle(this.edit, "display", "none");
		//this.cfg.setProperty("visible", false);
	},
	// 2007/4/16 chingwei (+) END ??????EDIT??????
	// 2007/4/16 chingwei (+) BGN ??????EDIT??????
	showEdit : function() {
		YAHOO.util.Dom.setStyle(this.edit, "display", "block");
		//this.cfg.setProperty("visible", true);
	},
	// 2007/4/16 chingwei (+) END ??????EDIT??????
*/
	// wesley:???????????????EDIT?????? BGN>>
	showEdit : function() {
		if(YAHOO.util.Dom.getStyle(this.edit, 'display')=="none") {
		  //alert("test:"+YAHOO.util.Dom.getStyle(this.edit, 'display'));
		  YAHOO.util.Dom.setStyle(this.edit, "display", "block");
		  YAHOO.util.Dom.get(this.id+'_showEdit').src = 'img/settings.gif';
		} else {
		  //alert("test:"+YAHOO.util.Dom.getStyle(this.edit, 'display'));
		  YAHOO.util.Dom.setStyle(this.edit, "display", "none");
		  YAHOO.util.Dom.get(this.id+'_showEdit').src = 'img/settings.gif';
		}
	},
	// wesley:???????????????EDIT?????? END<<
	// wesley:???????????? BGN>>
	expand : function() {
		if(YAHOO.util.Dom.getStyle(this.body, 'display')=="none") {
		  //alert("test:"+YAHOO.util.Dom.getStyle(this.edit, 'display'));
		  //YAHOO.util.Dom.setStyle(this.edit, "display", "block");
		  YAHOO.util.Dom.setStyle(this.body, "display", "block");
		  YAHOO.util.Dom.setStyle(this.footer, "display", "block");
		  //YAHOO.util.Dom.get(this.id+'_expand').src = 'img/collapse.gif';
		  YAHOO.util.Dom.get(this.id+'_expand').className = 'icon widget-collapse';   //chingwei (+) ????????????css?????????
		} else {
		  //alert("test:"+YAHOO.util.Dom.getStyle(this.edit, 'display'));
		  YAHOO.util.Dom.setStyle(this.edit, "display", "none");
		  YAHOO.util.Dom.setStyle(this.body, "display", "none");
		  YAHOO.util.Dom.setStyle(this.footer, "display", "none");
		  //YAHOO.util.Dom.get(this.id+'_expand').src = 'img/expand.gif';
		  YAHOO.util.Dom.get(this.id+'_expand').className = 'icon widget-expand';   //chingwei (+) ????????????css?????????
		}
	},
	// wesley:???????????? END<<
	
	// BUILT-IN EVENT HANDLERS FOR MODULE //

	/**
	* Default event handler for changing the visibility property of a Module. By default, this is achieved by switching the "display" style between "block" and "none".
	* This method is responsible for firing showEvent and hideEvent.
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configVisible
	*/
	configVisible : function(type, args, obj) {
		var visible = args[0];
		if (visible) {
			this.beforeShowEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "block");
			this.showEvent.fire();
		} else {
			this.beforeHideEvent.fire();
			YAHOO.util.Dom.setStyle(this.element, "display", "none");
			this.hideEvent.fire();
		}
	},

	/**
	* Default event handler for the "monitorresize" configuration property
	* @param {String} type	The CustomEvent type (usually the property name)
	* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
	* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
	* @method configMonitorResize
	*/
	configMonitorResize : function(type, args, obj) {
		var monitor = args[0];
		if (monitor) {
			this.initResizeMonitor();
		} else {
			YAHOO.widget.Module.textResizeEvent.unsubscribe(this.onDomResize, this, true);
			this.resizeMonitor = null;
		}
	}
};

/**
* Returns a String representation of the Object.
* @method toString
* @return {String}	The string representation of the Module
*/
YAHOO.widget.Module.prototype.toString = function() {
	return "Module " + this.id;
};
/**
* Overlay is a Module that is absolutely positioned above the page flow. It has convenience methods for positioning and sizing, as well as options for controlling zIndex and constraining the Overlay's position to the current visible viewport. Overlay also contains a dynamicly generated IFRAME which is placed beneath it for Internet Explorer 6 and 5.x so that it will be properly rendered above SELECT elements.
* @namespace YAHOO.widget
* @class Overlay
* @extends YAHOO.widget.Module
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing 10/23/2006the configuration that should be set for this Overlay. See configuration documentation for more details.
* @constructor
*/
YAHOO.widget.Overlay = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Overlay, YAHOO.widget.Module);

/**
* Constant representing the name of the Overlay's events
* @property YAHOO.widget.Overlay._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Overlay._EVENT_TYPES = {

    "BEFORE_MOVE": "beforeMove",
    "MOVE": "move"

};

/**
* Constant representing the Overlay's configuration properties
* @property YAHOO.widget.Overlay._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Overlay._DEFAULT_CONFIG = {

    "X": { 
        key: "x", 
        validator:YAHOO.lang.isNumber, 
        suppressEvent:true, supercedes:["iframe"] 
    },

    "Y": { 
        key: "y", 
        validator:YAHOO.lang.isNumber, 
        suppressEvent:true, supercedes:["iframe"] 
    },

    "XY": { 
        key: "xy", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    },

    "CONTEXT": { 
        key: "context", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    },

    "FIXED_CENTER": { 
        key: "fixedcenter", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["iframe","visible"] 
    },

    "WIDTH": { 
        key: "width", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    }, 

    "HEIGHT": { 
        key: "height", 
        suppressEvent:true, 
        supercedes:["iframe"] 
    }, 

    "ZINDEX": { 
        key: "zindex", 
        value:null 
    }, 

    "CONSTRAIN_TO_VIEWPORT": { 
        key: "constraintoviewport", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["iframe","x","y","xy"] 
    }, 

    "IFRAME": { 
        key: "iframe", 
        value:(YAHOO.widget.Module.prototype.browser == "ie" ? true : false), 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["zIndex"] 
    }

};

/**
* The URL that will be placed in the iframe
* @property YAHOO.widget.Overlay.IFRAME_SRC
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.IFRAME_SRC = "javascript:false;";

/**
* Constant representing the top left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_LEFT = "tl";

/**
* Constant representing the top right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.TOP_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.TOP_RIGHT = "tr";

/**
* Constant representing the top bottom left corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_LEFT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_LEFT = "bl";

/**
* Constant representing the bottom right corner of an element, used for configuring the context element alignment
* @property YAHOO.widget.Overlay.BOTTOM_RIGHT
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.BOTTOM_RIGHT = "br";

/**
* Constant representing the default CSS class used for an Overlay
* @property YAHOO.widget.Overlay.CSS_OVERLAY
* @static
* @final
* @type String
*/
YAHOO.widget.Overlay.CSS_OVERLAY = "yui-overlay";

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Overlay.prototype.init = function(el, userConfig) {
	YAHOO.widget.Overlay.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Overlay);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Overlay.CSS_OVERLAY);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	if (this.platform == "mac" && this.browser == "gecko") {
		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent,this.showMacGeckoScrollbars,this)) {
			this.showEvent.subscribe(this.showMacGeckoScrollbars,this,true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent,this.hideMacGeckoScrollbars,this)) {
			this.hideEvent.subscribe(this.hideMacGeckoScrollbars,this,true);
		}
	}

	this.initEvent.fire(YAHOO.widget.Overlay);

};

/**
* Initializes the custom events for Overlay which are fired automatically at appropriate times by the Overlay class.
* @method initEvents
*/
YAHOO.widget.Overlay.prototype.initEvents = function() {
	YAHOO.widget.Overlay.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Overlay._EVENT_TYPES;

	/**
	* CustomEvent fired before the Overlay is moved.
	* @event beforeMoveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.beforeMoveEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_MOVE, this);

	/**
	* CustomEvent fired after the Overlay is moved.
	* @event moveEvent
	* @param {Number} x	x coordinate
	* @param {Number} y	y coordinate
	*/
	this.moveEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.MOVE, this);
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Overlay.prototype.initDefaultConfig = function() {
	YAHOO.widget.Overlay.superclass.initDefaultConfig.call(this);


	// Add overlay config properties //

    var DEFAULT_CONFIG = YAHOO.widget.Overlay._DEFAULT_CONFIG;

	/**
	* The absolute x-coordinate position of the Overlay
	* @config x
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.X.key, 
	           { 
	               handler: this.configX, 
	               validator: DEFAULT_CONFIG.X.validator, 
	               suppressEvent: DEFAULT_CONFIG.X.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.X.supercedes
               }
           );

	/**
	* The absolute y-coordinate position of the Overlay
	* @config y
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.Y.key,
	           {
	               handler: this.configY, 
	               validator: DEFAULT_CONFIG.Y.validator, 
	               suppressEvent: DEFAULT_CONFIG.Y.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.Y.supercedes
               }
           );

	/**
	* An array with the absolute x and y positions of the Overlay
	* @config xy
	* @type Number[]
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.XY.key,
	           {
	               handler: this.configXY, 
	               suppressEvent: DEFAULT_CONFIG.XY.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.XY.supercedes
               }
           );

	/**
	* The array of context arguments for context-sensitive positioning. The format is: [id or element, element corner, context corner]. For example, setting this property to ["img1", "tl", "bl"] would align the Overlay's top left corner to the context element's bottom left corner.
	* @config context
	* @type Array
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.CONTEXT.key,
	           {
	               handler: this.configContext, 
	               suppressEvent: DEFAULT_CONFIG.CONTEXT.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.CONTEXT.supercedes
               }
           );

	/**
	* True if the Overlay should be anchored to the center of the viewport.
	* @config fixedcenter
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty(
               DEFAULT_CONFIG.FIXED_CENTER.key, 
               {
                    handler: this.configFixedCenter,
                    value: DEFAULT_CONFIG.FIXED_CENTER.value, 
                    validator: DEFAULT_CONFIG.FIXED_CENTER.validator, 
                    supercedes: DEFAULT_CONFIG.FIXED_CENTER.supercedes
                }
            );

	/**
	* CSS width of the Overlay.
	* @config width
	* @type String
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.WIDTH.key,
	           {
	               handler: this.configWidth, 
	               suppressEvent: DEFAULT_CONFIG.WIDTH.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.WIDTH.supercedes
               }
           );

	/**
	* CSS height of the Overlay.
	* @config height
	* @type String
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.HEIGHT.key, 
	           {
	               handler: this.configHeight, 
	               suppressEvent: DEFAULT_CONFIG.HEIGHT.suppressEvent, 
	               supercedes: DEFAULT_CONFIG.HEIGHT.supercedes
               }
           );

	/**
	* CSS z-index of the Overlay.
	* @config zIndex
	* @type Number
	* @default null
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.ZINDEX.key, 
	           {
	               handler: this.configzIndex,
	               value: DEFAULT_CONFIG.ZINDEX.value
               }
           );

	/**
	* True if the Overlay should be prevented from being positioned out of the viewport.
	* @config constraintoviewport
	* @type Boolean
	* @default false
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.key, 
	           {
	               handler: this.configConstrainToViewport, 
	               value: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.value, 
	               validator: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.validator, 
	               supercedes: DEFAULT_CONFIG.CONSTRAIN_TO_VIEWPORT.supercedes
               }
           );

	/**
	* True if the Overlay should have an IFRAME shim (for correcting the select z-index bug in IE6 and below).
	* @config iframe
	* @type Boolean
	* @default true for IE6 and below, false for all others
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.IFRAME.key, 
	           {
	               handler: this.configIframe, 
	               value: DEFAULT_CONFIG.IFRAME.value, 
	               validator: DEFAULT_CONFIG.IFRAME.validator, 
	               supercedes: DEFAULT_CONFIG.IFRAME.supercedes
	           }
           );

};

/**
* Moves the Overlay to the specified position. This function is identical to calling this.cfg.setProperty("xy", [x,y]);
* @method moveTo
* @param {Number}	x	The Overlay's new x position
* @param {Number}	y	The Overlay's new y position
*/
YAHOO.widget.Overlay.prototype.moveTo = function(x, y) {
	this.cfg.setProperty("xy",[x,y]);
};

/**
* Adds a special CSS class to the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method hideMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.hideMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "show-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "hide-scrollbars");
};

/**
* Removes a special CSS class from the Overlay when Mac/Gecko is in use, to work around a Gecko bug where
* scrollbars cannot be hidden. See https://bugzilla.mozilla.org/show_bug.cgi?id=187435
* @method showMacGeckoScrollbars
*/
YAHOO.widget.Overlay.prototype.showMacGeckoScrollbars = function() {
	YAHOO.util.Dom.removeClass(this.element, "hide-scrollbars");
	YAHOO.util.Dom.addClass(this.element, "show-scrollbars");
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "visible" property is changed. This method is responsible for firing showEvent and hideEvent.
* @method configVisible
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configVisible = function(type, args, obj) {
	var visible = args[0];
	var currentVis = YAHOO.util.Dom.getStyle(this.element, "visibility");

	if (currentVis == "inherit") {
		var e = this.element.parentNode;
		while (e.nodeType != 9 && e.nodeType != 11) {
			currentVis = YAHOO.util.Dom.getStyle(e, "visibility");
			if (currentVis != "inherit") { break; }
			e = e.parentNode;
		}
		if (currentVis == "inherit") {
			currentVis = "visible";
		}
	}

	var effect = this.cfg.getProperty("effect");

	var effectInstances = [];
	if (effect) {
		if (effect instanceof Array) {
			for (var i=0;i<effect.length;i++) {
				var eff = effect[i];
				effectInstances[effectInstances.length] = eff.effect(this, eff.duration);
			}
		} else {
			effectInstances[effectInstances.length] = effect.effect(this, effect.duration);
		}
	}

	var isMacGecko = (this.platform == "mac" && this.browser == "gecko");

	if (visible) { // Show
		if (isMacGecko) {
			this.showMacGeckoScrollbars();
		}

		if (effect) { // Animate in
			if (visible) { // Animate in if not showing
				if (currentVis != "visible" || currentVis === "") {
					this.beforeShowEvent.fire();
					for (var j=0;j<effectInstances.length;j++) {
						var ei = effectInstances[j];
						if (j === 0 && ! YAHOO.util.Config.alreadySubscribed(ei.animateInCompleteEvent,this.showEvent.fire,this.showEvent)) {
							ei.animateInCompleteEvent.subscribe(this.showEvent.fire,this.showEvent,true); // Delegate showEvent until end of animateInComplete
						}
						ei.animateIn();
					}
				}
			}
		} else { // Show
			if (currentVis != "visible" || currentVis === "") {
				this.beforeShowEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "visible");
				this.cfg.refireEvent("iframe");
				this.showEvent.fire();
			}
		}

	} else { // Hide
		if (isMacGecko) {
			this.hideMacGeckoScrollbars();
		}

		if (effect) { // Animate out if showing
			if (currentVis == "visible") {
				this.beforeHideEvent.fire();
				for (var k=0;k<effectInstances.length;k++) {
					var h = effectInstances[k];
					if (k === 0 && ! YAHOO.util.Config.alreadySubscribed(h.animateOutCompleteEvent,this.hideEvent.fire,this.hideEvent)) {
						h.animateOutCompleteEvent.subscribe(this.hideEvent.fire,this.hideEvent,true); // Delegate hideEvent until end of animateOutComplete
					}
					h.animateOut();
				}
			} else if (currentVis === "") {
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
			}
		} else { // Simple hide
			if (currentVis == "visible" || currentVis === "") {
				this.beforeHideEvent.fire();
				YAHOO.util.Dom.setStyle(this.element, "visibility", "hidden");
				this.cfg.refireEvent("iframe");
				this.hideEvent.fire();
			}
		}
	}
};

/**
* Center event handler used for centering on scroll/resize, but only if the Overlay is visible
* @method doCenterOnDOMEvent
*/
YAHOO.widget.Overlay.prototype.doCenterOnDOMEvent = function() {
	if (this.cfg.getProperty("visible")) {
		this.center();
	}
};

/**
* The default event handler fired when the "fixedcenter" property is changed.
* @method configFixedCenter
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configFixedCenter = function(type, args, obj) {
	var val = args[0];

	if (val) {
		this.center();

		if (! YAHOO.util.Config.alreadySubscribed(this.beforeShowEvent, this.center, this)) {
			this.beforeShowEvent.subscribe(this.center, this, true);
		}

		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowResizeEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.doCenterOnDOMEvent, this, true);
		}

		if (! YAHOO.util.Config.alreadySubscribed(YAHOO.widget.Overlay.windowScrollEvent, this.doCenterOnDOMEvent, this)) {
			YAHOO.widget.Overlay.windowScrollEvent.subscribe( this.doCenterOnDOMEvent, this, true);
		}
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
		YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	}
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.element;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configzIndex = function(type, args, obj) {
	var zIndex = args[0];

	var el = this.element;

	if (! zIndex) {
		zIndex = YAHOO.util.Dom.getStyle(el, "zIndex");
		if (! zIndex || isNaN(zIndex)) {
			zIndex = 0;
		}
	}

	if (this.iframe) {
		if (zIndex <= 0) {
			zIndex = 1;
		}
		YAHOO.util.Dom.setStyle(this.iframe, "zIndex", (zIndex-1));
	}

	YAHOO.util.Dom.setStyle(el, "zIndex", zIndex);
	this.cfg.setProperty("zIndex", zIndex, true);
};

/**
* The default event handler fired when the "xy" property is changed.
* @method configXY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configXY = function(type, args, obj) {
	var pos = args[0];
	var x = pos[0];
	var y = pos[1];

	this.cfg.setProperty("x", x);
	this.cfg.setProperty("y", y);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");


	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x,y]);
};

/**
* The default event handler fired when the "x" property is changed.
* @method configX
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configX = function(type, args, obj) {
	var x = args[0];
	var y = this.cfg.getProperty("y");

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setX(this.element, x, true);

	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* The default event handler fired when the "y" property is changed.
* @method configY
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configY = function(type, args, obj) {
	var x = this.cfg.getProperty("x");
	var y = args[0];

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);

	this.beforeMoveEvent.fire([x,y]);

	x = this.cfg.getProperty("x");
	y = this.cfg.getProperty("y");

	YAHOO.util.Dom.setY(this.element, y, true);

	this.cfg.setProperty("xy", [x, y], true);

	this.cfg.refireEvent("iframe");
	this.moveEvent.fire([x, y]);
};

/**
* Shows the iframe shim, if it has been enabled
* @method showIframe
*/
YAHOO.widget.Overlay.prototype.showIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "block";
	}
};

/**
* Hides the iframe shim, if it has been enabled
* @method hideIframe
*/
YAHOO.widget.Overlay.prototype.hideIframe = function() {
	if (this.iframe) {
		this.iframe.style.display = "none";
	}
};

/**
* The default event handler fired when the "iframe" property is changed.
* @method configIframe
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configIframe = function(type, args, obj) {

	var val = args[0];

	if (val) { // IFRAME shim is enabled

		if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, this.showIframe, this)) {
			this.showEvent.subscribe(this.showIframe, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, this.hideIframe, this)) {
			this.hideEvent.subscribe(this.hideIframe, this, true);
		}

		var x = this.cfg.getProperty("x");
		var y = this.cfg.getProperty("y");

		if (! x || ! y) {
			this.syncPosition();
			x = this.cfg.getProperty("x");
			y = this.cfg.getProperty("y");
		}


		if (! isNaN(x) && ! isNaN(y)) {
			if (! this.iframe) {
				this.iframe = document.createElement("iframe");
				if (this.isSecure) {
					this.iframe.src = YAHOO.widget.Overlay.IFRAME_SRC;
				}

				var parent = this.element.parentNode;
				if (parent) {
					parent.appendChild(this.iframe);
				} else {
					document.body.appendChild(this.iframe);
				}

				YAHOO.util.Dom.setStyle(this.iframe, "position", "absolute");
				YAHOO.util.Dom.setStyle(this.iframe, "border", "none");
				YAHOO.util.Dom.setStyle(this.iframe, "margin", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "padding", "0");
				YAHOO.util.Dom.setStyle(this.iframe, "opacity", "0");
				if (this.cfg.getProperty("visible")) {
					this.showIframe();
				} else {
					this.hideIframe();
				}
			}

			var iframeDisplay = YAHOO.util.Dom.getStyle(this.iframe, "display");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "block";
			}

			YAHOO.util.Dom.setXY(this.iframe, [x,y]);

			var width = this.element.clientWidth;
			var height = this.element.clientHeight;

			YAHOO.util.Dom.setStyle(this.iframe, "width", (width+2) + "px");
			YAHOO.util.Dom.setStyle(this.iframe, "height", (height+2) + "px");

			if (iframeDisplay == "none") {
				this.iframe.style.display = "none";
			}
		}
	} else {
		if (this.iframe) {
			this.iframe.style.display = "none";
		}
		this.showEvent.unsubscribe(this.showIframe, this);
		this.hideEvent.unsubscribe(this.hideIframe, this);
	}
};


/**
* The default event handler fired when the "constraintoviewport" property is changed.
* @method configConstrainToViewport
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configConstrainToViewport = function(type, args, obj) {
	var val = args[0];
	if (val) {
		if (! YAHOO.util.Config.alreadySubscribed(this.beforeMoveEvent, this.enforceConstraints, this)) {
			this.beforeMoveEvent.subscribe(this.enforceConstraints, this, true);
		}
	} else {
		this.beforeMoveEvent.unsubscribe(this.enforceConstraints, this);
	}
};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.configContext = function(type, args, obj) {
	var contextArgs = args[0];

	if (contextArgs) {
		var contextEl = contextArgs[0];
		var elementMagnetCorner = contextArgs[1];
		var contextMagnetCorner = contextArgs[2];

		if (contextEl) {
			if (typeof contextEl == "string") {
				this.cfg.setProperty("context", [document.getElementById(contextEl),elementMagnetCorner,contextMagnetCorner], true);
			}

			if (elementMagnetCorner && contextMagnetCorner) {
				this.align(elementMagnetCorner, contextMagnetCorner);
			}
		}
	}
};


// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Aligns the Overlay to its context element using the specified corner points (represented by the constants TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, and BOTTOM_RIGHT.
* @method align
* @param {String} elementAlign		The String representing the corner of the Overlay that should be aligned to the context element
* @param {String} contextAlign		The corner of the context element that the elementAlign corner should stick to.
*/
YAHOO.widget.Overlay.prototype.align = function(elementAlign, contextAlign) {
	var contextArgs = this.cfg.getProperty("context");
	if (contextArgs) {
		var context = contextArgs[0];

		var element = this.element;
		var me = this;

		if (! elementAlign) {
			elementAlign = contextArgs[1];
		}

		if (! contextAlign) {
			contextAlign = contextArgs[2];
		}

		if (element && context) {
			var contextRegion = YAHOO.util.Dom.getRegion(context);

			var doAlign = function(v,h) {
				switch (elementAlign) {
					case YAHOO.widget.Overlay.TOP_LEFT:
						me.moveTo(h,v);
						break;
					case YAHOO.widget.Overlay.TOP_RIGHT:
						me.moveTo(h-element.offsetWidth,v);
						break;
					case YAHOO.widget.Overlay.BOTTOM_LEFT:
						me.moveTo(h,v-element.offsetHeight);
						break;
					case YAHOO.widget.Overlay.BOTTOM_RIGHT:
						me.moveTo(h-element.offsetWidth,v-element.offsetHeight);
						break;
				}
			};

			switch (contextAlign) {
				case YAHOO.widget.Overlay.TOP_LEFT:
					doAlign(contextRegion.top, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.TOP_RIGHT:
					doAlign(contextRegion.top, contextRegion.right);
					break;
				case YAHOO.widget.Overlay.BOTTOM_LEFT:
					doAlign(contextRegion.bottom, contextRegion.left);
					break;
				case YAHOO.widget.Overlay.BOTTOM_RIGHT:
					doAlign(contextRegion.bottom, contextRegion.right);
					break;
			}
		}
	}
};

/**
* The default event handler executed when the moveEvent is fired, if the "constraintoviewport" is set to true.
* @method enforceConstraints
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Overlay.prototype.enforceConstraints = function(type, args, obj) {
	var pos = args[0];

	var x = pos[0];
	var y = pos[1];

	var offsetHeight = this.element.offsetHeight;
	var offsetWidth = this.element.offsetWidth;

	var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
	var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var topConstraint = scrollY + 10;
	var leftConstraint = scrollX + 10;
	var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
	var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;

	if (x < leftConstraint) {
		x = leftConstraint;
	} else if (x > rightConstraint) {
		x = rightConstraint;
	}

	if (y < topConstraint) {
		y = topConstraint;
	} else if (y > bottomConstraint) {
		y = bottomConstraint;
	}

	this.cfg.setProperty("x", x, true);
	this.cfg.setProperty("y", y, true);
	this.cfg.setProperty("xy", [x,y], true);
};

/**
* Centers the container in the viewport.
* @method center
*/
YAHOO.widget.Overlay.prototype.center = function() {
	var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scrollY = document.documentElement.scrollTop || document.body.scrollTop;

	var viewPortWidth = YAHOO.util.Dom.getClientWidth();
	var viewPortHeight = YAHOO.util.Dom.getClientHeight();

	var elementWidth = this.element.offsetWidth;
	var elementHeight = this.element.offsetHeight;

	var x = (viewPortWidth / 2) - (elementWidth / 2) + scrollX;
	var y = (viewPortHeight / 2) - (elementHeight / 2) + scrollY;

	this.cfg.setProperty("xy", [parseInt(x, 10), parseInt(y, 10)]);

	this.cfg.refireEvent("iframe");
};

/**
* Synchronizes the Panel's "xy", "x", and "y" properties with the Panel's position in the DOM. This is primarily used to update position information during drag & drop.
* @method syncPosition
*/
YAHOO.widget.Overlay.prototype.syncPosition = function() {
	var pos = YAHOO.util.Dom.getXY(this.element);
	this.cfg.setProperty("x", pos[0], true);
	this.cfg.setProperty("y", pos[1], true);
	this.cfg.setProperty("xy", pos, true);
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Overlay.prototype.onDomResize = function(e, obj) {
	YAHOO.widget.Overlay.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.syncPosition();
		me.cfg.refireEvent("iframe");
		me.cfg.refireEvent("context");
	}, 0);
};

/**
* Removes the Overlay element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Overlay.prototype.destroy = function() {
	if (this.iframe) {
		this.iframe.parentNode.removeChild(this.iframe);
	}

	this.iframe = null;

	YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.doCenterOnDOMEvent, this);
	YAHOO.widget.Overlay.windowScrollEvent.unsubscribe(this.doCenterOnDOMEvent, this);

	YAHOO.widget.Overlay.superclass.destroy.call(this);
};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Overlay.
*/
YAHOO.widget.Overlay.prototype.toString = function() {
	return "Overlay " + this.id;
};

/**
* A singleton CustomEvent used for reacting to the DOM event for window scroll
* @event YAHOO.widget.Overlay.windowScrollEvent
*/
YAHOO.widget.Overlay.windowScrollEvent = new YAHOO.util.CustomEvent("windowScroll");

/**
* A singleton CustomEvent used for reacting to the DOM event for window resize
* @event YAHOO.widget.Overlay.windowResizeEvent
*/
YAHOO.widget.Overlay.windowResizeEvent = new YAHOO.util.CustomEvent("windowResize");

/**
* The DOM event handler used to fire the CustomEvent for window scroll
* @method YAHOO.widget.Overlay.windowScrollHandler
* @static
* @param {DOMEvent} e The DOM scroll event
*/
YAHOO.widget.Overlay.windowScrollHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.scrollEnd) {
			window.scrollEnd = -1;
		}
		clearTimeout(window.scrollEnd);
		window.scrollEnd = setTimeout(function() { YAHOO.widget.Overlay.windowScrollEvent.fire(); }, 1);
	} else {
		YAHOO.widget.Overlay.windowScrollEvent.fire();
	}
};

/**
* The DOM event handler used to fire the CustomEvent for window resize
* @method YAHOO.widget.Overlay.windowResizeHandler
* @static
* @param {DOMEvent} e The DOM resize event
*/
YAHOO.widget.Overlay.windowResizeHandler = function(e) {
	if (YAHOO.widget.Module.prototype.browser == "ie" || YAHOO.widget.Module.prototype.browser == "ie7") {
		if (! window.resizeEnd) {
			window.resizeEnd = -1;
		}
		clearTimeout(window.resizeEnd);
		window.resizeEnd = setTimeout(function() { YAHOO.widget.Overlay.windowResizeEvent.fire(); }, 100);
	} else {
		YAHOO.widget.Overlay.windowResizeEvent.fire();
	}
};

/**
* A boolean that indicated whether the window resize and scroll events have already been subscribed to.
* @property YAHOO.widget.Overlay._initialized
* @private
* @type Boolean
*/
YAHOO.widget.Overlay._initialized = null;

if (YAHOO.widget.Overlay._initialized === null) {
	YAHOO.util.Event.addListener(window, "scroll", YAHOO.widget.Overlay.windowScrollHandler);
	YAHOO.util.Event.addListener(window, "resize", YAHOO.widget.Overlay.windowResizeHandler);

	YAHOO.widget.Overlay._initialized = true;
}
/**
* OverlayManager is used for maintaining the focus status of multiple Overlays.* @namespace YAHOO.widget
* @namespace YAHOO.widget
* @class OverlayManager
* @constructor
* @param {Array}	overlays	Optional. A collection of Overlays to register with the manager.
* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
*/
YAHOO.widget.OverlayManager = function(userConfig) {
	this.init(userConfig);
};

/**
* The CSS class representing a focused Overlay
* @property YAHOO.widget.OverlayManager.CSS_FOCUSED
* @static
* @final
* @type String
*/
YAHOO.widget.OverlayManager.CSS_FOCUSED = "focused";

YAHOO.widget.OverlayManager.prototype = {
	/**
	* The class's constructor function
	* @property contructor
	* @type Function
	*/
	constructor : YAHOO.widget.OverlayManager,

	/**
	* The array of Overlays that are currently registered
	* @property overlays
	* @type YAHOO.widget.Overlay[]
	*/
	overlays : null,

	/**
	* Initializes the default configuration of the OverlayManager
	* @method initDefaultConfig
	*/
	initDefaultConfig : function() {
		/**
		* The collection of registered Overlays in use by the OverlayManager
		* @config overlays
		* @type YAHOO.widget.Overlay[]
		* @default null
		*/
		this.cfg.addProperty("overlays", { suppressEvent:true } );

		/**
		* The default DOM event that should be used to focus an Overlay
		* @config focusevent
		* @type String
		* @default "mousedown"
		*/
		this.cfg.addProperty("focusevent", { value:"mousedown" } );
	},

	/**
	* Initializes the OverlayManager
	* @method init
	* @param {YAHOO.widget.Overlay[]}	overlays	Optional. A collection of Overlays to register with the manager.
	* @param {Object}	userConfig		The object literal representing the user configuration of the OverlayManager
	*/
	init : function(userConfig) {
		/**
		* The OverlayManager's Config object used for monitoring configuration properties.
		* @property cfg
		* @type YAHOO.util.Config
		*/
		this.cfg = new YAHOO.util.Config(this);

		this.initDefaultConfig();

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}
		this.cfg.fireQueue();

		/**
		* The currently activated Overlay
		* @property activeOverlay
		* @private
		* @type YAHOO.widget.Overlay
		*/
		var activeOverlay = null;

		/**
		* Returns the currently focused Overlay
		* @method getActive
		* @return {YAHOO.widget.Overlay}	The currently focused Overlay
		*/
		this.getActive = function() {
			return activeOverlay;
		};

		/**
		* Focuses the specified Overlay
		* @method focus
		* @param {YAHOO.widget.Overlay} overlay	The Overlay to focus
		* @param {String} overlay	The id of the Overlay to focus
		*/
		this.focus = function(overlay) {

			var o = this.find(overlay);

			if (o) {

                if (activeOverlay != o) {

                    if(activeOverlay) {
    
                        activeOverlay.blur();
    
                    }
    
                    activeOverlay = o;
    
                    YAHOO.util.Dom.addClass(activeOverlay.element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
    
                    this.overlays.sort(this.compareZIndexDesc);
    
                    var topZIndex = YAHOO.util.Dom.getStyle(this.overlays[0].element, "zIndex");
    
                    if (! isNaN(topZIndex) && this.overlays[0] != overlay) {
    
                        activeOverlay.cfg.setProperty("zIndex", (parseInt(topZIndex, 10) + 2));
    
                    }
    
                    this.overlays.sort(this.compareZIndexDesc);
    
                    o.focusEvent.fire();
                
                }

			}

		};

		/**
		* Removes the specified Overlay from the manager
		* @method remove
		* @param {YAHOO.widget.Overlay}	overlay	The Overlay to remove
		* @param {String} overlay	The id of the Overlay to remove
		*/
		this.remove = function(overlay) {
			var o = this.find(overlay);
			if (o) {
				var originalZ = YAHOO.util.Dom.getStyle(o.element, "zIndex");
				o.cfg.setProperty("zIndex", -1000, true);
				this.overlays.sort(this.compareZIndexDesc);
				this.overlays = this.overlays.slice(0, this.overlays.length-1);
				o.cfg.setProperty("zIndex", originalZ, true);

				o.cfg.setProperty("manager", null);
				o.focusEvent = null;
				o.blurEvent = null;
				o.focus = null;
				o.blur = null;
			}
		};

		/**
		* Removes focus from all registered Overlays in the manager
		* @method blurAll
		*/
		this.blurAll = function() {
			for (var o=0;o<this.overlays.length;o++) {
                this.overlays[o].blur();
			}
		};


        this._onOverlayBlur = function(p_sType, p_aArgs) {
            activeOverlay = null;
        };


		var overlays = this.cfg.getProperty("overlays");

		if (! this.overlays) {
			this.overlays = [];
		}

		if (overlays) {
			this.register(overlays);
			this.overlays.sort(this.compareZIndexDesc);
		}
	},

	/**
	* Registers an Overlay or an array of Overlays with the manager. Upon registration, the Overlay receives functions for focus and blur, along with CustomEvents for each.
	* @method register
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to register with the manager.
	* @param {YAHOO.widget.Overlay[]}	overlay		An array of Overlays to register with the manager.
	* @return	{Boolean}	True if any Overlays are registered.
	*/
	register : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			overlay.cfg.addProperty("manager", { value:this } );

			overlay.focusEvent = new YAHOO.util.CustomEvent("focus", overlay);
			overlay.blurEvent = new YAHOO.util.CustomEvent("blur", overlay);

			var mgr=this;

			overlay.focus = function() {
				mgr.focus(this);
			};

			overlay.blur = function() {
                if(mgr.getActive() == this) {
                    YAHOO.util.Dom.removeClass(this.element, YAHOO.widget.OverlayManager.CSS_FOCUSED);
                    this.blurEvent.fire();
				}
			};

            overlay.blurEvent.subscribe(mgr._onOverlayBlur);

			var focusOnDomEvent = function(e,obj) {
				overlay.focus();
			};

			var focusevent = this.cfg.getProperty("focusevent");
			YAHOO.util.Event.addListener(overlay.element,focusevent,focusOnDomEvent,this,true);

			var zIndex = YAHOO.util.Dom.getStyle(overlay.element, "zIndex");
			if (! isNaN(zIndex)) {
				overlay.cfg.setProperty("zIndex", parseInt(zIndex, 10));
			} else {
				overlay.cfg.setProperty("zIndex", 0);
			}

			this.overlays.push(overlay);
			return true;
		} else if (overlay instanceof Array) {
			var regcount = 0;
			for (var i=0;i<overlay.length;i++) {
				if (this.register(overlay[i])) {
					regcount++;
				}
			}
			if (regcount > 0) {
				return true;
			}
		} else {
			return false;
		}
	},

	/**
	* Attempts to locate an Overlay by instance or ID.
	* @method find
	* @param {YAHOO.widget.Overlay}	overlay		An Overlay to locate within the manager
	* @param {String}	overlay		An Overlay id to locate within the manager
	* @return	{YAHOO.widget.Overlay}	The requested Overlay, if found, or null if it cannot be located.
	*/
	find : function(overlay) {
		if (overlay instanceof YAHOO.widget.Overlay) {
			for (var o=0;o<this.overlays.length;o++) {
				if (this.overlays[o] == overlay) {
					return this.overlays[o];
				}
			}
		} else if (typeof overlay == "string") {
			for (var p=0;p<this.overlays.length;p++) {
				if (this.overlays[p].id == overlay) {
					return this.overlays[p];
				}
			}
		}
		return null;
	},

	/**
	* Used for sorting the manager's Overlays by z-index.
	* @method compareZIndexDesc
	* @private
	* @return {Number}	0, 1, or -1, depending on where the Overlay should fall in the stacking order.
	*/
	compareZIndexDesc : function(o1, o2) {
		var zIndex1 = o1.cfg.getProperty("zIndex");
		var zIndex2 = o2.cfg.getProperty("zIndex");

		if (zIndex1 > zIndex2) {
			return -1;
		} else if (zIndex1 < zIndex2) {
			return 1;
		} else {
			return 0;
		}
	},

	/**
	* Shows all Overlays in the manager.
	* @method showAll
	*/
	showAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].show();
		}
	},

	/**
	* Hides all Overlays in the manager.
	* @method hideAll
	*/
	hideAll : function() {
		for (var o=0;o<this.overlays.length;o++) {
			this.overlays[o].hide();
		}
	},

	/**
	* Returns a string representation of the object.
	* @method toString
	* @return {String}	The string representation of the OverlayManager
	*/
	toString : function() {
		return "OverlayManager";
	}

};
/**
* Tooltip is an implementation of Overlay that behaves like an OS tooltip, displaying when the user mouses over a particular element, and disappearing on mouse out.
* @namespace YAHOO.widget
* @class Tooltip
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip = function(el, userConfig) {
	YAHOO.widget.Tooltip.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Tooltip, YAHOO.widget.Overlay);

/**
* Constant representing the Tooltip CSS class
* @property YAHOO.widget.Tooltip.CSS_TOOLTIP
* @static
* @final
* @type String
*/
YAHOO.widget.Tooltip.CSS_TOOLTIP = "yui-tt";

/**
* Constant representing the Tooltip's configuration properties
* @property YAHOO.widget.Tooltip._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Tooltip._DEFAULT_CONFIG = {

    "PREVENT_OVERLAP": { 
        key: "preventoverlap", 
        value:true, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["x","y","xy"] 
    },

    "SHOW_DELAY": { 
        key: "showdelay", 
        value:200, 
        validator:YAHOO.lang.isNumber 
    }, 

    "AUTO_DISMISS_DELAY": { 
        key: "autodismissdelay", 
        value:5000, 
        validator:YAHOO.lang.isNumber 
    }, 

    "HIDE_DELAY": { 
        key: "hidedelay", 
        value:250, 
        validator:YAHOO.lang.isNumber 
    }, 

    "TEXT": { 
        key: "text", 
        suppressEvent:true 
    }, 

    "CONTAINER": { 
        key: "container"
    }

};

/**
* The Tooltip initialization method. This method is automatically called by the constructor. A Tooltip is automatically rendered by the init method, and it also is set to be invisible by default, and constrained to viewport by default as well.
* @method init
* @param {String}	el	The element ID representing the Tooltip <em>OR</em>
* @param {HTMLElement}	el	The element representing the Tooltip
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Tooltip. See configuration documentation for more details.
*/
YAHOO.widget.Tooltip.prototype.init = function(el, userConfig) {

	if (document.readyState && document.readyState != "complete") {
		var deferredInit = function() {
			this.init(el, userConfig);
		};
		YAHOO.util.Event.addListener(window, "load", deferredInit, this, true);
	} else {
		YAHOO.widget.Tooltip.superclass.init.call(this, el);

		this.beforeInitEvent.fire(YAHOO.widget.Tooltip);

		YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Tooltip.CSS_TOOLTIP);

		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}

		this.cfg.queueProperty("visible",false);
		this.cfg.queueProperty("constraintoviewport",true);

		this.setBody("");
		this.render(this.cfg.getProperty("container"));

		this.initEvent.fire(YAHOO.widget.Tooltip);
	}
};

/**
* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Tooltip.prototype.initDefaultConfig = function() {
	YAHOO.widget.Tooltip.superclass.initDefaultConfig.call(this);

    var DEFAULT_CONFIG = YAHOO.widget.Tooltip._DEFAULT_CONFIG;

	/**
	* Specifies whether the Tooltip should be kept from overlapping its context element.
	* @config preventoverlap
	* @type Boolean
	* @default true
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.PREVENT_OVERLAP.key,
	           {
	               value: DEFAULT_CONFIG.PREVENT_OVERLAP.value, 
	               validator: DEFAULT_CONFIG.PREVENT_OVERLAP.validator, 
	               supercedes: DEFAULT_CONFIG.PREVENT_OVERLAP.supercedes
               }
           );

	/**
	* The number of milliseconds to wait before showing a Tooltip on mouseover.
	* @config showdelay
	* @type Number
	* @default 200
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.SHOW_DELAY.key,
                {
                    handler: this.configShowDelay,
                    value: 200, 
                    validator: DEFAULT_CONFIG.SHOW_DELAY.validator
                }
          );

	/**
	* The number of milliseconds to wait before automatically dismissing a Tooltip after the mouse has been resting on the context element.
	* @config autodismissdelay
	* @type Number
	* @default 5000
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.AUTO_DISMISS_DELAY.key,	
                {
                    handler: this.configAutoDismissDelay,
                    value: DEFAULT_CONFIG.AUTO_DISMISS_DELAY.value,
                    validator: DEFAULT_CONFIG.AUTO_DISMISS_DELAY.validator
                }
            );

	/**
	* The number of milliseconds to wait before hiding a Tooltip on mouseover.
	* @config hidedelay
	* @type Number
	* @default 250
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.HIDE_DELAY.key,
                {
                    handler: this.configHideDelay,
                    value: DEFAULT_CONFIG.HIDE_DELAY.value, 
                    validator: DEFAULT_CONFIG.HIDE_DELAY.validator
                }
            );

	/**
	* Specifies the Tooltip's text.
	* @config text
	* @type String
	* @default null
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.TEXT.key,
                {
                    handler: this.configText,
                    suppressEvent: DEFAULT_CONFIG.TEXT.suppressEvent
                }
            );

	/**
	* Specifies the container element that the Tooltip's markup should be rendered into.
	* @config container
	* @type HTMLElement/String
	* @default document.body
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.CONTAINER.key,
                {
                    handler: this.configContainer,
                    value: document.body
                }
            );

	/**
	* Specifies the element or elements that the Tooltip should be anchored to on mouseover.
	* @config context
	* @type HTMLElement[]/String[]
	* @default null
	*/	

};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "text" property is changed.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configText = function(type, args, obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
	}
};

/**
* The default event handler fired when the "container" property is changed.
* @method configContainer
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContainer = function(type, args, obj) {
	var container = args[0];
	if (typeof container == 'string') {
		this.cfg.setProperty("container", document.getElementById(container), true);
	}
};

/**
* @method _removeEventListeners
* @description Removes all of the DOM event handlers from the HTML element(s) 
* that trigger the display of the tooltip.
* @protected
*/
YAHOO.widget.Tooltip.prototype._removeEventListeners = function() {

    var aElements = this._context;
    
    if (aElements) {

        var nElements = aElements.length;
        
        if (nElements > 0) {
        
            var i = nElements - 1,
                oElement;
            
            do {

                oElement = aElements[i];

                YAHOO.util.Event.removeListener(oElement, "mouseover", this.onContextMouseOver);
                YAHOO.util.Event.removeListener(oElement, "mousemove", this.onContextMouseMove);
                YAHOO.util.Event.removeListener(oElement, "mouseout", this.onContextMouseOut);
            
            }
            while(i--);
        
        }

    }

};

/**
* The default event handler fired when the "context" property is changed.
* @method configContext
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Tooltip.prototype.configContext = function(type, args, obj) {
	var context = args[0];
	if (context) {

		// Normalize parameter into an array
		if (! (context instanceof Array)) {
			if (typeof context == "string") {
				this.cfg.setProperty("context", [document.getElementById(context)], true);
			} else { // Assuming this is an element
				this.cfg.setProperty("context", [context], true);
			}
			context = this.cfg.getProperty("context");
		}


		// Remove any existing mouseover/mouseout listeners
        this._removeEventListeners();

		// Add mouseover/mouseout listeners to context elements
		this._context = context;

        var aElements = this._context;
        
        if (aElements) {
    
            var nElements = aElements.length;
            
            if (nElements > 0) {
            
                var i = nElements - 1,
                    oElement;
                
                do {
    
                    oElement = aElements[i];
    
                    YAHOO.util.Event.addListener(oElement, "mouseover", this.onContextMouseOver, this);
                    YAHOO.util.Event.addListener(oElement, "mousemove", this.onContextMouseMove, this);
                    YAHOO.util.Event.addListener(oElement, "mouseout", this.onContextMouseOut, this);
                
                }
                while(i--);
            
            }
    
        }

	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

// BEGIN BUILT-IN DOM EVENT HANDLERS //

/**
* The default event handler fired when the user moves the mouse while over the context element.
* @method onContextMouseMove
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseMove = function(e, obj) {
	obj.pageX = YAHOO.util.Event.getPageX(e);
	obj.pageY = YAHOO.util.Event.getPageY(e);

};

/**
* The default event handler fired when the user mouses over the context element.
* @method onContextMouseOver
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOver = function(e, obj) {

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}

	var context = this;
	YAHOO.util.Event.addListener(context, "mousemove", obj.onContextMouseMove, obj);

	if (context.title) {
		obj._tempTitle = context.title;
		context.title = "";
	}

	/**
	* The unique process ID associated with the thread responsible for showing the Tooltip.
	* @type int
	*/
	obj.showProcId = obj.doShow(e, context);
};

/**
* The default event handler fired when the user mouses out of the context element.
* @method onContextMouseOut
* @param {DOMEvent} e	The current DOM event
* @param {Object}	obj	The object argument
*/
YAHOO.widget.Tooltip.prototype.onContextMouseOut = function(e, obj) {
	var el = this;

	if (obj._tempTitle) {
		el.title = obj._tempTitle;
		obj._tempTitle = null;
	}

	if (obj.showProcId) {
		clearTimeout(obj.showProcId);
		obj.showProcId = null;
	}

	if (obj.hideProcId) {
		clearTimeout(obj.hideProcId);
		obj.hideProcId = null;
	}


	obj.hideProcId = setTimeout(function() {
				obj.hide();
				}, obj.cfg.getProperty("hidedelay"));
};

// END BUILT-IN DOM EVENT HANDLERS //

/**
* Processes the showing of the Tooltip by setting the timeout delay and offset of the Tooltip.
* @method doShow
* @param {DOMEvent} e	The current DOM event
* @return {Number}	The process ID of the timeout function associated with doShow
*/
YAHOO.widget.Tooltip.prototype.doShow = function(e, context) {

	var yOffset = 25;
	if (this.browser == "opera" && context.tagName && context.tagName.toUpperCase() == "A") {
		yOffset += 12;
	}

	var me = this;
	return setTimeout(
		function() {
			if (me._tempTitle) {
				me.setBody(me._tempTitle);
			} else {
				me.cfg.refireEvent("text");
			}

			me.moveTo(me.pageX, me.pageY + yOffset);
			if (me.cfg.getProperty("preventoverlap")) {
				me.preventOverlap(me.pageX, me.pageY);
			}

			YAHOO.util.Event.removeListener(context, "mousemove", me.onContextMouseMove);

			me.show();
			me.hideProcId = me.doHide();
		},
	this.cfg.getProperty("showdelay"));
};

/**
* Sets the timeout for the auto-dismiss delay, which by default is 5 seconds, meaning that a tooltip will automatically dismiss itself after 5 seconds of being displayed.
* @method doHide
*/
YAHOO.widget.Tooltip.prototype.doHide = function() {
	var me = this;
	return setTimeout(
		function() {
			me.hide();
		},
		this.cfg.getProperty("autodismissdelay"));
};

/**
* Fired when the Tooltip is moved, this event handler is used to prevent the Tooltip from overlapping with its context element.
* @method preventOverlay
* @param {Number} pageX	The x coordinate position of the mouse pointer
* @param {Number} pageY	The y coordinate position of the mouse pointer
*/
YAHOO.widget.Tooltip.prototype.preventOverlap = function(pageX, pageY) {

	var height = this.element.offsetHeight;

	var elementRegion = YAHOO.util.Dom.getRegion(this.element);

	elementRegion.top -= 5;
	elementRegion.left -= 5;
	elementRegion.right += 5;
	elementRegion.bottom += 5;

	var mousePoint = new YAHOO.util.Point(pageX, pageY);


	if (elementRegion.contains(mousePoint)) {
		this.cfg.setProperty("y", (pageY-height-5));
	}
};

/**
* Removes the Tooltip element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Tooltip.prototype.destroy = function() {

    // Remove any existing mouseover/mouseout listeners
    this._removeEventListeners();

    YAHOO.widget.Tooltip.superclass.destroy.call(this);  

};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Tooltip
*/
YAHOO.widget.Tooltip.prototype.toString = function() {
	return "Tooltip " + this.id;
};
/**
* Panel is an implementation of Overlay that behaves like an OS window, with a draggable header and an optional close icon at the top right.
* @namespace YAHOO.widget
* @class Panel
* @extends YAHOO.widget.Overlay
* @constructor
* @param {String}	el	The element ID representing the Panel <em>OR</em>
* @param {HTMLElement}	el	The element representing the Panel
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Panel. See configuration documentation for more details.
*/
YAHOO.widget.Panel = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Panel, YAHOO.widget.Overlay);

/**
* Constant representing the default CSS class used for a Panel
* @property YAHOO.widget.Panel.CSS_PANEL
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL = "yui-panel";

/**
* Constant representing the default CSS class used for a Panel's wrapping container
* @property YAHOO.widget.Panel.CSS_PANEL_CONTAINER
* @static
* @final
* @type String
*/
YAHOO.widget.Panel.CSS_PANEL_CONTAINER = "yui-panel-container";

/**
* Constant representing the name of the Panel's events
* @property YAHOO.widget.Panel._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Panel._EVENT_TYPES = {

	"SHOW_MASK": "showMask",
	"HIDE_MASK": "hideMask",
	"DRAG": "drag"

};

/**
* Constant representing the Panel's configuration properties
* @property YAHOO.widget.Panel._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Panel._DEFAULT_CONFIG = {

    "CLOSE": { 
        key: "close", 
        value:true, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"] 
    },

    "DRAGGABLE": { 
        key: "draggable", 
        value:(YAHOO.util.DD ? true : false), 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"]  
    },

    "UNDERLAY": { 
        key: "underlay", 
        value:"shadow", 
        supercedes:["visible"] 
    },

    "MODAL": { 
        key: "modal", 
        value:false, 
        validator:YAHOO.lang.isBoolean, 
        supercedes:["visible"] 
    },

    "KEY_LISTENERS": { 
        key: "keylisteners", 
        suppressEvent:true, 
        supercedes:["visible"] 
    }

};

/**
* The Overlay initialization method, which is executed for Overlay and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Overlay <em>OR</em>
* @param {HTMLElement}	el	The element representing the Overlay
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
*/
YAHOO.widget.Panel.prototype.init = function(el, userConfig) {
	YAHOO.widget.Panel.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Panel);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Panel.CSS_PANEL);

	this.buildWrapper();

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		var draggable = this.cfg.getProperty("draggable");
		if (draggable) {
			if (! this.header) {
				this.setHeader("&#160;");
			}
		}
	}, this, true);


    this.renderEvent.subscribe(function() {

        /*
            If no value for the "width" configuration property was specified, 
            set it to the offsetWidth. If the "width" is not set, then in IE 
            you can only drag the panel when you put the cursor on the
            header's text.
        */

        var sWidth = this.cfg.getProperty("width");
        
        if(!sWidth) {

            this.cfg.setProperty("width", (this.element.offsetWidth + "px"));
        
        }
    
    });


	var me = this;

	var doBlur = function() {
		this.blur();
	};

	this.showMaskEvent.subscribe(function() {

		var checkFocusable = function(el) {

            var sTagName = el.tagName.toUpperCase(),
                bFocusable = false;
            
            switch(sTagName) {
            
                case "A":
                case "BUTTON":
                case "SELECT":
                case "TEXTAREA":

                    if (! YAHOO.util.Dom.isAncestor(me.element, el)) {
                        YAHOO.util.Event.addListener(el, "focus", doBlur, el, true);
                        bFocusable = true;
                    }

                break;

                case "INPUT":

                    if (el.type != "hidden" && ! YAHOO.util.Dom.isAncestor(me.element, el)) {

                        YAHOO.util.Event.addListener(el, "focus", doBlur, el, true);
                        bFocusable = true;

                    }

                break;
            
            }

            return bFocusable;

		};

		this.focusableElements = YAHOO.util.Dom.getElementsBy(checkFocusable);
	}, this, true);

	this.hideMaskEvent.subscribe(function() {
		for (var i=0;i<this.focusableElements.length;i++) {
			var el2 = this.focusableElements[i];
			YAHOO.util.Event.removeListener(el2, "focus", doBlur);
		}
	}, this, true);

	this.beforeShowEvent.subscribe(function() {
		this.cfg.refireEvent("underlay");
	}, this, true);
	this.initEvent.fire(YAHOO.widget.Panel);
};

/**
* Initializes the custom events for Module which are fired automatically at appropriate times by the Module class.
*/
YAHOO.widget.Panel.prototype.initEvents = function() {
	YAHOO.widget.Panel.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Panel._EVENT_TYPES;

	/**
	* CustomEvent fired after the modality mask is shown
	* @event showMaskEvent
	*/
	this.showMaskEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.SHOW_MASK, this);

	/**
	* CustomEvent fired after the modality mask is hidden
	* @event hideMaskEvent
	*/
	this.hideMaskEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.HIDE_MASK, this);

	/**
	* CustomEvent when the Panel is dragged
	* @event dragEvent
	*/
	this.dragEvent = new YAHOO.util.CustomEvent(EVENT_TYPES.DRAG, this);
};

/**
* Initializes the class's configurable properties which can be changed using the Panel's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Panel.prototype.initDefaultConfig = function() {
	YAHOO.widget.Panel.superclass.initDefaultConfig.call(this);

    // Add panel config properties //

    var DEFAULT_CONFIG = YAHOO.widget.Panel._DEFAULT_CONFIG;

	/**
	* True if the Panel should display a "close" button
	* @config close
	* @type Boolean
	* @default true
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.CLOSE.key,
                { 
                    handler: this.configClose, 
                    value: DEFAULT_CONFIG.CLOSE.value, 
                    validator: DEFAULT_CONFIG.CLOSE.validator, 
                    supercedes: DEFAULT_CONFIG.CLOSE.supercedes
                } 
            );

	/**
	* True if the Panel should be draggable.  Default value is "true" if the Drag and Drop utility is included, otherwise it is "false."
	* @config draggable
	* @type Boolean
	* @default true
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.DRAGGABLE.key, 
                { 
                    handler: this.configDraggable, 
                    value: DEFAULT_CONFIG.DRAGGABLE.value, 
                    validator: DEFAULT_CONFIG.DRAGGABLE.validator, 
                    supercedes: DEFAULT_CONFIG.DRAGGABLE.supercedes 
                } 
            );

	/**
	* Sets the type of underlay to display for the Panel. Valid values are "shadow", "matte", and "none".
	* @config underlay
	* @type String
	* @default shadow
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.UNDERLAY.key, 
                { 
                    handler: this.configUnderlay, 
                    value: DEFAULT_CONFIG.UNDERLAY.value, 
                    supercedes: DEFAULT_CONFIG.UNDERLAY.supercedes
                } 
            );

	/**
	* True if the Panel should be displayed in a modal fashion, automatically creating a transparent mask over the document that will not be removed until the Panel is dismissed.
	* @config modal
	* @type Boolean
	* @default false
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.MODAL.key,
                { 
                    handler: this.configModal, 
                    value: DEFAULT_CONFIG.MODAL.value,
                    validator: DEFAULT_CONFIG.MODAL.validator, 
                    supercedes: DEFAULT_CONFIG.MODAL.supercedes 
                } 
            );

	/**
	* A KeyListener (or array of KeyListeners) that will be enabled when the Panel is shown, and disabled when the Panel is hidden.
	* @config keylisteners
	* @type YAHOO.util.KeyListener[]
	* @default null
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.KEY_LISTENERS.key, 
                { 
                    handler: this.configKeyListeners, 
                    suppressEvent: DEFAULT_CONFIG.KEY_LISTENERS.suppressEvent, 
                    supercedes: DEFAULT_CONFIG.KEY_LISTENERS.supercedes
                } 
            );

};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Panel.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doHide = function(e, obj) {
		obj.hide();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("span");
			YAHOO.util.Dom.addClass(this.close, "container-close");
			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doHide, this);
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler fired when the "draggable" property is changed.
* @method configDraggable
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configDraggable = function(type, args, obj) {

	var val = args[0];
	if (val) {

        if (!YAHOO.util.DD) {
    

            this.cfg.setProperty("draggable", false);
    
            return;
        
        }

		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","move");
			this.registerDragDrop();
		}
	} else {
		if (this.dd) {
			this.dd.unreg();
		}
		if (this.header) {
			YAHOO.util.Dom.setStyle(this.header,"cursor","auto");
		}
	}
};

/**
* The default event handler fired when the "underlay" property is changed.
* @method configUnderlay
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configUnderlay = function(type, args, obj) {
	var val = args[0];

	switch (val.toLowerCase()) {
		case "shadow":
			YAHOO.util.Dom.removeClass(this.element, "matte");
			YAHOO.util.Dom.addClass(this.element, "shadow");

			if (! this.underlay) { // create if not already in DOM
				this.underlay = document.createElement("div");
				this.underlay.className = "underlay";
				this.underlay.innerHTML = "&#160;";
				this.element.appendChild(this.underlay);
			}

			this.sizeUnderlay();
			break;
		case "matte":
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.addClass(this.element, "matte");
			break;
		default:
			YAHOO.util.Dom.removeClass(this.element, "shadow");
			YAHOO.util.Dom.removeClass(this.element, "matte");
			break;
	}
};

/**
* The default event handler fired when the "modal" property is changed. This handler subscribes or unsubscribes to the show and hide events to handle the display or hide of the modality mask.
* @method configModal
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configModal = function(type, args, obj) {
	var modal = args[0];

	if (modal) {
		this.buildMask();

		if (! YAHOO.util.Config.alreadySubscribed( this.beforeShowEvent, this.showMask, this ) ) {
			this.beforeShowEvent.subscribe(this.showMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.hideEvent, this.hideMask, this) ) {
			this.hideEvent.subscribe(this.hideMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( YAHOO.widget.Overlay.windowResizeEvent, this.sizeMask, this ) ) {
			YAHOO.widget.Overlay.windowResizeEvent.subscribe(this.sizeMask, this, true);
		}
		if (! YAHOO.util.Config.alreadySubscribed( this.destroyEvent, this.removeMask, this) ) {
			this.destroyEvent.subscribe(this.removeMask, this, true);
		}

		this.cfg.refireEvent("zIndex");
	} else {
		this.beforeShowEvent.unsubscribe(this.showMask, this);
		this.hideEvent.unsubscribe(this.hideMask, this);
		YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.sizeMask, this);
		this.destroyEvent.unsubscribe(this.removeMask, this);
	}
};

/**
* Removes the modality mask.
* @method removeMask
*/
YAHOO.widget.Panel.prototype.removeMask = function() {

    var oMask = this.mask;

    if(oMask) {
    
        /*
            Hide the mask before destroying it to ensure that DOM
            event handlers on focusable elements get removed.
        */

        this.hideMask();
    
        var oParentNode = oMask.parentNode;

        if(oParentNode) {

            oParentNode.removeChild(oMask);

        }

        this.mask = null;
    }
    
};

/**
* The default event handler fired when the "keylisteners" property is changed.
* @method configKeyListeners
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configKeyListeners = function(type, args, obj) {
	var listeners = args[0];

	if (listeners) {
		if (listeners instanceof Array) {
			for (var i=0;i<listeners.length;i++) {
				var listener = listeners[i];

				if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listener.enable, listener)) {
					this.showEvent.subscribe(listener.enable, listener, true);
				}
				if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listener.disable, listener)) {
					this.hideEvent.subscribe(listener.disable, listener, true);
					this.destroyEvent.subscribe(listener.disable, listener, true);
				}
			}
		} else {
			if (! YAHOO.util.Config.alreadySubscribed(this.showEvent, listeners.enable, listeners)) {
				this.showEvent.subscribe(listeners.enable, listeners, true);
			}
			if (! YAHOO.util.Config.alreadySubscribed(this.hideEvent, listeners.disable, listeners)) {
				this.hideEvent.subscribe(listeners.disable, listeners, true);
				this.destroyEvent.subscribe(listeners.disable, listeners, true);
			}
		}
	}
};

/**
* The default event handler fired when the "height" property is changed.
* @method configHeight
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configHeight = function(type, args, obj) {
	var height = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "height", height);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "width" property is changed.
* @method configWidth
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configWidth = function(type, args, obj) {
	var width = args[0];
	var el = this.innerElement;
	YAHOO.util.Dom.setStyle(el, "width", width);
	this.cfg.refireEvent("underlay");
	this.cfg.refireEvent("iframe");
};

/**
* The default event handler fired when the "zIndex" property is changed.
* @method configzIndex
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Panel.prototype.configzIndex = function(type, args, obj) {
	YAHOO.widget.Panel.superclass.configzIndex.call(this, type, args, obj);

	var maskZ = 0;
	var currentZ = YAHOO.util.Dom.getStyle(this.element, "zIndex");

	if (this.mask) {
		if (! currentZ || isNaN(currentZ)) {
			currentZ = 0;
		}

		if (currentZ === 0) {
			this.cfg.setProperty("zIndex", 1);
		} else {
			maskZ = currentZ - 1;
			YAHOO.util.Dom.setStyle(this.mask, "zIndex", maskZ);
		}

	}
};

// END BUILT-IN PROPERTY EVENT HANDLERS //


/**
* Builds the wrapping container around the Panel that is used for positioning the shadow and matte underlays. The container element is assigned to a  local instance variable called container, and the element is reinserted inside of it.
* @method buildWrapper
*/
YAHOO.widget.Panel.prototype.buildWrapper = function() {
	var elementParent = this.element.parentNode;
	var originalElement = this.element;

	var wrapper = document.createElement("div");
	wrapper.className = YAHOO.widget.Panel.CSS_PANEL_CONTAINER;
	wrapper.id = originalElement.id + "_c";

	if (elementParent) {
		elementParent.insertBefore(wrapper, originalElement);
	}

	wrapper.appendChild(originalElement);

	this.element = wrapper;
	this.innerElement = originalElement;

	YAHOO.util.Dom.setStyle(this.innerElement, "visibility", "inherit");
};

/**
* Adjusts the size of the shadow based on the size of the element.
* @method sizeUnderlay
*/
YAHOO.widget.Panel.prototype.sizeUnderlay = function() {
	if (this.underlay && this.browser != "gecko" && this.browser != "safari") {
		this.underlay.style.width = this.innerElement.offsetWidth + "px";
		this.underlay.style.height = this.innerElement.offsetHeight + "px";
	}
};

/**
* Event handler fired when the resize monitor element is resized.
* @method onDomResize
* @param {DOMEvent} e	The resize DOM event
* @param {Object} obj	The scope object
*/
YAHOO.widget.Panel.prototype.onDomResize = function(e, obj) {
	YAHOO.widget.Panel.superclass.onDomResize.call(this, e, obj);
	var me = this;
	setTimeout(function() {
		me.sizeUnderlay();
	}, 0);
};

/**
* Registers the Panel's header for drag & drop capability.
* @method registerDragDrop
*/
YAHOO.widget.Panel.prototype.registerDragDrop = function() {
	if (this.header) {

        if(!YAHOO.util.DD) {


            return;
        
        }

		this.dd = new YAHOO.util.DD(this.element.id, this.id);

		if (! this.header.id) {
			this.header.id = this.id + "_h";
		}

		var me = this;

		this.dd.startDrag = function() {

			if (me.browser == "ie") {
				YAHOO.util.Dom.addClass(me.element,"drag");
			}

			if (me.cfg.getProperty("constraintoviewport")) {
				var offsetHeight = me.element.offsetHeight;
				var offsetWidth = me.element.offsetWidth;

				var viewPortWidth = YAHOO.util.Dom.getViewportWidth();
				var viewPortHeight = YAHOO.util.Dom.getViewportHeight();

				var scrollX = window.scrollX || document.documentElement.scrollLeft;
				var scrollY = window.scrollY || document.documentElement.scrollTop;

				var topConstraint = scrollY + 10;
				var leftConstraint = scrollX + 10;
				var bottomConstraint = scrollY + viewPortHeight - offsetHeight - 10;
				var rightConstraint = scrollX + viewPortWidth - offsetWidth - 10;

				this.minX = leftConstraint;
				this.maxX = rightConstraint;
				this.constrainX = true;

				this.minY = topConstraint;
				this.maxY = bottomConstraint;
				this.constrainY = true;
			} else {
				this.constrainX = false;
				this.constrainY = false;
			}

			me.dragEvent.fire("startDrag", arguments);
		};

		this.dd.onDrag = function() {
			me.syncPosition();
			me.cfg.refireEvent("iframe");
			if (this.platform == "mac" && this.browser == "gecko") {
				this.showMacGeckoScrollbars();
			}

			me.dragEvent.fire("onDrag", arguments);
		};

		this.dd.endDrag = function() {
			if (me.browser == "ie") {
				YAHOO.util.Dom.removeClass(me.element,"drag");
			}

			me.dragEvent.fire("endDrag", arguments);
		};

		this.dd.setHandleElId(this.header.id);
		this.dd.addInvalidHandleType("INPUT");
		this.dd.addInvalidHandleType("SELECT");
		this.dd.addInvalidHandleType("TEXTAREA");
	}
};

/**
* Builds the mask that is laid over the document when the Panel is configured to be modal.
* @method buildMask
*/
YAHOO.widget.Panel.prototype.buildMask = function() {
	if (! this.mask) {
		this.mask = document.createElement("div");
		this.mask.id = this.id + "_mask";
		this.mask.className = "mask";
		this.mask.innerHTML = "&#160;";

		var maskClick = function(e, obj) {
			YAHOO.util.Event.stopEvent(e);
		};

		var firstChild = document.body.firstChild;
		if (firstChild)	{
			document.body.insertBefore(this.mask, document.body.firstChild);
		} else {
			document.body.appendChild(this.mask);
		}
	}
};

/**
* Hides the modality mask.
* @method hideMask
*/
YAHOO.widget.Panel.prototype.hideMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		this.mask.style.display = "none";
		this.hideMaskEvent.fire();
		YAHOO.util.Dom.removeClass(document.body, "masked");
	}
};

/**
* Shows the modality mask.
* @method showMask
*/
YAHOO.widget.Panel.prototype.showMask = function() {
	if (this.cfg.getProperty("modal") && this.mask) {
		YAHOO.util.Dom.addClass(document.body, "masked");
		this.sizeMask();
		this.mask.style.display = "block";
		this.showMaskEvent.fire();
	}
};

/**
* Sets the size of the modality mask to cover the entire scrollable area of the document
* @method sizeMask
*/
YAHOO.widget.Panel.prototype.sizeMask = function() {
	if (this.mask) {
		this.mask.style.height = YAHOO.util.Dom.getDocumentHeight()+"px";
		this.mask.style.width = YAHOO.util.Dom.getDocumentWidth()+"px";
	}
};

/**
* Renders the Panel by inserting the elements that are not already in the main Panel into their correct places. Optionally appends the Panel to the specified node prior to the render's execution. NOTE: For Panels without existing markup, the appendToNode argument is REQUIRED. If this argument is ommitted and the current element is not present in the document, the function will return false, indicating that the render was a failure.
* @method render
* @param {String}	appendToNode	The element id to which the Module should be appended to prior to rendering <em>OR</em>
* @param {HTMLElement}	appendToNode	The element to which the Module should be appended to prior to rendering
* @return {boolean} Success or failure of the render
*/
YAHOO.widget.Panel.prototype.render = function(appendToNode) {
	return YAHOO.widget.Panel.superclass.render.call(this, appendToNode, this.innerElement);
};

/**
* Removes the Panel element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Panel.prototype.destroy = function() {

    YAHOO.widget.Overlay.windowResizeEvent.unsubscribe(this.sizeMask, this);

    if(this.close) {
    
        YAHOO.util.Event.purgeElement(this.close);

    }

    YAHOO.widget.Panel.superclass.destroy.call(this);  

};

/**
* Returns a String representation of the object.
* @method toString
* @return {String} The string representation of the Panel.
*/
YAHOO.widget.Panel.prototype.toString = function() {
	return "Panel " + this.id;
};
/**
* Dialog is an implementation of Panel that can be used to submit form data. Built-in functionality for buttons with event handlers is included, and button sets can be build dynamically, or the preincluded ones for Submit/Cancel and OK/Cancel can be utilized. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class Dialog
* @extends YAHOO.widget.Panel
* @constructor
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.Dialog, YAHOO.widget.Panel);

/**
* Constant representing the default CSS class used for a Dialog
* @property YAHOO.widget.Dialog.CSS_DIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.Dialog.CSS_DIALOG = "yui-dialog";

/**
* Constant representing the name of the Dialog's events
* @property YAHOO.widget.Dialog._EVENT_TYPES
* @private
* @final
* @type Object
*/
YAHOO.widget.Dialog._EVENT_TYPES = {

	"BEFORE_SUBMIT": "beforeSubmit",
	"SUBMIT": "submit",
	"MANUAL_SUBMIT": "manualSubmit",
	"ASYNC_SUBMIT": "asyncSubmit",
	"FORM_SUBMIT": "formSubmit",
	"CANCEL": "cancel"

};

/**
* Constant representing the Dialog's configuration properties
* @property YAHOO.widget.Dialog._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.Dialog._DEFAULT_CONFIG = {

	"POST_METHOD": { 
	   key: "postmethod", 
	   value: "async" 
    },

	"BUTTONS": { 
	   key: "buttons", 
	   value: "none" 
    }

};

/**
* Initializes the class's configurable properties which can be changed using the Dialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.Dialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.Dialog.superclass.initDefaultConfig.call(this);

	/**
	* The internally maintained callback object for use with the Connection utility
	* @property callback
	* @type Object
	*/
	this.callback = {
		/**
		* The function to execute upon success of the Connection submission
		* @property callback.success
		* @type Function
		*/
		success : null,
		/**
		* The function to execute upon failure of the Connection submission
		* @property callback.failure
		* @type Function
		*/
		failure : null,
		/**
		* The arbitraty argument or arguments to pass to the Connection callback functions
		* @property callback.argument
		* @type Object
		*/
		argument: null
	};

	// Add form dialog config properties //
	
	var DEFAULT_CONFIG = YAHOO.widget.Dialog._DEFAULT_CONFIG;
	
	/**
	* The method to use for posting the Dialog's form. Possible values are "async", "form", and "manual".
	* @config postmethod
	* @type String
	* @default async
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.POST_METHOD.key, 
                {
                    handler: this.configPostMethod, 
                    value: DEFAULT_CONFIG.POST_METHOD.value, 
                    validator: function(val) {
                        if (val != "form" && val != "async" && val != "none" && val != "manual") {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }
            );

	/**
	* Object literal(s) defining the buttons for the Dialog's footer.
	* @config buttons
	* @type Object[]
	* @default "none"
	*/
	this.cfg.addProperty(
	           DEFAULT_CONFIG.BUTTONS.key,
	           {
	               handler: this.configButtons,
	               value: DEFAULT_CONFIG.BUTTONS.value
               }
           );	
	
};

/**
* Initializes the custom events for Dialog which are fired automatically at appropriate times by the Dialog class.
* @method initEvents
*/
YAHOO.widget.Dialog.prototype.initEvents = function() {
	YAHOO.widget.Dialog.superclass.initEvents.call(this);

    var EVENT_TYPES = YAHOO.widget.Dialog._EVENT_TYPES;

	/**
	* CustomEvent fired prior to submission
	* @event beforeSumitEvent
	*/	
	this.beforeSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.BEFORE_SUBMIT, this);
	
	/**
	* CustomEvent fired after submission
	* @event submitEvent
	*/
	this.submitEvent		= new YAHOO.util.CustomEvent(EVENT_TYPES.SUBMIT, this);

	/**
	* CustomEvent fired prior to manual submission
	* @event manualSubmitEvent
	*/
	this.manualSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.MANUAL_SUBMIT, this);

	/**
	* CustomEvent fired prior to asynchronous submission
	* @event asyncSubmitEvent
	*/	
	this.asyncSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.ASYNC_SUBMIT, this);

	/**
	* CustomEvent fired prior to form-based submission
	* @event formSubmitEvent
	*/
	this.formSubmitEvent	= new YAHOO.util.CustomEvent(EVENT_TYPES.FORM_SUBMIT, this);

	/**
	* CustomEvent fired after cancel
	* @event cancelEvent
	*/
	this.cancelEvent		= new YAHOO.util.CustomEvent(EVENT_TYPES.CANCEL, this);
};

/**
* The Dialog initialization method, which is executed for Dialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the Dialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the Dialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this Dialog. See configuration documentation for more details.
*/
YAHOO.widget.Dialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.Dialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.Dialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.Dialog.CSS_DIALOG);

	this.cfg.setProperty("visible", false);

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.showEvent.subscribe(this.focusFirst, this, true);
	this.beforeHideEvent.subscribe(this.blurButtons, this, true);

	this.beforeRenderEvent.subscribe(function() {
		var buttonCfg = this.cfg.getProperty("buttons");
		if (buttonCfg && buttonCfg != "none") {
			if (! this.footer) {
				this.setFooter("");
			}
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.Dialog);
};

/**
* Performs the submission of the Dialog form depending on the value of "postmethod" property.
* @method doSubmit
*/
YAHOO.widget.Dialog.prototype.doSubmit = function() {
	var pm = this.cfg.getProperty("postmethod");
	switch (pm) {
		case "async":
			var method = this.form.getAttribute("method") || 'POST';
			method = method.toUpperCase();
			YAHOO.util.Connect.setForm(this.form);
			var cObj = YAHOO.util.Connect.asyncRequest(method, this.form.getAttribute("action"), this.callback);
			this.asyncSubmitEvent.fire();
			break;
		case "form":
			this.form.submit();
			this.formSubmitEvent.fire();
			break;
		case "none":
		case "manual":
			this.manualSubmitEvent.fire();
			break;
	}
};

/**
* @method _onFormKeyDown
* @description "keydown" event handler for the dialog's form.
* @protected
* @param {Event} p_oEvent Object representing the DOM event object passed 
* back by the event utility (YAHOO.util.Event).
*/
YAHOO.widget.Dialog.prototype._onFormKeyDown = function(p_oEvent) {

    var oTarget = YAHOO.util.Event.getTarget(p_oEvent),
        nCharCode = YAHOO.util.Event.getCharCode(p_oEvent);

    if (
        nCharCode == 13 && 
        oTarget.tagName && 
        oTarget.tagName.toUpperCase() == "INPUT"
    ) {

        var sType = oTarget.type;

        if(
            sType == "text" || sType == "password" || sType == "checkbox" || 
            sType == "radio" || sType == "file"
        ) {

            // Fire the "click" event on the dialog's default button
            this.defaultHtmlButton.click();
        
        }

    }

};

/**
* Prepares the Dialog's internal FORM object, creating one if one is not currently present.
* @method registerForm
*/
YAHOO.widget.Dialog.prototype.registerForm = function() {
	var form = this.element.getElementsByTagName("form")[0];

	if (! form) {
		var formHTML = "<form name=\"frm_" + this.id + "\" action=\"\"></form>";
		this.body.innerHTML += formHTML;
		form = this.element.getElementsByTagName("form")[0];
	}

	this.firstFormElement = function() {
		for (var f=0;f<form.elements.length;f++ ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.lastFormElement = function() {
		for (var f=form.elements.length-1;f>=0;f-- ) {
			var el = form.elements[f];
			if (el.focus && ! el.disabled) {
				if (el.type && el.type != "hidden") {
					return el;
				}
			}
		}
		return null;
	}();

	this.form = form;

    if(this.form && (this.browser == "ie" || this.browser == "ie7" || this.browser == "gecko")) {

        YAHOO.util.Event.addListener(this.form, "keydown", this._onFormKeyDown, null, this);
    
    }


	if (this.cfg.getProperty("modal") && this.form) {

		var me = this;

		var firstElement = this.firstFormElement || this.firstButton;
		if (firstElement) {
			this.preventBackTab = new YAHOO.util.KeyListener(firstElement, { shift:true, keys:9 }, {fn:me.focusLast, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventBackTab.enable, this.preventBackTab, true);
			this.hideEvent.subscribe(this.preventBackTab.disable, this.preventBackTab, true);
		}

		var lastElement = this.lastButton || this.lastFormElement;
		if (lastElement) {
			this.preventTabOut = new YAHOO.util.KeyListener(lastElement, { shift:false, keys:9 }, {fn:me.focusFirst, scope:me, correctScope:true} );
			this.showEvent.subscribe(this.preventTabOut.enable, this.preventTabOut, true);
			this.hideEvent.subscribe(this.preventTabOut.disable, this.preventTabOut, true);
		}
	}
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* The default event handler fired when the "close" property is changed. The method controls the appending or hiding of the close icon at the top right of the Dialog.
* @method configClose
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configClose = function(type, args, obj) {
	var val = args[0];

	var doCancel = function(e, obj) {
		obj.cancel();
	};

	if (val) {
		if (! this.close) {
			this.close = document.createElement("div");
			YAHOO.util.Dom.addClass(this.close, "container-close");

			this.close.innerHTML = "&#160;";
			this.innerElement.appendChild(this.close);
			YAHOO.util.Event.addListener(this.close, "click", doCancel, this);
		} else {
			this.close.style.display = "block";
		}
	} else {
		if (this.close) {
			this.close.style.display = "none";
		}
	}
};

/**
* The default event handler for the "buttons" configuration property
* @method configButtons
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configButtons = function(type, args, obj) {
	var buttons = args[0];
	if (buttons != "none") {
		this.buttonSpan = null;
		this.buttonSpan = document.createElement("span");
		this.buttonSpan.className = "button-group";

		for (var b=0;b<buttons.length;b++) {
			var button = buttons[b];

			var htmlButton = document.createElement("button");
			htmlButton.setAttribute("type", "button");

			if (button.isDefault) {
				htmlButton.className = "default";
				this.defaultHtmlButton = htmlButton;
			}

			htmlButton.appendChild(document.createTextNode(button.text));
			YAHOO.util.Event.addListener(htmlButton, "click", button.handler, this, true);

			this.buttonSpan.appendChild(htmlButton);
			button.htmlButton = htmlButton;

			if (b === 0) {
				this.firstButton = button.htmlButton;
			}

			if (b == (buttons.length-1)) {
				this.lastButton = button.htmlButton;
			}

		}

		this.setFooter(this.buttonSpan);

		this.cfg.refireEvent("iframe");
		this.cfg.refireEvent("underlay");
	} else { // Do cleanup
		if (this.buttonSpan) {
			if (this.buttonSpan.parentNode) {
				this.buttonSpan.parentNode.removeChild(this.buttonSpan);
			}

			this.buttonSpan = null;
			this.firstButton = null;
			this.lastButton = null;
			this.defaultHtmlButton = null;
		}
	}
};


/**
* The default event handler used to focus the first field of the form when the Dialog is shown.
* @method focusFirst
*/
YAHOO.widget.Dialog.prototype.focusFirst = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	if (this.firstFormElement) {
		this.firstFormElement.focus();
	} else {
		this.focusDefaultButton();
	}
};

/**
* Sets the focus to the last button in the button or form element in the Dialog
* @method focusLast
*/
YAHOO.widget.Dialog.prototype.focusLast = function(type,args,obj) {
	if (args) {
		var e = args[1];
		if (e) {
			YAHOO.util.Event.stopEvent(e);
		}
	}

	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		this.focusLastButton();
	} else {
		if (this.lastFormElement) {
			this.lastFormElement.focus();
		}
	}
};

/**
* Sets the focus to the button that is designated as the default. By default, his handler is executed when the show event is fired.
* @method focusDefaultButton
*/
YAHOO.widget.Dialog.prototype.focusDefaultButton = function() {
	if (this.defaultHtmlButton) {
		this.defaultHtmlButton.focus();
	}
};

/**
* Blurs all the html buttons
* @method blurButtons
*/
YAHOO.widget.Dialog.prototype.blurButtons = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.blur();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusFirstButton
*/
YAHOO.widget.Dialog.prototype.focusFirstButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[0].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* Sets the focus to the first button in the button list
* @method focusLastButton
*/
YAHOO.widget.Dialog.prototype.focusLastButton = function() {
	var buttons = this.cfg.getProperty("buttons");
	if (buttons && buttons instanceof Array) {
		var html = buttons[buttons.length-1].htmlButton;
		if (html) {
			html.focus();
		}
	}
};

/**
* The default event handler for the "postmethod" configuration property
* @method configPostMethod
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.Dialog.prototype.configPostMethod = function(type, args, obj) {
	var postmethod = args[0];

	this.registerForm();
	YAHOO.util.Event.addListener(this.form, "submit", function(e) {
														YAHOO.util.Event.stopEvent(e);
														this.submit();
														this.form.blur();
													  }, this, true);
};

// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Built-in function hook for writing a validation function that will be checked for a "true" value prior to a submit. This function, as implemented by default, always returns true, so it should be overridden if validation is necessary.
* @method validate
*/
YAHOO.widget.Dialog.prototype.validate = function() {
	return true;
};

/**
* Executes a submit of the Dialog followed by a hide, if validation is successful.
* @method submit
*/
YAHOO.widget.Dialog.prototype.submit = function() {
	if (this.validate()) {
		this.beforeSubmitEvent.fire();
		this.doSubmit();
		this.submitEvent.fire();
		this.hide();
		return true;
	} else {
		return false;
	}
};

/**
* Executes the cancel of the Dialog followed by a hide.
* @method cancel
*/
YAHOO.widget.Dialog.prototype.cancel = function() {
	this.cancelEvent.fire();
	this.hide();
};

/**
* Returns a JSON-compatible data structure representing the data currently contained in the form.
* @method getData
* @return {Object} A JSON object reprsenting the data of the current form.
*/
YAHOO.widget.Dialog.prototype.getData = function() {

    var oForm = this.form;

    if(oForm) {

        var aElements = oForm.elements,
            nTotalElements = aElements.length,
            oData = {},
            sName,
            oElement,
            nElements;

        for(var i=0; i<nTotalElements; i++) {

            sName = aElements[i].name;

            function isFormElement(p_oElement) {
            
                var sTagName = p_oElement.tagName.toUpperCase();
                
                return (
                    (
                        sTagName == "INPUT" || 
                        sTagName == "TEXTAREA" || 
                        sTagName == "SELECT"
                    ) && 
                    p_oElement.name == sName
                );

            }

            /*
                Using "YAHOO.util.Dom.getElementsBy" to safeguard
                user from JS errors that result from giving a form field (or 
                set of fields) the same name as a native method of a form 
                (like "submit") or a DOM collection (such as the "item" method).
                Originally tried accessing fields via the "namedItem" method of 
                the "element" collection, but discovered that it won't return
                a collection of fields in Gecko.
            */

            oElement = YAHOO.util.Dom.getElementsBy(isFormElement, "*", oForm);
            nElements = oElement.length;

            if(nElements > 0) {

                if(nElements == 1) {

                    oElement = oElement[0];

                    var sType = oElement.type,
                        sTagName = oElement.tagName.toUpperCase();

                    switch(sTagName) {

                        case "INPUT":

                            if(sType == "checkbox") {

                                oData[sName] = oElement.checked;

                            }
                            else if(sType != "radio") {

                                oData[sName] = oElement.value;

                            }

                        break;

                        case "TEXTAREA":

                            oData[sName] = oElement.value;

                        break;

                        case "SELECT":

                            var aOptions = oElement.options,
                                nOptions = aOptions.length,
                                aValues = [],
                                oOption,
                                sValue;


                            for(var n=0; n<nOptions; n++) {

                                oOption = aOptions[n];

                                if(oOption.selected) {

                                    sValue = oOption.value;

                                    if(!sValue || sValue === "") {

                                        sValue = oOption.text;

                                    }

                                    aValues[aValues.length] = sValue;

                                }

                            }

                            oData[sName] = aValues;

                        break;

                    }


                }
                else {

                    var sType = oElement[0].type;

                    switch(sType) {

                        case "radio":

                            var oRadio;

                            for(var n=0; n<nElements; n++) {

                                oRadio = oElement[n];

                                if(oRadio.checked) {

                                    oData[sName] = oRadio.value;
                                    break;

                                }

                            }

                        break;

                        case "checkbox":

                            var aValues = [],
                                oCheckbox;

                            for(var n=0; n<nElements; n++) {

                                oCheckbox = oElement[n];

                                if(oCheckbox.checked) {

                                    aValues[aValues.length] = oCheckbox.value;

                                }

                            }

                            oData[sName] = aValues;

                        break;

                    }

                }

            }

        }

    }


    return oData;

};

/**
* Removes the Panel element from the DOM and sets all child elements to null.
* @method destroy
*/
YAHOO.widget.Dialog.prototype.destroy = function() {

    var Event = YAHOO.util.Event,
        oForm = this.form,
        oFooter = this.footer;

    if(oFooter) {

        var aButtons = oFooter.getElementsByTagName("button");

        if(aButtons && aButtons.length > 0) {

            var i = aButtons.length - 1;
            
            do {
            
                Event.purgeElement(aButtons[i], false, "click");
            
            }
            while(i--);
        
        }

    }
    

    if(oForm) {
       
        Event.purgeElement(oForm);

        this.body.removeChild(oForm);
        
        this.form = null;

    }

    YAHOO.widget.Dialog.superclass.destroy.call(this);  

};

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the Dialog
*/
YAHOO.widget.Dialog.prototype.toString = function() {
	return "Dialog " + this.id;
};
/**
* SimpleDialog is a simple implementation of Dialog that can be used to submit a single value. Forms can be processed in 3 ways -- via an asynchronous Connection utility call, a simple form POST or GET, or manually.
* @namespace YAHOO.widget
* @class SimpleDialog
* @extends YAHOO.widget.Dialog
* @constructor
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.constructor.call(this, el, userConfig);
};

YAHOO.extend(YAHOO.widget.SimpleDialog, YAHOO.widget.Dialog);

/**
* Constant for the standard network icon for a blocking action
* @property YAHOO.widget.SimpleDialog.ICON_BLOCK
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_BLOCK = "blckicon";

/**
* Constant for the standard network icon for alarm
* @property YAHOO.widget.SimpleDialog.ICON_ALARM
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_ALARM = "alrticon";

/**
* Constant for the standard network icon for help
* @property YAHOO.widget.SimpleDialog.ICON_HELP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_HELP  = "hlpicon";

/**
* Constant for the standard network icon for info
* @property YAHOO.widget.SimpleDialog.ICON_INFO
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_INFO  = "infoicon";

/**
* Constant for the standard network icon for warn
* @property YAHOO.widget.SimpleDialog.ICON_WARN
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_WARN  = "warnicon";

/**
* Constant for the standard network icon for a tip
* @property YAHOO.widget.SimpleDialog.ICON_TIP
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.ICON_TIP   = "tipicon";

/**
* Constant representing the default CSS class used for a SimpleDialog
* @property YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG
* @static
* @final
* @type String
*/
YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG = "yui-simple-dialog";

/**
* Constant representing the SimpleDialog's configuration properties
* @property YAHOO.widget.SimpleDialog._DEFAULT_CONFIG
* @private
* @final
* @type Object
*/
YAHOO.widget.SimpleDialog._DEFAULT_CONFIG = {

    "ICON": { 
        key: "icon", 
        value:"none", 
        suppressEvent:true  
    },

    "TEXT": { 
        key: "text", 
        value:"", 
        suppressEvent:true, 
        supercedes:["icon"] 
    }

};

/**
* Initializes the class's configurable properties which can be changed using the SimpleDialog's Config object (cfg).
* @method initDefaultConfig
*/
YAHOO.widget.SimpleDialog.prototype.initDefaultConfig = function() {
	YAHOO.widget.SimpleDialog.superclass.initDefaultConfig.call(this);

	// Add dialog config properties //

    var DEFAULT_CONFIG = YAHOO.widget.SimpleDialog._DEFAULT_CONFIG;

	/**
	* Sets the informational icon for the SimpleDialog
	* @config icon
	* @type String
	* @default "none"
	*/
	this.cfg.addProperty(
                DEFAULT_CONFIG.ICON.key,
                {
                    handler: this.configIcon,
                    value: DEFAULT_CONFIG.ICON.value,
                    suppressEvent: DEFAULT_CONFIG.ICON.suppressEvent
                }
            );

	/**
	* Sets the text for the SimpleDialog
	* @config text
	* @type String
	* @default ""
	*/
    this.cfg.addProperty(
                DEFAULT_CONFIG.TEXT.key,	
                { 
                    handler: this.configText, 
                    value: DEFAULT_CONFIG.TEXT.value, 
                    suppressEvent: DEFAULT_CONFIG.TEXT.suppressEvent, 
                    supercedes: DEFAULT_CONFIG.TEXT.supercedes 
                } 
            );

};


/**
* The SimpleDialog initialization method, which is executed for SimpleDialog and all of its subclasses. This method is automatically called by the constructor, and  sets up all DOM references for pre-existing markup, and creates required markup if it is not already present.
* @method init
* @param {String}	el	The element ID representing the SimpleDialog <em>OR</em>
* @param {HTMLElement}	el	The element representing the SimpleDialog
* @param {Object}	userConfig	The configuration object literal containing the configuration that should be set for this SimpleDialog. See configuration documentation for more details.
*/
YAHOO.widget.SimpleDialog.prototype.init = function(el, userConfig) {
	YAHOO.widget.SimpleDialog.superclass.init.call(this, el/*, userConfig*/);  // Note that we don't pass the user config in here yet because we only want it executed once, at the lowest subclass level

	this.beforeInitEvent.fire(YAHOO.widget.SimpleDialog);

	YAHOO.util.Dom.addClass(this.element, YAHOO.widget.SimpleDialog.CSS_SIMPLEDIALOG);

	this.cfg.queueProperty("postmethod", "manual");

	if (userConfig) {
		this.cfg.applyConfig(userConfig, true);
	}

	this.beforeRenderEvent.subscribe(function() {
		if (! this.body) {
			this.setBody("");
		}
	}, this, true);

	this.initEvent.fire(YAHOO.widget.SimpleDialog);

};
/**
* Prepares the SimpleDialog's internal FORM object, creating one if one is not currently present, and adding the value hidden field.
* @method registerForm
*/
YAHOO.widget.SimpleDialog.prototype.registerForm = function() {
	YAHOO.widget.SimpleDialog.superclass.registerForm.call(this);
	this.form.innerHTML += "<input type=\"hidden\" name=\"" + this.id + "\" value=\"\"/>";
};

// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Fired when the "icon" property is set.
* @method configIcon
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configIcon = function(type,args,obj) {
	var icon = args[0];
	if (icon && icon != "none") {
		var iconHTML = "";
		if (icon.indexOf(".") == -1) {
			iconHTML = "<span class=\"yui-icon " + icon +"\" >&#160;</span>";
		} else {
			iconHTML = "<img src=\"" + this.imageRoot + icon + "\" class=\"yui-icon\" />";
		}
		this.body.innerHTML = iconHTML + this.body.innerHTML;
	}
};

/**
* Fired when the "text" property is set.
* @method configText
* @param {String} type	The CustomEvent type (usually the property name)
* @param {Object[]}	args	The CustomEvent arguments. For configuration handlers, args[0] will equal the newly applied value for the property.
* @param {Object} obj	The scope object. For configuration handlers, this will usually equal the owner.
*/
YAHOO.widget.SimpleDialog.prototype.configText = function(type,args,obj) {
	var text = args[0];
	if (text) {
		this.setBody(text);
		this.cfg.refireEvent("icon");
	}
};
// END BUILT-IN PROPERTY EVENT HANDLERS //

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the SimpleDialog
*/
YAHOO.widget.SimpleDialog.prototype.toString = function() {
	return "SimpleDialog " + this.id;
};
/**
* ContainerEffect encapsulates animation transitions that are executed when an Overlay is shown or hidden.
* @namespace YAHOO.widget
* @class ContainerEffect
* @constructor
* @param {YAHOO.widget.Overlay}	overlay		The Overlay that the animation should be associated with
* @param {Object}	attrIn		The object literal representing the animation arguments to be used for the animate-in transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {Object}	attrOut		The object literal representing the animation arguments to be used for the animate-out transition. The arguments for this literal are: attributes(object, see YAHOO.util.Anim for description), duration(Number), and method(i.e. YAHOO.util.Easing.easeIn).
* @param {HTMLElement}	targetElement	Optional. The target element that should be animated during the transition. Defaults to overlay.element.
* @param {class}	Optional. The animation class to instantiate. Defaults to YAHOO.util.Anim. Other options include YAHOO.util.Motion.
*/
YAHOO.widget.ContainerEffect = function(overlay, attrIn, attrOut, targetElement, animClass) {
	if (! animClass) {
		animClass = YAHOO.util.Anim;
	}

	/**
	* The overlay to animate
	* @property overlay
	* @type YAHOO.widget.Overlay
	*/
	this.overlay = overlay;
	/**
	* The animation attributes to use when transitioning into view
	* @property attrIn
	* @type Object
	*/
	this.attrIn = attrIn;
	/**
	* The animation attributes to use when transitioning out of view
	* @property attrOut
	* @type Object
	*/
	this.attrOut = attrOut;
	/**
	* The target element to be animated
	* @property targetElement
	* @type HTMLElement
	*/
	this.targetElement = targetElement || overlay.element;
	/**
	* The animation class to use for animating the overlay
	* @property animClass
	* @type class
	*/
	this.animClass = animClass;
};

/**
* Initializes the animation classes and events.
* @method init
*/
YAHOO.widget.ContainerEffect.prototype.init = function() {
	this.beforeAnimateInEvent = new YAHOO.util.CustomEvent("beforeAnimateIn", this);
	this.beforeAnimateOutEvent = new YAHOO.util.CustomEvent("beforeAnimateOut", this);

	this.animateInCompleteEvent = new YAHOO.util.CustomEvent("animateInComplete", this);
	this.animateOutCompleteEvent = new YAHOO.util.CustomEvent("animateOutComplete", this);

	this.animIn = new this.animClass(this.targetElement, this.attrIn.attributes, this.attrIn.duration, this.attrIn.method);
	this.animIn.onStart.subscribe(this.handleStartAnimateIn, this);
	this.animIn.onTween.subscribe(this.handleTweenAnimateIn, this);
	this.animIn.onComplete.subscribe(this.handleCompleteAnimateIn, this);

	this.animOut = new this.animClass(this.targetElement, this.attrOut.attributes, this.attrOut.duration, this.attrOut.method);
	this.animOut.onStart.subscribe(this.handleStartAnimateOut, this);
	this.animOut.onTween.subscribe(this.handleTweenAnimateOut, this);
	this.animOut.onComplete.subscribe(this.handleCompleteAnimateOut, this);
};

/**
* Triggers the in-animation.
* @method animateIn
*/
YAHOO.widget.ContainerEffect.prototype.animateIn = function() {
	this.beforeAnimateInEvent.fire();
	this.animIn.animate();
};

/**
* Triggers the out-animation.
* @method animateOut
*/
YAHOO.widget.ContainerEffect.prototype.animateOut = function() {
	this.beforeAnimateOutEvent.fire();
	this.animOut.animate();
};

/**
* The default onStart handler for the in-animation.
* @method handleStartAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateIn = function(type, args, obj) { };
/**
* The default onTween handler for the in-animation.
* @method handleTweenAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateIn = function(type, args, obj) { };
/**
* The default onComplete handler for the in-animation.
* @method handleCompleteAnimateIn
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateIn = function(type, args, obj) { };

/**
* The default onStart handler for the out-animation.
* @method handleStartAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleStartAnimateOut = function(type, args, obj) { };
/**
* The default onTween handler for the out-animation.
* @method handleTweenAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleTweenAnimateOut = function(type, args, obj) { };
/**
* The default onComplete handler for the out-animation.
* @method handleCompleteAnimateOut
* @param {String} type	The CustomEvent type
* @param {Object[]}	args	The CustomEvent arguments
* @param {Object} obj	The scope object
*/
YAHOO.widget.ContainerEffect.prototype.handleCompleteAnimateOut = function(type, args, obj) { };

/**
* Returns a string representation of the object.
* @method toString
* @return {String}	The string representation of the ContainerEffect
*/
YAHOO.widget.ContainerEffect.prototype.toString = function() {
	var output = "ContainerEffect";
	if (this.overlay) {
		output += " [" + this.overlay.toString() + "]";
	}
	return output;
};

/**
* A pre-configured ContainerEffect instance that can be used for fading an overlay in and out.
* @method FADE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.FADE = function(overlay, dur) {
	var fade = new YAHOO.widget.ContainerEffect(overlay, { attributes:{opacity: {from:0, to:1}}, duration:dur, method:YAHOO.util.Easing.easeIn }, { attributes:{opacity: {to:0}}, duration:dur, method:YAHOO.util.Easing.easeOut}, overlay.element );

	fade.handleStartAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");

		if (! obj.overlay.underlay) {
			obj.overlay.cfg.refireEvent("underlay");
		}

		if (obj.overlay.underlay) {
			obj.initialUnderlayOpacity = YAHOO.util.Dom.getStyle(obj.overlay.underlay, "opacity");
			obj.overlay.underlay.style.filter = null;
		}

		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible");
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 0);
	};

	fade.handleCompleteAnimateIn = function(type,args,obj) {
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");

		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}

		if (obj.overlay.underlay) {
			YAHOO.util.Dom.setStyle(obj.overlay.underlay, "opacity", obj.initialUnderlayOpacity);
		}

		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	fade.handleStartAnimateOut = function(type, args, obj) {
		YAHOO.util.Dom.addClass(obj.overlay.element, "hide-select");

		if (obj.overlay.underlay) {
			obj.overlay.underlay.style.filter = null;
		}
	};

	fade.handleCompleteAnimateOut =  function(type, args, obj) {
		YAHOO.util.Dom.removeClass(obj.overlay.element, "hide-select");
		if (obj.overlay.element.style.filter) {
			obj.overlay.element.style.filter = null;
		}
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");
		YAHOO.util.Dom.setStyle(obj.overlay.element, "opacity", 1);

		obj.overlay.cfg.refireEvent("iframe");

		obj.animateOutCompleteEvent.fire();
	};

	fade.init();
	return fade;
};


/**
* A pre-configured ContainerEffect instance that can be used for sliding an overlay in and out.
* @method SLIDE
* @static
* @param {Overlay}	overlay	The Overlay object to animate
* @param {Number}	dur	The duration of the animation
* @return {ContainerEffect}	The configured ContainerEffect object
*/
YAHOO.widget.ContainerEffect.SLIDE = function(overlay, dur) {
	var x = overlay.cfg.getProperty("x") || YAHOO.util.Dom.getX(overlay.element);
	var y = overlay.cfg.getProperty("y") || YAHOO.util.Dom.getY(overlay.element);

	var clientWidth = YAHOO.util.Dom.getClientWidth();
	var offsetWidth = overlay.element.offsetWidth;

	var slide = new YAHOO.widget.ContainerEffect(overlay, {
															attributes:{ points: { to:[x, y] } },
															duration:dur,
															method:YAHOO.util.Easing.easeIn
														},
														{
															attributes:{ points: { to:[(clientWidth+25), y] } },
															duration:dur,
															method:YAHOO.util.Easing.easeOut
														},
														overlay.element,
														YAHOO.util.Motion);


	slide.handleStartAnimateIn = function(type,args,obj) {
		obj.overlay.element.style.left = (-25-offsetWidth) + "px";
		obj.overlay.element.style.top  = y + "px";
	};

	slide.handleTweenAnimateIn = function(type, args, obj) {


		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var currentX = pos[0];
		var currentY = pos[1];

		if (YAHOO.util.Dom.getStyle(obj.overlay.element, "visibility") == "hidden" && currentX < x) {
			YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "visible");
		}

		obj.overlay.cfg.setProperty("xy", [currentX,currentY], true);
		obj.overlay.cfg.refireEvent("iframe");
	};

	slide.handleCompleteAnimateIn = function(type, args, obj) {
		obj.overlay.cfg.setProperty("xy", [x,y], true);
		obj.startX = x;
		obj.startY = y;
		obj.overlay.cfg.refireEvent("iframe");
		obj.animateInCompleteEvent.fire();
	};

	slide.handleStartAnimateOut = function(type, args, obj) {
		var vw = YAHOO.util.Dom.getViewportWidth();

		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var yso = pos[1];

		var currentTo = obj.animOut.attributes.points.to;
		obj.animOut.attributes.points.to = [(vw+25), yso];
	};

	slide.handleTweenAnimateOut = function(type, args, obj) {
		var pos = YAHOO.util.Dom.getXY(obj.overlay.element);

		var xto = pos[0];
		var yto = pos[1];

		obj.overlay.cfg.setProperty("xy", [xto,yto], true);
		obj.overlay.cfg.refireEvent("iframe");
	};

	slide.handleCompleteAnimateOut = function(type, args, obj) {
		YAHOO.util.Dom.setStyle(obj.overlay.element, "visibility", "hidden");

		obj.overlay.cfg.setProperty("xy", [x,y]);
		obj.animateOutCompleteEvent.fire();
	};

	slide.init();
	return slide;
};
YAHOO.register("container", YAHOO.widget.Module, {version: "2.2.1", build: "193"});
