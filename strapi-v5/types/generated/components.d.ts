import type { Schema, Struct } from '@strapi/strapi';

export interface ClassClassDetails extends Struct.ComponentSchema {
  collectionName: 'components_class_class_details';
  info: {
    displayName: 'class-details';
  };
  attributes: {
    classroom: Schema.Attribute.Text;
    scheduleBegin: Schema.Attribute.Time;
    scheduleEnd: Schema.Attribute.Time;
  };
}

export interface EventEventDetails extends Struct.ComponentSchema {
  collectionName: 'components_event_event_details';
  info: {
    displayName: 'event-details';
  };
  attributes: {
    date: Schema.Attribute.Date;
    hour: Schema.Attribute.Time;
    place: Schema.Attribute.String;
  };
}

export interface ImageGalleryImageGallery extends Struct.ComponentSchema {
  collectionName: 'components_image_gallery_image_galleries';
  info: {
    displayName: 'image-gallery';
  };
  attributes: {
    media: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface LinkListLinkList extends Struct.ComponentSchema {
  collectionName: 'components_link_list_link_lists';
  info: {
    displayName: 'link-list';
  };
  attributes: {
    title: Schema.Attribute.String;
    url: Schema.Attribute.Text;
  };
}

export interface RichContentRichContent extends Struct.ComponentSchema {
  collectionName: 'components_rich_content_rich_contents';
  info: {
    displayName: 'rich-content';
  };
  attributes: {
    richText: Schema.Attribute.Blocks;
  };
}

export interface SubtopicSubtopic extends Struct.ComponentSchema {
  collectionName: 'components_subtopic_subtopics';
  info: {
    displayName: 'subtopic';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface TeacherTeacherDetails extends Struct.ComponentSchema {
  collectionName: 'components_teacher_teacher_details';
  info: {
    displayName: 'teacher-details';
  };
  attributes: {
    experience: Schema.Attribute.Integer;
    specialty: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'class.class-details': ClassClassDetails;
      'event.event-details': EventEventDetails;
      'image-gallery.image-gallery': ImageGalleryImageGallery;
      'link-list.link-list': LinkListLinkList;
      'rich-content.rich-content': RichContentRichContent;
      'subtopic.subtopic': SubtopicSubtopic;
      'teacher.teacher-details': TeacherTeacherDetails;
    }
  }
}
