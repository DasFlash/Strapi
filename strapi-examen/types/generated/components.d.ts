import type { Schema, Struct } from '@strapi/strapi';

export interface AllergenAllergen extends Struct.ComponentSchema {
  collectionName: 'components_allergen_allergens';
  info: {
    displayName: 'allergen';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'allergen.allergen': AllergenAllergen;
    }
  }
}
