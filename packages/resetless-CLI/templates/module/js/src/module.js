const { asyncDependencyFunc } = require('./moduleDependency');

(() => {
  console.log('Initialization of the module...');
  return async function add(b) {
    return (await asyncDependencyFunc()) + b;
  };
})();
