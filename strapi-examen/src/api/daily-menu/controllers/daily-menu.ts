/**
 * daily-menu controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::daily-menu.daily-menu', ({ strapi }) => ({
  async getPrices(ctx) {
    const { id } = ctx.params;

    try {
      const prices = await strapi.service('api::daily-menu.daily-menu').getMenuPlatePrices(Number(id));
      ctx.send(prices);
    } catch (error) {
      ctx.throw(404, error.message);
    }
  }
}));

