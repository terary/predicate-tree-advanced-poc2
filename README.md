# predicate-tree-advanced-poc2

Project Documentation Site:
https://terary.github.io/predicate-tree-advanced-poc2/

Content and Structure are completely independent
There should not be mix-use of keys

- dictionary for tree structure
- dictionary for content storage

** You can use the tree to store the keys of the content **
Leave content in dictionary {key: content}
and move the keys around the structure. As the key would be the content of the structure

Because Tree structure operations and content operations are different the interface (Abstract)
should have different operations for both, getContentAt, getNodeAt

- because the structure knows nothing about content, predicateTree constructor will need to accept isJunction function

- minimum functionality
  moveChild
  moveBranch
  moveTree
  mergeBranch?
  fromPojo
  toPojo
  get...
  appendChild
  removeChild
  subtree

If you want separation of concern structure/content you need to break-up the interface.
Don't want things like getNodeAt() exposed to the public

Usability must be a consideration. How does the developer query the tree structure?
How do they build a tree? (What is the syntax)
