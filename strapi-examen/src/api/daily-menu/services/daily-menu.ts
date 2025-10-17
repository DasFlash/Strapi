export default ({ strapi }) => ({
  async getMenuPlatePrices(menuId) {
    const menu = await strapi.entityService.findOne('api::daily-menu.daily-menu', menuId, {
      populate: ['firstPlate', 'plate', 'plate2'],
    });

    if (!menu) {
      throw new Error(`Menu with ID ${menuId} not found`);
    }

    const firstPlatePrice = menu.firstPlate?.price || 0;
    const platePrice = menu.plate?.price || 0;
    const plate2Price = menu.plate2?.price || 0;

    const totalPriceWithoutVAT = firstPlatePrice + platePrice + plate2Price;
    const VAT_RATE = 0.21;
    const totalPriceWithVAT = totalPriceWithoutVAT * (1 + VAT_RATE);

    return {
      firstPlatePrice,
      platePrice,
      plate2Price,
      totalPriceWithoutVAT: Number(totalPriceWithoutVAT.toFixed(2)),
      totalPriceWithVAT: Number(totalPriceWithVAT.toFixed(2)),
    };
  }
});


