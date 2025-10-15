export default {
  routes: [
    {
      method: 'POST',
      path: '/animal/alas',
      handler: 'animal.getAlas',
      config: {
        auth: false,
      },
    },
  ],
};