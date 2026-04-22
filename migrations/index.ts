import * as migration_20260213_071339_add_composite_indexes from './20260213_071339_add_composite_indexes';
import * as migration_20260213_072000_add_composite_indexes from './20260213_072000_add_composite_indexes';
import * as migration_20260213_074055_mark_initial_schema_complete from './20260213_074055_mark_initial_schema_complete';
import * as migration_20260421_205422_theme_aware_hero_images from './20260421_205422_theme_aware_hero_images';
import * as migration_20260422_022813_featured_image_not_null from './20260422_022813_featured_image_not_null';

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
  {
    up: migration_20260421_205422_theme_aware_hero_images.up,
    down: migration_20260421_205422_theme_aware_hero_images.down,
    name: '20260421_205422_theme_aware_hero_images',
  },
  {
    up: migration_20260422_022813_featured_image_not_null.up,
    down: migration_20260422_022813_featured_image_not_null.down,
    name: '20260422_022813_featured_image_not_null',
  },
];
