export function isRunWithArguments(process: NodeJS.Process) {
  return process.argv.slice(2).length;
}
