import * as migration_20260322_233123_initial from './20260322_233123_initial';
import * as migration_20260329_184329_phase1_phase2 from './20260329_184329_phase1_phase2';
import * as migration_20260714_032237_phase1_security_zelle from './20260714_032237_phase1_security_zelle';
import * as migration_20260714_033351_phase1_required_snapshots from './20260714_033351_phase1_required_snapshots';
import * as migration_20260714_035618 from './20260714_035618';
import * as migration_20260714_043004 from './20260714_043004';
import * as migration_20260714_045129 from './20260714_045129';
import * as migration_20260714_051235 from './20260714_051235';
import * as migration_20260714_054208 from './20260714_054208';
import * as migration_20260714_061936_phase_7_events_registration_waitlists from './20260714_061936_phase_7_events_registration_waitlists';
import * as migration_20260714_065657_phase_8_communications_footer from './20260714_065657_phase_8_communications_footer';
import * as migration_20260714_070100_phase_8_footer_content_backfill from './20260714_070100_phase_8_footer_content_backfill';

export const migrations = [
  {
    up: migration_20260322_233123_initial.up,
    down: migration_20260322_233123_initial.down,
    name: '20260322_233123_initial',
  },
  {
    up: migration_20260329_184329_phase1_phase2.up,
    down: migration_20260329_184329_phase1_phase2.down,
    name: '20260329_184329_phase1_phase2',
  },
  {
    up: migration_20260714_032237_phase1_security_zelle.up,
    down: migration_20260714_032237_phase1_security_zelle.down,
    name: '20260714_032237_phase1_security_zelle',
  },
  {
    up: migration_20260714_033351_phase1_required_snapshots.up,
    down: migration_20260714_033351_phase1_required_snapshots.down,
    name: '20260714_033351_phase1_required_snapshots',
  },
  {
    up: migration_20260714_035618.up,
    down: migration_20260714_035618.down,
    name: '20260714_035618',
  },
  {
    up: migration_20260714_043004.up,
    down: migration_20260714_043004.down,
    name: '20260714_043004',
  },
  {
    up: migration_20260714_045129.up,
    down: migration_20260714_045129.down,
    name: '20260714_045129',
  },
  {
    up: migration_20260714_051235.up,
    down: migration_20260714_051235.down,
    name: '20260714_051235',
  },
  {
    up: migration_20260714_054208.up,
    down: migration_20260714_054208.down,
    name: '20260714_054208',
  },
  {
    up: migration_20260714_061936_phase_7_events_registration_waitlists.up,
    down: migration_20260714_061936_phase_7_events_registration_waitlists.down,
    name: '20260714_061936_phase_7_events_registration_waitlists',
  },
  {
    up: migration_20260714_065657_phase_8_communications_footer.up,
    down: migration_20260714_065657_phase_8_communications_footer.down,
    name: '20260714_065657_phase_8_communications_footer',
  },
  {
    up: migration_20260714_070100_phase_8_footer_content_backfill.up,
    down: migration_20260714_070100_phase_8_footer_content_backfill.down,
    name: '20260714_070100_phase_8_footer_content_backfill',
  },
];
