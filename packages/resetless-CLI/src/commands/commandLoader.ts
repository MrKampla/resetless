import { Command } from 'commander';
import { CreateNewProjectCommand } from './createNewProject';
import { GenerateNewModuleCommand } from './generateNewModule';
import { UploadModuleCommand } from './uploadModule';

export default function loadCommands(program: Command) {
  new CreateNewProjectCommand().load(program);
  new GenerateNewModuleCommand().load(program);
  new UploadModuleCommand().load(program);
}
