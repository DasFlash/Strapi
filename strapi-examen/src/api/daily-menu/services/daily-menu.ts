import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::daily-menu.daily-menu', ({ strapi }) => ({
  async getMenuPlatePrices(menuId: number) {
    // Obtener el menú con relaciones pobladas
    const menu = await strapi.entityService.findOne('api::daily-menu.daily-menu', menuId, {
      populate: ['firstPlate', 'plate', 'plate2']
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    const { firstPlate, plate, plate2 } = menu as any;

    const prices = {
      firstPlatePrice: firstPlate?.price || 0,
      platePrice: plate?.price || 0,
      plate2Price: plate2?.price || 0,
    };

    // Calcular suma sin IVA
    const totalPriceWithoutVAT = prices.firstPlatePrice + prices.platePrice + prices.plate2Price;

    // Definir porcentaje de IVA (por ejemplo 21%)
    const VAT_RATE = 0.21;

    // Calcular suma con IVA
    const totalPriceWithVAT = totalPriceWithoutVAT * (1 + VAT_RATE);

    return {
      ...prices,
      totalPriceWithoutVAT: Number(totalPriceWithoutVAT.toFixed(2)),
      totalPriceWithVAT: Number(totalPriceWithVAT.toFixed(2)),
    };
  }
}));


