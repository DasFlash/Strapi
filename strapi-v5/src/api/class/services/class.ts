/**
 * class service
 */
declare const strapi: any;

const MAX_CLASSES_PER_TEACHER = 5;
const MAX_TEACHERS_PER_CLASS = 3;

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

async function asignarProfesorAClase(teacherId: number, classId: number) {
  if (!teacherId || !classId) {
    throw new Error("Falta teacherId o classId");
  }

  // Obtener número de clases activas del profesor
  const clasesActivas = await strapi.entityService.findMany("api::class.class", {
    filters: {
      teachers: teacherId,
    },
    fields: ["id"],
    limit: -1,
  });

  if (clasesActivas.length >= MAX_CLASSES_PER_TEACHER) {
    throw new Error(`El profesor ya tiene ${MAX_CLASSES_PER_TEACHER} clases activas.`);
  }

  // Obtener clase actual con profesores asignados
  const clase = await strapi.entityService.findOne("api::class.class", classId, {
    populate: ["teachers"],
  });

  if (!clase) {
    throw new Error("Clase no encontrada");
  }

  const profesoresAsignados = clase.teachers || [];

  if (profesoresAsignados.length >= MAX_TEACHERS_PER_CLASS) {
    throw new Error(`La clase ya tiene ${MAX_TEACHERS_PER_CLASS} profesores asignados.`);
  }

  // Validar que el profesor no esté ya asignado
  const yaAsignado = profesoresAsignados.some((t: any) => t.id === teacherId);
  if (yaAsignado) {
    throw new Error("El profesor ya está asignado a esta clase");
  }

  // Asignar profesor a la clase (agregar relación)
  await strapi.entityService.update("api::class.class", classId, {
    data: {
      teachers: [...profesoresAsignados.map((t: any) => t.id), teacherId],
    },
  });

  // Sincronizar el conteo de clases del profesor (usando función interna)
  await sincronizarClassCount(teacherId);

  // Enviar notificación (puedes crear tu propio servicio de notificaciones)
  await enviarNotificacion(teacherId, classId);

  return { message: "Profesor asignado exitosamente" };
}

async function enviarNotificacion(teacherId: number, classId: number) {
  // Aquí agregas tu lógica para enviar notificaciones, por ejemplo:
  // - Email
  // - Push notification
  // - Mensaje en el sistema

  // Ejemplo simple (ajusta a tu sistema real)
  console.log(`Notificación: Profesor ${teacherId} asignado a clase ${classId}`);
}

export default {
  asignarProfesorAClase,
  sincronizarClassCount, // exportamos también por si la necesitas aparte
};

