/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */
class GenericExpressionTreeAntiPattern {}

import {
  AbstractExpressionTree,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../src";

type PredicateContent = any;
/**
 * ANTI PATTERN: - Using traditional Duck Punch
 *
 *
 *  In building subtree (other trees), one solution is to Duck Punch.
 *  This may not work in our case as the prototype chain is used to build specialize trees.
 *  EG, Instantiation routines may require the overridden methods of the specialized.
 *
 *
 * The are a few methods to overcome this limitation. One is what we call Invert Duck Punch.
 * Essentially, create an instance of the specialized class and create an instance of the
 * GenericExpressionTree. Then, assign certain private properties generalized instance to the
 * specialized instance.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class PredicateTreeAntiPattern extends GenericExpressionTreeAntiPattern<PredicateContent> {
  /**
   * alternative fromPojo - do not use
   *
   */
  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P extends object ? P : never>
  ): PredicateTreeAntiPattern {
    const newPredicateTree = new GenericExpressionTreeAntiPattern();

    // so the reason this won't work is 'AbstractExpressionTree.fromPojo' will call
    // class defined on that class and not this (PredicateTree) class
    const tree = AbstractExpressionTree.fromPojo(
      srcPojoTree as any,
      transform as any
    );

    // @ts-ignore
    newPredicateTree._incrementor = tree._incrementor;
    // @ts-ignore
    newPredicateTree._rootNodeId = tree._rootNodeId;
    // @ts-ignore
    newPredicateTree._nodeDictionary = tree._nodeDictionary;
    return newPredicateTree;
  }
}
