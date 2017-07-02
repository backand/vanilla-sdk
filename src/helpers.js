export const filter = {
  create: (fieldName, operator, value) => {
    return {
      fieldName,
      operator,
      value
    }
  },
  operators: {
    numeric: { equals: "equals", notEquals: "notEquals", greaterThan: "greaterThan", greaterThanOrEqualsTo: "greaterThanOrEqualsTo", lessThan: "lessThan", lessThanOrEqualsTo: "lessThanOrEqualsTo", empty: "empty", notEmpty: "notEmpty" },
    date: { equals: "equals", notEquals: "notEquals", greaterThan: "greaterThan", greaterThanOrEqualsTo: "greaterThanOrEqualsTo", lessThan: "lessThan", lessThanOrEqualsTo: "lessThanOrEqualsTo", empty: "empty", notEmpty: "notEmpty" },
    text: { equals: "equals", notEquals: "notEquals", startsWith: "startsWith", endsWith: "endsWith", contains: "contains", notContains: "notContains", empty: "empty", notEmpty: "notEmpty" },
    boolean: { equals: "equals" },
    relation: { in: "in" }
  }
}

export const sort = {
  create: (fieldName, order) => {
    return {
      fieldName,
      order
    }
  },
  orders: { asc: "asc", desc: "desc" }
}

export const exclude = {
  options: { metadata: "metadata", totalRows: "totalRows", all: "metadata,totalRows" }
}

export class StorageAbstract {
  constructor() {
    if (this.constructor === StorageAbstract) {
      throw new TypeError("Can not construct abstract class.");
    }
    if (this.setItem === undefined || this.setItem === StorageAbstract.prototype.setItem) {
      throw new TypeError("Must override setItem method.");
    }
    if (this.getItem === undefined || this.getItem === StorageAbstract.prototype.getItem) {
      throw new TypeError("Must override getItem method.");
    }
    if (this.removeItem === undefined || this.removeItem === StorageAbstract.prototype.removeItem) {
      throw new TypeError("Must override removeItem method.");
    }
    if (this.clear === undefined || this.clear === StorageAbstract.prototype.clear) {
      throw new TypeError("Must override clear method.");
    }
    // this.data = {};
  }
  setItem (id, val) {
    throw new TypeError("Do not call abstract method setItem from child.");
    // return this.data[id] = String(val);
  }
  getItem (id) {
    throw new TypeError("Do not call abstract method getItem from child.");
    // return this.data.hasOwnProperty(id) ? this._data[id] : null;
  }
  removeItem (id) {
    throw new TypeError("Do not call abstract method removeItem from child.");
    // delete this.data[id];
    // return null;
   }
  clear () {
    throw new TypeError("Do not call abstract method clear from child.");
    // return this.data = {};
   }
}

export class MemoryStorage extends StorageAbstract{
  constructor (externalStorage) {
    super();
    this.externalStorage = externalStorage;
    this.data = {};
  }
  setItem (id, val) {
    if (this.externalStorage && this.externalStorage.setItem){
      this.externalStorage.setItem(id, val);
    }
    return this.data[id] = String(val);
  }
  getItem (id) {
    if (!this.data.hasOwnProperty(id) && this.externalStorage && this.externalStorage.getItem)
      this.data[id] = this.externalStorage.getItem(id);
    return this.data.hasOwnProperty(id) ? this.data[id] : null;
  }
  removeItem (id) {
    delete this.data[id];
    return null;
  }
  clear () {
    return this.data = {};
  }
}
