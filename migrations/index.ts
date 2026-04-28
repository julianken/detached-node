import * as migration_20260213_071339_add_composite_indexes from './20260213_071339_add_composite_indexes';
import * as migration_20260213_072000_add_composite_indexes from './20260213_072000_add_composite_indexes';
import * as migration_20260213_074055_mark_initial_schema_complete from './20260213_074055_mark_initial_schema_complete';
import * as migration_20260421_205422_theme_aware_hero_images from './20260421_205422_theme_aware_hero_images';
import * as migration_20260422_022813_featured_image_not_null from './20260422_022813_featured_image_not_null';
import * as migration_20260422_204500_add_posts_theme_field from './20260422_204500_add_posts_theme_field';
import * as migration_20260422_204600_add_posts_seo_fields from './20260422_204600_add_posts_seo_fields';
import * as migration_20260422_204700_add_media_prefix from './20260422_204700_add_media_prefix';
import * as migration_20260424_035219_add_mermaid_block from './20260424_035219_add_mermaid_block';
import * as migration_20260425_202704_add_posts_focal_point from './20260425_202704_add_posts_focal_point';
import * as migration_20260425_220000_add_media_lqip from './20260425_220000_add_media_lqip';
import * as migration_20260428_010142_add_media_preview from './20260428_010142_add_media_preview';

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
    name: '20260213_074055_mark_initial_schema_complete',
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
  {
    up: migration_20260422_204500_add_posts_theme_field.up,
    down: migration_20260422_204500_add_posts_theme_field.down,
    name: '20260422_204500_add_posts_theme_field',
  },
  {
    up: migration_20260422_204600_add_posts_seo_fields.up,
    down: migration_20260422_204600_add_posts_seo_fields.down,
    name: '20260422_204600_add_posts_seo_fields',
  },
  {
    up: migration_20260422_204700_add_media_prefix.up,
    down: migration_20260422_204700_add_media_prefix.down,
    name: '20260422_204700_add_media_prefix',
  },
  {
    up: migration_20260424_035219_add_mermaid_block.up,
    down: migration_20260424_035219_add_mermaid_block.down,
    name: '20260424_035219_add_mermaid_block',
  },
  {
    up: migration_20260425_202704_add_posts_focal_point.up,
    down: migration_20260425_202704_add_posts_focal_point.down,
    name: '20260425_202704_add_posts_focal_point',
  },
  {
    up: migration_20260425_220000_add_media_lqip.up,
    down: migration_20260425_220000_add_media_lqip.down,
    name: '20260425_220000_add_media_lqip',
  },
  {
    up: migration_20260428_010142_add_media_preview.up,
    down: migration_20260428_010142_add_media_preview.down,
    name: '20260428_010142_add_media_preview',
  },
];
