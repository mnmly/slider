/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(this, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || require.aliases[index];
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj){
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("gorillatron-extend/index.js", function(module, exports, require){

/*
 * @exports extend
*/

/**
  Extends a set of objects. Merges them into one new object
  @public
  @type Function
  @param {Boolean} deep Should it extend all child objects
  @param []{Object} splat objects to merge
*/
function extend( deep ) {
  var out, objs, i, obj, prop, val

  out = {}

  typeof deep === "boolean" ? ( objs = [].slice.call(arguments, 1), deep = deep ) :
                              ( objs = [].slice.call(arguments, 0), deep = false )

  for( i = 0; i < objs.length; i++ ) {

    obj = objs[ i ]

    for( prop in obj ) {
      val = obj[ prop ]
      if( deep && typeof val === "object" && typeof out[prop] === "object") {
        out[ prop ] = extend( out[prop], val )
      } else {
        out[ prop ] = val
      }
      
    }
  }

  return out
}


module.exports = extend
});
require.register("component-domify/index.js", function(module, exports, require){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

});
require.register("component-emitter/index.js", function(module, exports, require){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 * 
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = function(event, fn){
  this._callbacks = this._callbacks || {};
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter} 
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


});
require.register("prefixed/index.js", function(module, exports, require){
// Direct port from `Modernizr.prefixed`

/**
 * Create our "modernizr" element that we do most feature tests on.
 */
var mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' ');
    /*>>domprefixes*/
    
/**
 * is returns a boolean for if typeof obj is exactly type.
 */
function is( obj, type ) {
    return typeof obj === type;
}

/**
 * contains returns a boolean for if substr is found within str.
 */
function contains( str, substr ) {
    return !!~('' + str).indexOf(substr);
}

function testProps( props, prefixed ) {
    for ( var i in props ) {
        var prop = props[i];
        if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
            return prefixed == 'pfx' ? prop : true;
        }
    }
    return false;
}
/*>>testprop*/

// TODO :: add testDOMProps
/**
 * testDOMProps is a generic DOM property test; if a browser supports
 *   a certain property, it won't return undefined for it.
 */
function testDOMProps( props, obj, elem ) {
    for ( var i in props ) {
        var item = obj[props[i]];
        if ( item !== undefined) {

            // return the property name as a string
            if (elem === false) return props[i];

            // let's bind a function (and it has a bind method -- certain native objects that report that they are a
            // function don't [such as webkitAudioContext])
            if (is(item, 'function') && 'bind' in item){
              // default to autobind unless override
              return item.bind(elem || obj);
            }

            // return the unbound function or obj or value
            return item;
        }
    }
    return false;
}

/*>>testallprops*/
/**
 * testPropsAll tests a list of DOM properties we want to check against.
 *   We specify literally ALL possible (known and/or likely) properties on
 *   the element including the non-vendor prefixed one, for forward-
 *   compatibility.
 */
function testPropsAll( prop, prefixed, elem ) {

    var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
        props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

    // did they call .prefixed('boxSizing') or are we just testing a prop?
    if(is(prefixed, "string") || is(prefixed, "undefined")) {
      return testProps(props, prefixed);

    // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
    } else {
      props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
      return testDOMProps(props, prefixed, elem);
    }
}
/*>>testallprops*/

function prefixed(prop, obj, elem){
  if(!obj) {
    return testPropsAll(prop, 'pfx');
  } else {
    // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
    return testPropsAll(prop, obj, elem);
  }
};

/*
function cssPrefixed( prop, obj, elem ){
    // If `prop` is hypenated, convert it to camelCase.
    prop = prop.replace( /\-(\w)/g, function( a ){ return a.replace(/\-/, '').toUpperCase() } ),
    var str = prefixed( prop, obj, elem );
    if ( str ) return str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');
    return false;
}*/


/*
 * Expose `prefixed`
 **/

module.exports = prefixed;

});
require.register("slider/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var domify   = require( 'domify' ),
    Emitter  = require( 'emitter' ),
    prefixed = require( 'prefixed' ),
    extend   = require( 'extend' );

/**
 * Expose `Slider`
 */

module.exports = Slider;

/**
 * Some constants and defaults
 */

var transform = prefixed( 'transform' ),
    defaults  = { min:   0,
                  max:   100,
                  value: 0,
                  step:  1 };

/**
 * TODO: Vertical slider
 */

function Slider( el, options ){
  
  Emitter.call( this );
  
  this.el      = el;
  this.handle  = domify( '<div class="handle"/>' )[0];
  this.options = extend( false, defaults, options );
  this.el.className += ' slider';
  this.el.appendChild( this.handle );
  this.bind();

  this.boundMin = 0 - ( this.handle.clientWidth / 2 );
  this.boundMax = this.el.clientWidth - this.handle.clientWidth * 0.5;

  this.value( this.options.value );
}

/**
 * Inherit `Emitter`
 */

Slider.prototype.__proto__ = Emitter.prototype;

/**
 * Bind events
 */

Slider.prototype.bind = function() {
  
  var isTouchable = ( 'ontouchstart' in window ),
      onmousedown = isTouchable ? 'touchstart' : 'mousedown',
      onmousemove = isTouchable ? 'touchmove'  : 'mousemove',
      onmouseup   = isTouchable ? 'touchend'   : 'mouseup';

  this.handle.addEventListener( onmousedown, this.onDragStart.bind( this ), false );
  document.addEventListener( onmousemove, this.onDrag.bind( this ), false );
  document.addEventListener( onmouseup, this.onDragEnd.bind( this ), false );

};

/**
 * On drag start
 *
 * @param { MouseEvent | TouchEvent } e
 */

Slider.prototype.onDragStart = function( e ) {
  
  e = /touch/.test( e.type ) ? e.touches[0] : e;
  this.dragging = true;
  this.downPos = {
    x: (e.clientX - ( this.x || 0 )) - this.el.offsetLeft,
    y: (e.clientY - ( this.y || 0 )) - this.el.offsetTop,
  };
};

/**
 * on drag
 */

Slider.prototype.onDrag = function( e ) {

  e = /touch/.test( e.type ) ? e.touches[0] : e;
  
  if( this.dragging ){
    this.x = e.pageX - this.el.offsetLeft - this.downPos.x;
    if ( this.boundMin > this.x ){
      this.x = this.boundMin;
    } else if ( this.x > this.boundMax ){
      this.x = this.boundMax;
    }

    this.slide( this.x );
    this.emit( 'slide', this._value );
  };
};

/*
 * on drag ends
 */

Slider.prototype.onDragEnd = function( e ) {
  this.dragging = false;
  this.emit( 'change', this._value );
}

/**
 * Maps value to specific range
 *
 * @param { Number } value: value to map
 * @param { Number } istart: minimum input value
 * @param { Number } istop: maximum input value
 * @param { Number } ostart: minimum output value
 * @param { Number } ostop: maximum output value
 * @return { Number } value;
 */

Slider.prototype.map = function(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};


/**
 * Getter and setter for slider value
 * 
 * @param { Number } val
 * @api public
 */

Slider.prototype.value = function( val ) {

  if( typeof val !== 'undefined' ){
    
    this.x = this.map( val, this.options.min, this.options.max, this.boundMin, this.boundMax );
    this.slide( this.x );
  }
  return this._value;
}

/**
 * Slides the handle
 *
 * @param { Number } x
 * @api private
 */

Slider.prototype.slide = function( x ) {
  // TODO: maybe top, left, nahhhh
  this.handle.style[transform] = 'translate3d(' + x + 'px, 0, 0)';
  this._value = this.map( x, this.boundMin, this.boundMax, this.options.min, this.options.max );
}

});
require.alias("gorillatron-extend/index.js", "slider/deps/extend/index.js");

require.alias("component-domify/index.js", "slider/deps/domify/index.js");

require.alias("component-emitter/index.js", "slider/deps/emitter/index.js");

require.alias("prefixed/index.js", "slider/deps/prefixed/index.js");
