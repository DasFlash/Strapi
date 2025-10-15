module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/by-teacher/:name',
      handler: 'event.getEventsByTeacher',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};