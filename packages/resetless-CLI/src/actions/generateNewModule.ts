import { join } from 'path';
import { copyDirectoryRecursively } from '../utils/copyDirectoryRecursively';

export interface GenerateNewModuleOptions {
  language: string;
}

export async function handleGenerateNewModuleCommand(
  moduleName: string,
  options: GenerateNewModuleOptions,
) {
  const projectTemplatePath = join(
    __dirname,
    `../../templates/module/${options.language}`,
  );
  const destinationPath = join(process.cwd(), moduleName);

  await copyDirectoryRecursively(projectTemplatePath, destinationPath);
}
