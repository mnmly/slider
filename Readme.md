# slider

  really really simple slider component

  ☞ [Demo]( http://mnmly.github.com/slider )

## Installation

    $ component install mnmly/slider


## Usage
 
```javascript
  var options = {
    min: 0,
    max: 100,
    value: 0
  };

  var slider = new Slider( document.querySelector( '#slider' ), options );
  
  // Set the value
  slider.value( 50 );

  // Get the value
  slider.value().should.equal( 50 );

  slider.on( 'change', function( val ){
    console.log( val );
  } );

  slider.on( 'slide', function( val ){
    console.log( val );
  } );
  
```

## API

### Slider::value( val )

When `val` is passed, it will set value, if not, it simply returns the current value.

## Events

- `change`: Triggered when drag ends.
- `slide`: Triggered when dragging.

## License

  MIT
