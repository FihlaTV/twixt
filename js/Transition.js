// Copyright 2018, University of Colorado Boulder

/**
 * An animation that will animate one node out, and another in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Animation = require( 'TWIXT/Animation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var twixt = require( 'TWIXT/twixt' );

  /**
   * @constructor
   * @extends {Animation}
   *
   * NOTE: The nodes' transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value when the transition finishes.
   *
   * @param {Node|null} fromNode // REVIEW: Technically these do not need to be nodes, right?
   * @param {Node|null} toNode
   * @param {Object} config
   */
  function Transition( fromNode, toNode, config ) {
    config = _.extend( {
      // Required {Array.<Object>} TODO doc
      // REVIEW: Doc
      fromTargets: null,
      toTargets: null,

      // Required {function}
      resetNode: null,

      // Optional
      targetOptions: null
    }, config );

    assert && assert( config.fromTargets );
    assert && assert( config.toTargets );
    assert && assert( typeof config.resetNode === 'function' );

    var targetOptions = _.extend( {
      // NOTE: no defaults, but we want it to be an object so we extend anyways
    }, config.targetOptions );

    var targets = [];

    if ( fromNode ) {
      targets = targets.concat( config.fromTargets.map( function( target ) {
        return _.extend( target, {
          object: fromNode
        }, targetOptions );
      } ) );
    }
    if ( toNode ) {
      targets = targets.concat( config.toTargets.map( function( target ) {
        return _.extend( target, {
          object: toNode
        }, targetOptions );
      } ) );
    }

    Animation.call( this, _.extend( {
      targets: targets

      // REVIEW: In general, if we are omitting from the config, use the keys from the extend defaults.
    }, _.omit( config, [ 'targetOptions', 'fromTargets', 'toTargets', 'resetNode' ] ) ) );

    // When this animation ends, reset the values for both nodes
    this.endedEmitter.addListener( function() {
      fromNode && config.resetNode( fromNode );
      toNode && config.resetNode( toNode );
    } );
  }

  twixt.register( 'Transition', Transition );

  inherit( Animation, Transition, {}, {
    /**
     * Creates an animation that slides the `fromNode` out to the left (and the `toNode` in from the right).
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    slideLeft: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'x', bounds.width, true, options );
    },

    /**
     * Creates an animation that slides the `fromNode` out to the right (and the `toNode` in from the left).
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    slideRight: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'x', bounds.width, false, options );
    },

    /**
     * Creates an animation that slides the `fromNode` out to the top (and the `toNode` in from the bottom).
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    slideUp: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'y', bounds.height, true, options );
    },

    /**
     * Creates an animation that slides the `fromNode` out to the bottom (and the `toNode` in from the top).
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    slideDown: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'y', bounds.height, false, options );
    },

    /**
     * Creates a transition that wipes across the screen, moving to the left.
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    wipeLeft: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'maxX', 'minX', options );
    },

    /**
     * Creates a transition that wipes across the screen, moving to the right.
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    wipeRight: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'minX', 'maxX', options );
    },

    /**
     * Creates a transition that wipes across the screen, moving up.
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    wipeUp: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'maxY', 'minY', options );
    },

    /**
     * Creates a transition that wipes across the screen, moving down.
     * @public
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    wipeDown: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'minY', 'maxY', options );
    },

    /**
     * Creates a transition that fades from `fromNode` to `toNode` by varying the opacity of both.
     * @public
     *
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {Object} [options] - Usually specify duration, easing, or other animation attributes.
     * @returns {Transition}
     */
    dissolve: function( fromNode, toNode, options ) {
      options = _.extend( {
        // {number} - Handles gamma correction for the opacity when required
        gamma: 1
      }, options );

      function gammaBlend( a, b, ratio ) {
        return Math.pow( ( 1 - ratio ) * a + ratio * b, options.gamma );
      }

      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: 'opacity',
          from: 1,
          to: 0,
          blend: gammaBlend
        } ],
        toTargets: [ {
          attribute: 'opacity',
          from: 0,
          to: 1,
          blend: gammaBlend
        } ],
        resetNode: function( node ) {
          node.opacity = 1;
        }
      }, options ) );
    },

    /**
     * Creates a sliding transition within the bounds.
     * @private
     *
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {string} attribute - The positional attribute to animate
     * @param {number} size - The size of the animation (for the positional attribute)
     * @param {boolean} reversed - Whether to reverse the animation. By default it goes right/down.
     * @param {Object} [options]
     * @returns {Transition}
     */
    createSlide: function( fromNode, toNode, attribute, size, reversed, options ) {
      var sign = reversed ? -1 : 1;
      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: attribute,
          from: 0,
          to: size * sign
        } ],
        toTargets: [ {
          attribute: attribute,
          from: -size * sign,
          to: 0
        } ],
        resetNode: function( node ) {
          node[ attribute ] = 0;
        }
      }, options ) );
    },

    /**
     * Creates a wiping transition within the bounds.
     * @private
     *
     * @param {Bounds2} bounds
     * @param {Node|null} fromNode
     * @param {Node|null} toNode
     * @param {string} minAttribute - One side of the bounds on the minimal side (where the animation starts)
     * @param {string} maxAttribute - The other side of the bounds (where animation ends)
     * @param {Object} [options]
     * @returns {Transition}
     */
    createWipe: function( bounds, fromNode, toNode, minAttribute, maxAttribute, options ) {
      var fromNodeBounds = bounds.copy();
      var toNodeBounds = bounds.copy();

      fromNodeBounds[ minAttribute ] = bounds[ maxAttribute ];
      toNodeBounds[ maxAttribute ] = bounds[ minAttribute ];

      // We need to apply custom clip area interpolation
      function clipBlend( boundsA, boundsB, ratio ) {
        return Shape.bounds( boundsA.blend( boundsB, ratio ) );
      }

      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: 'clipArea',
          from: bounds,
          to: fromNodeBounds,
          blend: clipBlend
        } ],
        toTargets: [ {
          attribute: 'clipArea',
          from: toNodeBounds,
          to: bounds,
          blend: clipBlend
        } ],
        resetNode: function( node ) {
          node.clipArea = null;
        }
      }, options ) );
    }
  } );

  return Transition;
} );