import form5350841 from "./fs-form/form5350841.json";
import form5353031 from "./fs-form/form5353031.json";
import { checksToPojo } from "./fs-form/util";

import type { TPojoDocument } from "./fs-form/types";
import { AbstractExpressionTree, TGenericNodeContent } from "../../src";
import { AbstractDirectedGraph } from "../../src/DirectedGraph/AbstractDirectedGraph/AbstractDirectedGraph";
import { IDirectedGraph, ITreeVisitor } from "../../src/DirectedGraph/ITree";
type TFieldLogic = {
  isRoot: boolean;
  rootFieldId?: string;
  subjectId?: string;
  fieldId: string;
  // root
  action?: string; // should be show| hide?
  conditional?: string;

  // children
  condition?: "equals";
  option?: {
    all?: string[];
    any?: string[];
  };
  value?: string; // options created by form creator
};

type TPredicateNode = {
  parentId: string;
  nodeContent: any;
};

// type TPredicateDocument = {
//   [fieldId: string]: TPredicateNode;
// };
const convertFieldRootNode = (field: any): TFieldLogic => {
  // const fieldPojo: TPojoDocument = {};
  const fieldId = field.id;
  const logic = field.logic;

  const { action, conditional } = logic;
  return {
    isRoot: true,
    subjectId: fieldId,
    fieldId,
    action,
    conditional,
    rootFieldId: fieldId,
  };
};
const convertFieldLogicCheck = (check: any): TFieldLogic => {
  // const fieldPojo: TPojoDocument = {};
  // const fieldId = field.id;
  // const checks = field.logic.checks;
  // const logic = field.logic;

  // const { action, conditional } = logic;
  const { field, condition, option } = check;

  return {
    isRoot: false,
    fieldId: field,
    condition,
    option,
  };
};

class TestAbstractDirectedGraph extends AbstractDirectedGraph<TFieldLogic> {
  private _rootFieldId!: string;
  private _dependancyFieldIds: string[] = [];
  public getParentNodeId(nodeId: string): string {
    return super.getParentNodeId(nodeId);
  }

  public replaceNodeContent(
    nodeId: string,
    nodeContent: TGenericNodeContent<TFieldLogic>
  ): void {
    if (nodeId === this.rootNodeId) {
      this._rootFieldId = (nodeContent as TFieldLogic).fieldId;
    } else {
      this._dependancyFieldIds.push((nodeContent as TFieldLogic).fieldId);
    }
    super.replaceNodeContent(nodeId, nodeContent);
  }

  get dependancyFieldIds() {
    return this._dependancyFieldIds.slice();
  }

  getDeepDependancyFieldIds(): string[] {
    const allDependancyIds: string[] = this._dependancyFieldIds;
    const subtreeIds = this.getSubtreeIdsAt();
    subtreeIds.forEach((subtreeId) => {
      const subtree = this.getChildContentAt(
        subtreeId
      ) as TestAbstractDirectedGraph;
      allDependancyIds.push(...subtree.dependancyFieldIds);
    });
    return allDependancyIds;
  }

  get rootFieldId(): string {
    return this._rootFieldId;
  }
  //appendChildNodeWithContent()
  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TFieldLogic>
  ): string {
    this._dependancyFieldIds.push((nodeContent as TFieldLogic).fieldId);
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    // can never append root
  }

  isDependancyOf(otherField: TestAbstractDirectedGraph): boolean {
    const o = otherField.rootFieldId;
    return this._dependancyFieldIds.includes(otherField.rootFieldId);
  }
}

const logicArray: any[] = [];
const formTree = new TestAbstractDirectedGraph();

const f0Tree = formTree.createSubtreeAt<TestAbstractDirectedGraph>(
  formTree.rootNodeId
);
f0Tree.replaceNodeContent(
  f0Tree.rootNodeId,
  convertFieldRootNode(form5350841.fields[0])
);
form5350841.fields[0].logic.checks.forEach((logicTerm) => {
  f0Tree.appendChildNodeWithContent(
    f0Tree.rootNodeId,
    convertFieldLogicCheck(logicTerm)
  );
});

const f1Tree = formTree.createSubtreeAt<TestAbstractDirectedGraph>(
  formTree.rootNodeId
);
f1Tree.replaceNodeContent(
  f1Tree.rootNodeId,
  convertFieldRootNode(form5350841.fields[1])
);
form5350841.fields[1].logic.checks.forEach((logicTerm) => {
  f1Tree.appendChildNodeWithContent(
    f1Tree.rootNodeId,
    convertFieldLogicCheck(logicTerm)
  );
});

// const f1DependacyVisitor = new DependancyHarvestVisitor();
// f1Tree.visitAllAt(f1DependacyVisitor);

// const f0DependacyVisitor = new DependancyHarvestVisitor();
// f0Tree.visitAllAt(f0DependacyVisitor);

// const f1Dependancy = f1DependacyVisitor.dependancyIds;
const f2Tree = formTree.createSubtreeAt<TestAbstractDirectedGraph>(
  formTree.rootNodeId
);

f2Tree.replaceNodeContent(
  f2Tree.rootNodeId,
  convertFieldRootNode(form5350841.fields[2])
);
form5350841.fields[2].logic.checks.forEach((logicTerm) => {
  f2Tree.appendChildNodeWithContent(
    f2Tree.rootNodeId,
    convertFieldLogicCheck(logicTerm)
  );
});

console.log({
  treePojo: formTree.toPojoAt(),
  f0Pojo: f0Tree.toPojoAt(),
  f1Pojo: f1Tree.toPojoAt(),
  f2Pojo: f2Tree.toPojoAt(),
  f0PojoDependancyList: f0Tree.dependancyFieldIds,
  f1PojoDependancyList: f1Tree.dependancyFieldIds,
  f2PojoDependancyList: f2Tree.dependancyFieldIds,
  formTreeDependancyList: formTree.dependancyFieldIds,

  f0PojoDeepDependancyList: f0Tree.getDeepDependancyFieldIds(),
  f1PojoDeepDependancyList: f1Tree.getDeepDependancyFieldIds(),
  f2PojoDeepDependancyList: f2Tree.getDeepDependancyFieldIds(),
  formTreeDeepDependancyList: formTree.getDeepDependancyFieldIds(),
});

if (f1Tree.isDependancyOf(f2Tree)) {
  console.log("f1 is a dependancy of f2");
}

if (f2Tree.isDependancyOf(f1Tree)) {
  console.log("f2 is a dependancy of f1");
}

if (f0Tree.isDependancyOf(f1Tree) && !f1Tree.isDependancyOf(f0Tree)) {
  console.log("f1 is a dependancy of f0 but f0 is not a dependancy of f1");
}

if (f1Tree.isDependancyOf(f2Tree) && f2Tree.isDependancyOf(f1Tree)) {
  console.log("F1 and F2 are interdependant");
}
// f0Tree.appendTreeAt(f1Tree.rootNodeId, f0Tree);
// f0Tree.appendTreeAt(f2Tree.rootNodeId, f0Tree);

console.log("Thats all folks");
