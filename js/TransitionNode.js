// Copyright 2018-2020, University of Colorado Boulder

/**
 * Holds content, and can transition to other content with a variety of animations. During a transition, there is always
 * the "from" content that animates out, and the "to" content that animates in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Transition from './Transition.js';
import twixt from './twixt.js';

/**
 * @constructor
 * @extends {Node}
 *
 * NOTE: The content's transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
 * the default value
 *
 * @param {Property.<Bounds2>} boundsProperty - Use visibleBoundsProperty (from the ScreenView) for full-screen
 *                                              transitions. Generally TransitionNode assumes all content, when it has
 *                                              no transform applied, is meant to by laid out within these bounds.
 * @param {Object} [options]
 */
function TransitionNode( boundsProperty, options ) {
  options = merge( {
    // {Node|null} - Optionally may have initial content
    content: null,

    // {boolean} - If true, a clip area will be set to the value of the boundsProperty so that outside content won't
    // be shown.
    useBoundsClip: true,

    // {Array.<Node>} - Any node specified in this array will be added as a permanent child internally, so that
    // transitions to/from it don't incur higher performance penalties. It will instead just be invisible when not
    // involved in a transition. Performance issues were initially noted in
    // https://github.com/phetsims/equality-explorer/issues/75. Additional notes in
    // https://github.com/phetsims/twixt/issues/17.
    cachedNodes: []
  }, options );

  assert && assert( !options.children, 'Children should not be specified, since cachedNodes will be applied' );

  Node.call( this );

  // @private {Property.<Bounds2>}
  this.boundsProperty = boundsProperty;

  // @private {boolean}
  this.useBoundsClip = options.useBoundsClip;

  // @private {Array.<Node>}
  this.cachedNodes = options.cachedNodes;

  // @private {Node|null} - When animating, it is the content that we are animating away from. Otherwise, it holds the
  // main content node.
  this.fromContent = options.content;

  // @private {Node|null} - Holds the content that we are animating towards.
  this.toContent = null;

  this.children = this.cachedNodes;
  for ( let i = 0; i < this.cachedNodes.length; i++ ) {
    const cachedNode = this.cachedNodes[ i ];
    cachedNode.visible = cachedNode === this.fromContent;
  }

  if ( this.fromContent && !_.includes( this.cachedNodes, this.fromContent ) ) {
    this.addChild( this.fromContent );
  }

  // @private {Transition|null} - If we are animating, this will be non-null
  this.transition = null;

  // @private {Node}
  this.paddingNode = new Node();
  this.addChild( this.paddingNode );

  // @private {function}
  this.boundsListener = this.onBoundsChange.bind( this );
  this.boundsProperty.link( this.boundsListener );

  this.mutate( options );
}

twixt.register( 'TransitionNode', TransitionNode );

inherit( Node, TransitionNode, {
  /**
   * Steps forward in time, animating the transition.
   * @public
   *
   * @param {number} dt
   */
  step: function( dt ) {
    this.transition && this.transition.step( dt );
  },

  /**
   * Interrupts the transition, ending it and resetting the animated values.
   * @public
   */
  interrupt: function() {
    this.transition && this.transition.stop();
  },

  /**
   * Called on bounds changes.
   * @private
   *
   * @param {Bounds2} bounds
   */
  onBoundsChange: function( bounds ) {
    this.interrupt();

    if ( this.useBoundsClip ) {
      this.clipArea = Shape.bounds( bounds );
    }

    // Provide a localBounds override so that we take up at least the provided bounds. This makes layout easier so
    // that the TransitionNode always provides consistent bounds with clipping. See
    // https://github.com/phetsims/twixt/issues/15.
    this.paddingNode.localBounds = bounds;
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.slideLeft.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * @returns {Transition} - Available to add end listeners, etc.
   */
  slideLeftTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.slideLeft( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.slideRight.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * @returns {Transition} - Available to add end listeners, etc.
   */
  slideRightTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.slideRight( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.slideUp.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  slideUpTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.slideUp( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.slideDown.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  slideDownTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.slideDown( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeLeft.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  wipeLeftTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.wipeLeft( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeRight.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  wipeRightTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.wipeRight( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeUp.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  wipeUpTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.wipeUp( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeDown.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  wipeDownTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.wipeDown( this.boundsProperty.value, this.fromContent, content, config ) );
  },

  /**
   * Start a transition to replace our content with the new content, using Transition.dissolve.
   * @public
   *
   * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
   * @param {Object} config - Passed as config to the Animation. Usually a duration should be included.
   * * @returns {Transition} - Available to add end listeners, etc.
   */
  dissolveTo: function( content, config ) {
    this.interrupt();
    return this.startTransition( content, Transition.dissolve( this.fromContent, content, config ) );
  },

  /**
   * Starts a transition, and hooks up a listener to handle state changes when it ends.
   * @private
   *
   * @param {Node|null} content
   * @param {Transition} transition
   * @returns {Transition} - Available to add end listeners, etc. (chained)
   */
  startTransition: function( content, transition ) {
    const self = this;

    // Stop animating if we were before
    this.interrupt();

    this.toContent = content;

    if ( content ) {
      if ( _.includes( this.cachedNodes, content ) ) {
        content.visible = true;
      }
      else {
        this.addChild( content );
      }
      assert && assert( this.hasChild( content ),
        'Should always have the content as a child at the start of a transition' );
    }

    this.transition = transition;

    // Simplifies many things if the user can't mess with things while animating.
    if ( this.fromContent ) {
      this.fromContent.pickable = false;
    }
    if ( this.toContent ) {
      this.toContent.pickable = false;
    }

    transition.endedEmitter.addListener( function() {
      if ( self.fromContent ) {
        self.fromContent.pickable = null;
      }
      if ( self.toContent ) {
        self.toContent.pickable = null;
      }

      self.transition = null;

      if ( self.fromContent ) {
        if ( _.includes( self.cachedNodes, self.fromContent ) ) {
          self.fromContent.visible = false;
        }
        else {
          self.removeChild( self.fromContent );
        }
        assert && assert( self.hasChild( self.fromContent ) === _.includes( self.cachedNodes, self.fromContent ),
          'Should have removed the child if it is not included in our cachedNodes' );
      }

      self.fromContent = self.toContent;
      self.toContent = null;
    } );

    transition.start();

    return transition;
  },

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose: function() {
    this.interrupt();
    this.boundsProperty.unlink( this.boundsListener );

    Node.prototype.dispose.call( this );
  }
} );

export default TransitionNode;