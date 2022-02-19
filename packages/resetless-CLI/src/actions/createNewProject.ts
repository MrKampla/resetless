import { join } from 'path';
import { copyDirectoryRecursively } from '../utils/copyDirectoryRecursively';

export interface CreateNewProjectOptions {
  language: string;
  template: string;
}

export async function handleCreateNewProjectCommand(
  projectName: string,
  options: CreateNewProjectOptions,
) {
  const projectTemplatePath = join(
    __dirname,
    `../../templates/newProject/${options.template}/${options.language}`,
  );
  const destinationPath = join(process.cwd(), projectName);

  await copyDirectoryRecursively(projectTemplatePath, destinationPath);
}
