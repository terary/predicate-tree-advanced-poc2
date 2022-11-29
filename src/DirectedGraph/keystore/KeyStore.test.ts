import { KeyStore } from "./KeyStore";
import { isUUIDv4 } from "../../common/utilities/isFunctions";
import { KeyStoreError } from "./KeyStoreError";
import { keys, reverse } from "lodash";

describe("KeyStore", () => {
  describe(".allKeys", () => {
    it("Should return allKeys", () => {
      const keyStore = new KeyStore<string>();
      const key0 = keyStore.putValue("MY_VALUE");
      const key1 = keyStore.putValue("MY_VALUE");

      expect(keyStore.allKeys()).toEqual([key0, key1]);
    });
  });

  describe(".putValue()", () => {
    it("Should set value, returning retrieve key", () => {
      const keyStore = new KeyStore<string>();
      const key = keyStore.putValue("MY_VALUE");
      const value = keyStore.getValue(key);
      expect(value).toEqual("MY_VALUE");
      expect(isUUIDv4(key)).toStrictEqual(true);
    });

    it("Should accept custom key (Bring Your Own Key)", () => {
      const keyStore = new KeyStore<string>();
      const customKey = keyStore.putValue("MY_VALUE", "_MY_CUSTOM_KEY_");
      const value = keyStore.getValue(customKey);
      expect(value).toEqual("MY_VALUE");
      expect(customKey).toStrictEqual("_MY_CUSTOM_KEY_");
    });
    it("Should throw 'KeyStoreError' if key already exists", () => {
      const keyStore = new KeyStore<string>();
      const key = keyStore.putValue("MY_VALUE", "_MY_CUSTOM_KEY_");

      const willThrow = () => {
        keyStore.putValue("MY_VALUE", "_MY_CUSTOM_KEY_");
      };

      expect(willThrow).toThrow(
        new KeyStoreError(
          "Tried to overwrite value, key already exists in store. (use .replaceValue)."
        )
      );

      expect(keyStore.getValue(key)).toEqual("MY_VALUE");
      expect(key).toStrictEqual("_MY_CUSTOM_KEY_");
    });
  }); // describe("setValue",

  describe(".getValue()", () => {
    it("Should return the stored value for a given key", () => {
      const keyStore = new KeyStore<string>();
      const key = keyStore.putValue("MY_VALUE");
      const value = keyStore.getValue(key);
      expect(value).toEqual("MY_VALUE");
    });
    it("Should work for any type of value for a given key. Returns the actual stored value, not a copy", () => {
      const myObject = {
        thisIs: "my object",
        thereAre: "many like it",
        butThis: "object is my object",
      };
      const keyStore = new KeyStore<object>();
      const key = keyStore.putValue(myObject);
      const value = keyStore.getValue(key);
      expect(Object.is(myObject, value)).toStrictEqual(true);

      // because the Object.is(...) above, I am pretty makes this pointless
      // @ts-ignore
      value["newKey"] = "newProperty";
      // @ts-ignore
      expect(value["newKey"]).toStrictEqual(myObject["newKey"]);
    });
    it('Should return "undefined" if there is no value for the given key.', () => {
      const keyStore = new KeyStore<string>();
      const value = keyStore.getValue("DOES_NOT_EXIST");
      expect(value).toBeUndefined();
    });
  }); // describe(".getValue"

  describe(".reverseLookUpExactlyOneOrThrow", () => {
    it("Should throw error if key does not exist", () => {
      const keyStore = new KeyStore<string>();
      // post condition
      const willThrow = () => {
        keyStore.reverseLookUpExactlyOneOrThrow("_DOES_NOT_EXIST_");
      };
      expect(willThrow).toThrow(
        new KeyStoreError(
          "Key: '_DOES_NOT_EXIST_' has 0 matches. Can not determine 1:1 mapping."
        )
      );
    });
  });

  describe(".removeKey()", () => {
    it("Should throw error if key does not exist", () => {
      const keyStore = new KeyStore<string>();

      const someKey = keyStore.putValue("SOME_VALUE");

      // pre condition
      expect(keyStore.getValue(someKey)).toBe("SOME_VALUE");

      // exercise
      keyStore.removeKey(someKey);

      // post condition
      const willThrow = () => {
        keyStore.keyExistsOrThrow(someKey);
      };
      expect(willThrow).toThrow(KeyStoreError);
    });
  });

  describe(".keyExistsOrThrow()", () => {
    it("Should throw error if key does not exist", () => {
      const keyStore = new KeyStore<string>();
      const willThrow = () => {
        keyStore.keyExistsOrThrow("_DOES_NOT_EXIST_");
      };
      expect(willThrow).toThrow(
        new KeyStoreError("Key: '_DOES_NOT_EXIST_' does not exist in store.")
      );
    });
  });

  describe(".reverseLookUp(...)", () => {
    it("Should find all keys whose value are given value. (blueSkies)", () => {
      // setup
      const str0 = "Something0";
      const str1 = "Something1";
      const str2 = "Something2";
      const keyStore = new KeyStore<string>();
      const key0 = keyStore.putValue(str0);
      keyStore.putValue(str1);
      keyStore.putValue(str2);

      // exercise
      const revseLookupKeys = keyStore.reverseLookUp(str0);

      // outcome
      expect(revseLookupKeys.length).toEqual(1);
      expect(revseLookupKeys.includes(key0)).toStrictEqual(true);
    });
    describe("Things that are the same", () => {
      it("Should find all occurances of value ='string'. (string Interning, see google)", () => {
        //https://softwareengineering.stackexchange.com/questions/325811/memory-usage-of-javascript-string-type-with-identical-values
        // setup
        const str0 = "Something";
        const str1 = "Something";
        const str2 = "Something";
        const keyStore = new KeyStore<string>();
        const key0 = keyStore.putValue(str0);
        const key1 = keyStore.putValue(str1);
        const key2 = keyStore.putValue(str2);

        // exercise
        const revseLookupKeys = keyStore.reverseLookUp(str0);

        // outcome
        expect(revseLookupKeys.length).toEqual(3);
        expect(revseLookupKeys.includes(key0)).toStrictEqual(true);
        expect(revseLookupKeys.includes(key1)).toStrictEqual(true);
        expect(revseLookupKeys.includes(key2)).toStrictEqual(true);
      });
      it("Should specific String object and not 'string value'.", () => {
        // setup
        const str0 = new String("Something");
        const str1 = new String("Something");
        const str2 = new String("Something");
        const keyStore = new KeyStore<String>();
        const key0 = keyStore.putValue(str0);
        keyStore.putValue(str1);
        keyStore.putValue(str2);

        // exercise
        const revseLookupKeys = keyStore.reverseLookUp(str0);

        // outcome
        expect(revseLookupKeys.length).toEqual(1);
        expect(revseLookupKeys.includes(key0)).toStrictEqual(true);
      });
      it("Should not find String('somthing') when search for 'somthing.", () => {
        // setup
        const str0 = new String("Something");
        const str1 = new String("Something");
        const str2 = new String("Something");
        const keyStore = new KeyStore<String>();
        const key0 = keyStore.putValue(str0);
        keyStore.putValue(str1);
        keyStore.putValue(str2);

        // exercise
        const revseLookupKeys = keyStore.reverseLookUp("Something");

        // outcome
        expect(revseLookupKeys.length).toEqual(0);
        // expect(revseLookupKeys.includes(key0)).toStrictEqual(true);
      });
      it("Should find all occurances of value ='null'.", () => {
        // setup
        const thing0 = null;
        const thing1 = null;
        const thing2 = null;
        const keyStore = new KeyStore<any>();
        const key0 = keyStore.putValue(thing0);
        const key1 = keyStore.putValue(thing1);
        const key2 = keyStore.putValue(thing2);
        const key3 = keyStore.putValue("something");
        const key4 = keyStore.putValue(undefined);

        // exercise
        const revseLookupKeysNulls = keyStore.reverseLookUp(thing0);

        // outcome
        expect(revseLookupKeysNulls.length).toEqual(3);
        expect(revseLookupKeysNulls).toStrictEqual([key0, key1, key2]);
      });

      it("Should find all occurances of value ='undefined'.", () => {
        // setup
        const thing0 = undefined;
        const thing1 = undefined;
        const thing2 = undefined;
        const keyStore = new KeyStore<any>();
        const key0 = keyStore.putValue(thing0);
        const key1 = keyStore.putValue(thing1);
        const key2 = keyStore.putValue(thing2);
        const key3 = keyStore.putValue("something");
        const key4 = keyStore.putValue(null);

        // exercise
        const revseLookupKeysNulls = keyStore.reverseLookUp(thing0);

        // outcome
        expect(revseLookupKeysNulls.length).toEqual(3);
        expect(revseLookupKeysNulls).toStrictEqual([key0, key1, key2]);
      });
    });
    it("Should find only specific objest at memory address, not indentical. (objects)", () => {
      // setup
      const obj0 = { something: "awesome" };
      const obj1 = { something: "awesome" };
      const obj2 = { something: "awesome" };
      const keyStore = new KeyStore<object>();
      const key0 = keyStore.putValue(obj0);
      keyStore.putValue(obj1);
      keyStore.putValue(obj2);

      // exercise
      const revseLookupKeys = keyStore.reverseLookUp(obj0);

      // outcome
      expect(revseLookupKeys.length).toEqual(1);
      expect(revseLookupKeys.includes(key0)).toStrictEqual(true);
    });
  });

  describe(".keyExists()", () => {
    it("Should return true if the key exist, false otherwise", () => {
      const keyStore = new KeyStore<string>();
      const key = keyStore.putValue("Something");
      expect(keyStore.keyExists("DOES_NOT_EXIST")).toStrictEqual(false);
      expect(keyStore.keyExists(key)).toStrictEqual(true);
    });
  }); // describe(".keyExists()"

  describe(".swapValues(key1, key2)", () => {
    it("Should replace values for (key1,key2).", () => {
      // set up
      const keyStore = new KeyStore<string>();
      const key1 = keyStore.putValue("START_AS_KEY1_FINISH_AS_KEY2");
      const key2 = keyStore.putValue("START_AS_KEY2_FINISH_AS_KEY1");

      // exercise
      keyStore.swapValues(key1, key2);

      // post conditions
      expect(keyStore.getValue(key1)).toEqual("START_AS_KEY2_FINISH_AS_KEY1");
      expect(keyStore.getValue(key2)).toEqual("START_AS_KEY1_FINISH_AS_KEY2");
    });
  });
});
