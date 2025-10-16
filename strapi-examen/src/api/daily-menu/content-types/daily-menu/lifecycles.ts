import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::daily-menu.daily-menu', ({ strapi }) => ({
  async getMenuPlatePrices(menuId: number) {
    const menu = await strapi.entityService.findOne('api::daily-menu.daily-menu', menuId, {
      populate: ['firstPlate', 'plate', 'plate2']
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    return this.calculatePrices(menu);
  },

  async getMenuPlatePricesFromData(data: any) {
    const getPlate = async (relationName: string) => {
      const plateId = data[relationName];
      if (!plateId) return null;
      return await strapi.entityService.findOne('api::plate.plate', plateId);
    };

    const menu = {
      firstPlate: await getPlate('firstPlate'),
      plate: await getPlate('plate'),
      plate2: await getPlate('plate2'),
    };

    return this.calculatePrices(menu);
  },

  calculatePrices(menu: any) {
    const { firstPlate, plate, plate2 } = menu;

    const prices = {
      firstPlatePrice: firstPlate?.price || 0,
      platePrice: plate?.price || 0,
      plate2Price: plate2?.price || 0,
    };

    const totalPriceWithoutVAT = prices.firstPlatePrice + prices.platePrice + prices.plate2Price;
    const VAT_RATE = 0.21;
    const totalPriceWithVAT = totalPriceWithoutVAT * (1 + VAT_RATE);

    return {
      ...prices,
      totalPriceWithoutVAT: Number(totalPriceWithoutVAT.toFixed(2)),
      totalPriceWithVAT: Number(totalPriceWithVAT.toFixed(2)),
    };
  }
}));
