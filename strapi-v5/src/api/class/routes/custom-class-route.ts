export default {
  routes: [
    {
      method: 'POST',
      path: '/classes/assign-teacher',
      handler: 'class.assignTeacherToClass',
      config: {
        auth: false, 
      },
    },
  ],
};
