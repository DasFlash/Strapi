export default {
  routes: [
    {
      method: 'GET',
      path: '/api/nuevaApi',
      handler: 'api.contador',
      config: {
        auth: false,
      },
    },
  ],
};