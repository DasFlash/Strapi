
/**
 * event controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  // Custom controller method
  async getEventsByTeacher(ctx) {
    const { name } = ctx.params;

    try {
      // Find teacher by name
      const teachers = await strapi.entityService.findMany('api::teacher.teacher', {
        filters: { name },
      });

      if (!teachers.length) {
        return ctx.notFound(`Teacher with name "${name}" not found`);
      }

      const teacherId = teachers[0].id;

      // Find events assigned to this teacher
      const events = await strapi.entityService.findMany('api::event.event', {
        filters: {
          teachers: {
            id: teacherId,
          },
        },
        populate: ['teachers', 'eventDetails'], // Ajusta los campos que quieras poblar
      });

      ctx.body = events;
    } catch (err) {
      ctx.throw(500, 'Failed to fetch events for teacher', { details: err });
    }
  },
}));
