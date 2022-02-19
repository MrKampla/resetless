import { Command } from 'commander';

export interface CommandBase {
  load: (program: Command) => void;
}
