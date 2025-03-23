# Predicate Tree POJO Import Export

One of the most important features of Predicate Tree is the ability to import and export POJO.

_POJO_ - Plain Old JavaScript Object. It's the term used in this project to indicate the serialized form of a Predicate Tree. Because Predicate Trees are generic typed we can't really define POJO for an implementation. But its understood that a Pojo Documents is a Object comprised of unique keys and nodeContentWrapper for value.

```json
{
  "blueSkyDemo": {
    "parentId": null,
    "nodeContent": {
      "operator": "$or"
    }
  },
  "blueSkyDemo:0": {
    "parentId": "blueSkyDemo",
    "nodeContent": {
      "subjectId": "lastName",
      "operator": "$eq",
      "value": "Flintstone"
    }
  },
  "blueSkyDemo:0": {
    "parentId": "blueSkyDemo",
    "nodeContent": {
      "subjectId": "lastName",
      "operator": "$eq",
      "value": "Flintstone"
    }
  }
}
```

#### Things to note

- The root's parentId is null
- The 'nodeContent' (T) is the most general definition of the nodeContent `Pojo<T>`.
  In our case nodeContent (Type T) would be {subjectId, operator, value} with each having their own restrictions.
- Several Trees have their own validation rules (Expression Trees generally do not allow single children where as Directed Graph is very flexible about node content)
