class Thingy {
  private _name: string;
  constructor(nodeContent: object) {
    // @ts-ignore
    this._name = nodeContent["x"];
  }

  get name() {
    return this._name;
  }
}

// default for rest operator?
const nodeFactory = (operator: string, ...nodeContentItems: object[]) => {
  [];
  return nodeContentItems.map((nodeContent) => {
    return {
      nodeId: Math.random() + ";",
      nodeContent: new Thingy(nodeContent),
    };
  });
};
const [n1, n2] = nodeFactory("$eq", { x: "1" }, { x: "2" });
console.log({ n1, n2 });
