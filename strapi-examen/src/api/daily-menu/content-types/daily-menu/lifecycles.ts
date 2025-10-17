

export default {
  async beforeCreate(event: any) {
    await validatePlateTypes(event);
    await updateTotalPrices(event);
  },

  async beforeUpdate(event: any) {
    await validatePlateTypes(event);
    await updateTotalPrices(event);
  },
};

async function validatePlateTypes(event: any) {
  const { data } = event.params;

  const getId = (relation: any) => {
    if (!relation) return null;
    if (Array.isArray(relation.connect) && relation.connect[0]?.id)
      return relation.connect[0].id;
    if (Array.isArray(relation.set) && relation.set[0]?.id)
      return relation.set[0].id;
    if (typeof relation.id === 'number') return relation.id;
    if (typeof relation === 'number') return relation;
    return null;
  };

  const firstId = getId(data.firstPlate);
  const secondId = getId(data.plate);
  const thirdId = getId(data.plate2);

  async function checkPlateType(
    plateId: number | null,
    expectedType: string,
    fieldName: string
  ) {
    if (!plateId) return;

    const plate = await strapi.entityService.findOne('api::plate.plate', plateId, {
      fields: ['type', 'name'],
    });

    if (!plate) {
      throw new Error(`Plate with ID ${plateId} assigned to '${fieldName}' not found.`);
    }

    if (plate.type !== expectedType) {
      throw new Error(
        `Plate '${plate.name}' (ID ${plateId}) assigned to '${fieldName}' must be of type '${expectedType}', but is '${plate.type}'.`
      );
    }
  }

  await Promise.all([
    checkPlateType(firstId, 'first', 'firstPlate'),
    checkPlateType(secondId, 'second', 'plate'),
    checkPlateType(thirdId, 'dessert', 'plate2'),
  ]);
}

async function updateTotalPrices(event: any) {
  const { data, where } = event.params;

  const menuId = where?.id;

  const getId = (relation: any) => {
    if (!relation) return null;
    if (Array.isArray(relation.connect) && relation.connect[0]?.id)
      return relation.connect[0].id;
    if (Array.isArray(relation.set) && relation.set[0]?.id)
      return relation.set[0].id;
    if (typeof relation.id === 'number') return relation.id;
    if (typeof relation === 'number') return relation;
    return null;
  };

  const firstId = getId(data.firstPlate);
  const secondId = getId(data.plate);
  const thirdId = getId(data.plate2);

  if (menuId) {
    try {
      const prices = await strapi
        .service('api::daily-menu.daily-menu')
        .getMenuPlatePrices(menuId);

      data.priceWithOutIVA = prices.totalPriceWithoutVAT;
      data.priceIVA = prices.totalPriceWithVAT;
      return;
    } catch (err) {
      console.error('Error fetching prices from service:', err);
    }
  }

  try {
    const [first, second, third] = await Promise.all([
      firstId
        ? strapi.entityService.findOne('api::plate.plate', firstId, {
            fields: ['price'],
          })
        : null,
      secondId
        ? strapi.entityService.findOne('api::plate.plate', secondId, {
            fields: ['price'],
          })
        : null,
      thirdId
        ? strapi.entityService.findOne('api::plate.plate', thirdId, {
            fields: ['price'],
          })
        : null,
    ]);

    const firstPrice = first?.price || 0;
    const secondPrice = second?.price || 0;
    const thirdPrice = third?.price || 0;

    const totalPriceWithoutVAT = firstPrice + secondPrice + thirdPrice;
    const VAT_RATE = 0.21;
    const totalPriceWithVAT = parseFloat((totalPriceWithoutVAT * (1 + VAT_RATE)).toFixed(2));

    data.priceWithOutIVA = totalPriceWithoutVAT;
    data.priceIVA = totalPriceWithVAT;
  } catch (err) {
    console.error('Error during manual price calculation:', err);
  }
}

