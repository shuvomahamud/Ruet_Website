import * as migration_20260322_233123_initial from './20260322_233123_initial';
import * as migration_20260329_184329_phase1_phase2 from './20260329_184329_phase1_phase2';

export const migrations = [
  {
    up: migration_20260322_233123_initial.up,
    down: migration_20260322_233123_initial.down,
    name: '20260322_233123_initial',
  },
  {
    up: migration_20260329_184329_phase1_phase2.up,
    down: migration_20260329_184329_phase1_phase2.down,
    name: '20260329_184329_phase1_phase2'
  },
];
