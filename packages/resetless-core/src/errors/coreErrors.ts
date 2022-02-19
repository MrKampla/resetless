export class ModuleWithoutCode extends Error {
  constructor() {
    super('Cannot add a module without code');
  }
}

export class NoFunctionReturnedFromModule extends Error {
  constructor() {
    super("Cannot add a module which doesn't return a function");
  }
}

export class ModuleImplementationNotFound extends Error {
  constructor() {
    super('Implementation for requested module not found');
  }
}
