interface ThingItem<T> {
  orderValue: number;
}
const theClientTransformer = (thing: Partial<MyThing>) => {
  return {
    objectId: Math.random() + "",
    thing: thing as MyThing,
  };
};

// interface ITree<T> {
interface ITree<T> {
  echo(message: string): string;
  // orderValue: number;
  getObject: (objectId: string) => T | null;
  putObject: (objectId: string, thing: T) => void;
  sort: (order: "ASC" | "DESC") => ITree<T>;
}

type TreeOfThings<T> = ITree<ThingItem<T>>;

type MyThing = {
  myProperty: string;
};

abstract class ATheBase<T> implements ITree<T> {
  protected _baseObjects: { [objectId: string]: T };

  constructor(initialObject?: T) {
    this._baseObjects = {};
    this.putObject(
      "initialObject",
      initialObject || ("No constructor message" as unknown as T)
    );
  }

  getAllKeys() {
    return Object.keys(this._baseObjects);
  }

  getObject(objectId: string): T | null {
    if (this._baseObjects[objectId] === undefined) {
      return null;
    }
    return this._baseObjects[objectId];
  }

  echo(message: string): string {
    return `${new Date().toUTCString()} - ${message}`;
  }

  putObject(objectId: string, thing: T): void {
    this._baseObjects[objectId] = thing;
  }

  sort(order: "ASC" | "DESC"): ITree<T> {
    return this;
  }

  protected static fromPojoAs<P, Q>(
    items: Partial<P>[],
    transform: (thing: Partial<P>) => { objectId: string; thing: P },
    TreeClass: Function
  ): Q {
    // @ts-ignore - not constructable
    const newTree = new TreeClass() as ITree<P>;
    (items || []).forEach((item) => {
      const tuple = transform(item);
      newTree.putObject(tuple.objectId, tuple.thing);
    });
    return newTree as unknown as Q;
  }
}

abstract class AExtendedClass<T> extends ATheBase<T> {
  protected static fromPojo<P, Q>(
    items: Partial<P>[],
    transform: (thing: Partial<P>) => { objectId: string; thing: P },
    TreeClass: Function = AExtendedClass
  ): Q {
    return ATheBase.fromPojoAs<P, Q>(items, transform, TreeClass) as Q;
  }
}

class TheClient extends AExtendedClass<MyThing> {
  private theProperty: MyThing;
  constructor(theProperty: MyThing) {
    super();
    this.theProperty = theProperty || { myProperty: "set default" };
  }

  echo(message: string): string {
    return super.echo(message + " - " + this.theProperty.myProperty);
  }

  public clientsOwnProperty() {
    return "this does not exist on ancestor classes";
  }

  public static fromPojo<P, Q>(
    items: Partial<P>[],
    transform: (thing: Partial<P>) => { objectId: string; thing: P }
    // TreeClass: Function = AExtendedClass
  ): Q {
    return AExtendedClass.fromPojoAs<P, Q>(items, transform, TheClient) as unknown as Q;
  }
}

const client = new TheClient({ myProperty: "the property" });
console.log(client.echo("What"));
const clientFromPojo = TheClient.fromPojo<MyThing, TheClient>(
  [{ myProperty: "thing0" }, { myProperty: "thing1" }],
  theClientTransformer
  // (thing: Partial<MyThing>) => {
  //   return {
  //     objectId: Math.random() + "",
  //     thing: thing as MyThing,
  //   };
  // }
);
console.log(clientFromPojo.clientsOwnProperty());
console.log(clientFromPojo.echo("What"));
console.log(clientFromPojo.getAllKeys());
