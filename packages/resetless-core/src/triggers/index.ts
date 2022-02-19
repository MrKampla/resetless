import { Resetless } from '../resetless';

export interface ResetlessTrigger {
  moduleName: string;
  enableTrigger: (_rl: Resetless) => void;
  disableTrigger: (_rl: Resetless) => void;
}
