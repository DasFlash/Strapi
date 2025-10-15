// lifecycles.ts
declare const strapi: any;

async function decrementarClassCount(teacherId: number) {
  if (!teacherId) return;

  const profesor = await strapi.entityService.findOne(
    "api::teacher.teacher",
    teacherId,
    {
      fields: ["classCount"],
    }
  );

  const nuevoCount = Math.max((profesor?.classCount || 0) - 1, 0);

  await strapi.entityService.update("api::teacher.teacher", teacherId, {
    data: { classCount: nuevoCount },
  });
}

async function sincronizarClassCount(teacherId: number) {
  const clases = await strapi.entityService.findMany("api::class.class", {
    filters: { teachers: teacherId },
    fields: ["id"],
    limit: -1,
  });

  await strapi.entityService.update("api::teacher.teacher", teacherId, {
    data: { classCount: clases.length },
  });
}

export default {
  // Guardar los profesores antes de borrar la clase
  async beforeDelete(event: any) {
    const documentId = event.params.where.id;

    if (!documentId) return;

    const clase = await strapi.entityService.findOne(
      "api::class.class",
      documentId,
      {
        populate: ["teachers"],
      }
    );

    // Guardamos los IDs de los profesores en event.state (mejor que event.params)
    event.state = event.state || {};
    event.state.teacherIds = clase.teachers?.map((t: any) => t.id) || [];
  },

  // Usar los IDs guardados para restar 1 al classCount
  async afterDelete(event: any) {
    const teacherIds: number[] = event.state?.teacherIds || [];

    await Promise.all(teacherIds.map((id) => decrementarClassCount(id)));
  },

  async beforeUpdate(event: any) {
    const claseVieja = await strapi.entityService.findOne(
      "api::class.class",
      event.params.where.id,
      {
        populate: ["teachers"],
      }
    );

    event.params.oldTeachers = claseVieja.teachers?.map((t: any) => t.id) || [];
  },

  async afterCreate(event: any) {
    const clase = await strapi.entityService.findOne(
      "api::class.class",
      event.result.id,
      {
        populate: ["teachers"],
      }
    );

    const teacherIds = clase.teachers?.map((t: any) => t.id) || [];
    await Promise.all(teacherIds.map((id) => sincronizarClassCount(id)));
  },

  async afterUpdate(event: any) {
    const antiguosTeacherIds = event.params.oldTeachers || [];

    const claseNueva = await strapi.entityService.findOne(
      "api::class.class",
      event.result.id,
      {
        populate: ["teachers"],
      }
    );

    const nuevosTeacherIds = claseNueva.teachers?.map((t: any) => t.id) || [];

    const agregados = nuevosTeacherIds.filter(
      (id) => !antiguosTeacherIds.includes(id)
    );
    const eliminados = antiguosTeacherIds.filter(
      (id) => !nuevosTeacherIds.includes(id)
    );

    await Promise.all(agregados.map((id) => sincronizarClassCount(id)));
    await Promise.all(eliminados.map((id) => decrementarClassCount(id)));
  },
};
