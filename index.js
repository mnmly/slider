
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

  this.updateBounds();

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
  this.handle.style[transform] = 'translate3d(' + Math.round( x ) + 'px, 0, 0)';
  this._value = this.map( x, this.boundMin, this.boundMax, this.options.min, this.options.max );
}

/**
 * Updates the bounds
 *
 * @api public
 */

Slider.prototype.updateBounds = function() {
  this.boundMin = 0 - ( this.handle.clientWidth / 2 );
  this.boundMax = this.el.clientWidth - this.handle.clientWidth * 0.5;
};
