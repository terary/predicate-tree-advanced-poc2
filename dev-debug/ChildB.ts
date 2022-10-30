import { BaseA } from "./BaseA";

export class ChildB extends BaseA {
  // static whoAmI(): string;
  static whoAmI(child: BaseA): string;
  static whoAmI(child: ChildB): string;
  static whoAmI(child: ChildB): string {
    if (child instanceof ChildB) {
      return "Who am I, ChildB";
    }
    return BaseA.whoAmI(child);

    // if (name === undefined) {
    //   return BaseA.whoAmI();
    // }
    // return "ChildB " + name;
  }
}
