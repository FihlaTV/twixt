// Copyright 2018, University of Colorado Boulder

/**
 * Animation tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Animation = require( 'TWIXT/Animation' );
  const NumberProperty = require( 'AXON/NumberProperty' );

  QUnit.module( 'Animation' );

  QUnit.test( 'basic animation tests', function( assert ) {
    assert.equal( 1, 1, 'sanity check' );

    const numberProperty = new NumberProperty( 0 );

    const targetValue = 7;
    const animation = new Animation( {
      // Options for the Animation as a whole
      duration: 2,

      // Options for the one target to change
      property: numberProperty,
      to: targetValue,

      stepEmitter: null
    } );
    animation.start();
    for ( var i = 0; i < 10; i++ ) {
      animation.step( 0.1 );
    }
    assert.ok( Math.abs( numberProperty.value - targetValue / 2 ) < 1E-6, 'should be halfway there' );
    for ( i = 0; i < 10; i++ ) {
      animation.step( 0.1 );
    }
    assert.ok( Math.abs( numberProperty.value - targetValue ) < 1E-6, 'should be all the way there' );
  } );
} );