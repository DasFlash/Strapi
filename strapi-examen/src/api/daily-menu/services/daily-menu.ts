export default ({ strapi }) => ({
  async getMenuPlatePrices(menuId) {
    const menu = await strapi.entityService.findOne('api::daily-menu.daily-menu', menuId, {
      populate: ['firstPlate', 'secondPlate', 'dessert'],
    });

    if (!menu) {
      throw new Error(`Menu with ID ${menuId} not found`);
    }

    const firstPlatePrice = menu.firstPlate?.price || 0;
    const secondPlatePrice = menu.secondPlate?.price || 0;
    const dessertPrice = menu.dessert?.price || 0;

    const totalPriceWithoutVAT = firstPlatePrice + secondPlatePrice + dessertPrice;
    const VAT_RATE = 0.21;
    const totalPriceWithVAT = totalPriceWithoutVAT * (1 + VAT_RATE);

    return {
      firstPlatePrice,
      secondPlatePrice,
      dessertPrice,
      totalPriceWithoutVAT: Number(totalPriceWithoutVAT.toFixed(2)),
      totalPriceWithVAT: Number(totalPriceWithVAT.toFixed(2)),
    };
  }
});



