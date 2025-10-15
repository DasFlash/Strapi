import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::class.class', ({ strapi }) => ({
  async assignTeacherToClass(ctx) {
  const { className, teacherName, teacherNames } = ctx.request.body;

  if (!className || (!teacherName && (!teacherNames || teacherNames.length === 0))) {
    return ctx.badRequest('Missing className or teacherName(s)');
  }

  const namesArray = teacherNames 
    ? (Array.isArray(teacherNames) ? teacherNames : [teacherNames])
    : [teacherName];

  try {
    // Buscar clase por título
    const classes = await strapi.entityService.findMany('api::class.class', {
      filters: { title: className },
    });

    if (!classes.length) {
      return ctx.notFound(`Class with name "${className}" not found`);
    }

    const selectedClass = classes[0];

    // Buscar profesores por nombre
    const teachers = await strapi.entityService.findMany('api::teacher.teacher', {
      filters: { name: { $in: namesArray } },
    });

    if (!teachers.length) {
      return ctx.notFound(`No teachers found with given names`);
    }

    const teacherClassService = strapi.service('api::class.class');

    const results = [];

    for (const teacher of teachers) {
      try {
        const result = await teacherClassService.asignarProfesorAClase(teacher.id, selectedClass.id);
        results.push({ teacher: teacher.name, status: 'success', message: result.message });
      } catch (error) {
        results.push({ teacher: teacher.name, status: 'error', message: error.message });
      }
    }

    return ctx.send({ ok: true, results });
  } catch (error) {
    console.error(error);
    return ctx.internalServerError('Failed to assign teachers to class', { error: error.message || error });
  }
  }}
))