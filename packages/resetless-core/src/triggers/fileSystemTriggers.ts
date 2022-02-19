import { ResetlessTrigger } from '.';
import { readFile } from 'fs/promises';
import { Resetless } from '../resetless';
import { FSWatcher, watch } from 'chokidar';
import { basename } from 'path';
import chalk from 'chalk';

abstract class FileSystemTrigger implements ResetlessTrigger {
  moduleName: string;
  path: string;
  protected fileWatcher?: FSWatcher;

  constructor({ moduleName, path }: { moduleName: string; path: string }) {
    this.moduleName = moduleName;
    this.path = path;
  }

  enableTrigger(_rl: Resetless) {}

  disableTrigger(_rl: Resetless) {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
  }
}

export class ModuleDirectoryTrigger extends FileSystemTrigger {
  constructor({ path }: { path: string }) {
    super({
      moduleName: '',
      path,
    });
  }

  enableTrigger(rl: Resetless) {
    this.fileWatcher = watch(this.path).on(
      'all',
      async (eventType, detectedChangePath) => {
        if (
          eventType === 'addDir' ||
          eventType === 'unlink' ||
          eventType === 'unlinkDir'
        ) {
          return;
        }

        const moduleNameDerrivedFromFilename =
          basename(detectedChangePath)
            .split('.')
            .at(-2) ?? basename(detectedChangePath); // if filename does not have extension, fall back to just a filename

        if (eventType === 'add') {
          console.log(
            chalk.white.bgGreen.bold('NEW MODULE') +
              ` Detected changes in directory: ${this.path} for file: ${detectedChangePath}, reloading Resetless cache for module: ${moduleNameDerrivedFromFilename}`,
          );
        }
        if (eventType === 'change') {
          console.log(
            chalk.white.bgGreen.bold('MODULE UPDATE') +
              ` Detected changes in directory: ${this.path} for file: ${detectedChangePath}, reloading Resetless cache for module: ${moduleNameDerrivedFromFilename}`,
          );
        }

        rl.addImplementationForModule(
          moduleNameDerrivedFromFilename,
          (await readFile(detectedChangePath)).toString(),
        );
      },
    );
  }
}

export class ModuleFileTrigger extends FileSystemTrigger {
  enableTrigger(rl: Resetless) {
    this.fileWatcher = watch(this.path).on('change', async detectedChangePath => {
      console.log(
        chalk.white.bgGreen.bold('MODULE UPDATE') +
          ` Detected changes in watched file: ${detectedChangePath}, reloading Resetless cache for module: ${this.moduleName}`,
      );

      rl.addImplementationForModule(
        this.moduleName,
        (await readFile(this.path)).toString(),
      );
    });
  }
}
