import * as migration_20260213_071339_add_composite_indexes from './20260213_071339_add_composite_indexes';
import * as migration_20260213_072000_add_composite_indexes from './20260213_072000_add_composite_indexes';
import * as migration_20260213_074055_mark_initial_schema_complete from './20260213_074055_mark_initial_schema_complete';

export const migrations = [
  {
    up: migration_20260213_071339_add_composite_indexes.up,
    down: migration_20260213_071339_add_composite_indexes.down,
    name: '20260213_071339_add_composite_indexes',
  },
  {
    up: migration_20260213_072000_add_composite_indexes.up,
    down: migration_20260213_072000_add_composite_indexes.down,
    name: '20260213_072000_add_composite_indexes',
  },
  {
    up: migration_20260213_074055_mark_initial_schema_complete.up,
    down: migration_20260213_074055_mark_initial_schema_complete.down,
    name: '20260213_074055_mark_initial_schema_complete'
  },
];
