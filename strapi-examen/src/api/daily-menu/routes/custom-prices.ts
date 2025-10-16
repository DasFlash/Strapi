// src/api/daily-menu/routes/custom-prices.ts
export default {
  routes: [
    {
      method: 'GET',
    path: '/daily-menus/:id/prices',
    handler: 'daily-menu.getPrices',
    config: {
      policies: [],
    },
    },
  ],
};