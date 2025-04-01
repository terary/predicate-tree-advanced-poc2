We will create a standard tree, comprising of a not tree, address tree.

The parent tree will create a javascript matcher function, sqlWhereClause, and human readable explanation of the statements.

We will create the base/parent tree but how we convert from one dialect to another is not yet determined.
Maybe a couple of ways

- transforms toPojoAt/fromPojo
- visitors. Clone one tree, use a visitor to mutate. (we cna have the same routine output all the trees)
- brute-form, simply copy 'toPojoAt' and change as necessary

We need to consider an interface

- ISqlWhereClause
- IJavascriptMatcherFunction
- IHumanReadableExplanation
- ICloneableTree
- ITransformableTree
