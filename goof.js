

const rootKey = '_root_';
const delim = ":";
const family = {
  child0: '_root_:0',
  child1: '_root_:1',
  child2: '_root_:2',

  grandChild00: '_root_:0:3',
  grandChild01: '_root_:0:4',
  grandChild02: '_root_:0:5',

  grandChild10: '_root_:1:6',
  grandChild11: '_root_:1:7',
  grandChild12: '_root_:1:8',

  grandChild20: '_root_:2:9',
  grandChild21: '_root_:2:10',
  grandChild22: '_root_:2:11',
}

const makeChildrenRegExp = (nodeId) => {
  return  new RegExp('^' + nodeId + delim + '[\\d]+$');
}
const makeAncestorsRegExp = (nodeId) => {
  return  new RegExp('^' + nodeId);
}



const childRegExp = makeChildrenRegExp('_root_');//  new RegExp('^' + rootKey + delim + '[\\d]+$')
const children = Object.entries(family).filter(([key, value])=>{return childRegExp.test(value)});

console.log({children})
console.log({src: childRegExp.source})

const childrenOfChild1RegExp = makeChildrenRegExp('_root_:1') 
const childrenOfChild1  = Object.entries(family).filter(([key, value])=>{return childrenOfChild1RegExp.test(value)});;
console.log({childrenOfChild1})


const ancestorsRegExp = makeAncestorsRegExp("_root_");
const ancestors   = Object.entries(family).filter(([key, value])=>{return ancestorsRegExp.test(value)});;
console.log({ancestors})


// can I do 
// keyStoreString extends KeyStore<string> {}

// the do revers lookup?
// is it safe to do reverseLookup on Objects, Like if there are huge objects?
// How best to remove ancestors from the keyStore?  If keeping {nodeId: {nodeKey, nodeContent}} - keeping keyStore seems pointless