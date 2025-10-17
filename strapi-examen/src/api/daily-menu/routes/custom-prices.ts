// src/api/daily-menu/routes/daily-menu.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/daily-menus/desserts',
      handler: 'daily-menu.getAllDesserts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/daily-menus/:id/prices',
      handler: 'daily-menu.getPrices',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/daily-menus/price-range',
      handler: 'daily-menu.getMenusByPriceRange',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/daily-menus/most-frequent-plates',
      handler: 'daily-menu.getMostFrequentPlates',
      config: {
        policies: [],
        middlewares: [],
      },
    },

  
   // src/api/daily-menu/routes/daily-menu.ts




    {
      method: 'GET',
      path: '/daily-menus/filter-no-allergens',
      handler: 'daily-menu.getMenusWithoutAllergens',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },



  
  


  ],
};


