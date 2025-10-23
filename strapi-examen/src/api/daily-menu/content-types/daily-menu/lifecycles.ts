import { VAT_RATE, PLATE_TYPES } from '../../../../constants/index';
import { errors } from '@strapi/utils';
const { ValidationError } = errors;
import {RelationField, MenuData, EventParams, Event} from '../../../../type/index'


export default {
  async beforeCreate(event: Event) {
    await validatePlateTypes(event);
    await updateTotalPrices(event);
  },

  async beforeUpdate(event: Event) {
    await validatePlateTypes(event);
    await updateTotalPrices(event);
  },
};

async function validatePlateTypes(event: Event) {
  const { data } = event.params;

  const getId = (relation?: RelationField | number | null): number | null => {
    if (!relation) return null;
    if (typeof relation === 'number') return relation;
    if ('connect' in relation && Array.isArray(relation.connect) && relation.connect[0]?.id)
      return relation.connect[0].id;
    if ('set' in relation && Array.isArray(relation.set) && relation.set[0]?.id)
      return relation.set[0].id;
    if ('id' in relation && typeof relation.id === 'number') return relation.id;
    return null;
  };

  const firstId = getId(data.firstPlate);
  const secondId = getId(data.secondPlate);
  const thirdId = getId(data.dessert);

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
      throw new ValidationError(`Plate with ID ${plateId} assigned to '${fieldName}' not found.`);
    }

    if (plate.type !== expectedType) {
      throw new ValidationError(
        `Plate '${plate.name}' (ID ${plateId}) assigned to '${fieldName}' must be of type '${expectedType}', but is '${plate.type}'.`
      );
    }
  }

  await Promise.all([
    checkPlateType(firstId, PLATE_TYPES.FIRST, 'firstPlate'),
    checkPlateType(secondId, PLATE_TYPES.SECOND, 'secondPlate'),
    checkPlateType(thirdId, PLATE_TYPES.DESSERT, 'dessert'),
  ]);
}

async function calculateTotalPriceWithoutVAT(firstPrice: number, secondPrice: number, thirdPrice: number): Promise<number> {
  const totalPrice = firstPrice + secondPrice + thirdPrice;
  return Number(totalPrice.toFixed(2));
}

async function calculateTotalPriceWithVAT(totalPriceWithoutVAT: number): Promise<number> {
  const totalPriceWithVAT = totalPriceWithoutVAT * (1 + VAT_RATE);
  return Number(totalPriceWithVAT.toFixed(2));
}

async function updateTotalPrices(event: Event) {
  const { data, where } = event.params;

  const menuId = where?.id;

  const getId = (relation?: RelationField | number | null): number | null => {
    if (!relation) return null;
    if (typeof relation === 'number') return relation;
    if ('connect' in relation && Array.isArray(relation.connect) && relation.connect[0]?.id)
      return relation.connect[0].id;
    if ('set' in relation && Array.isArray(relation.set) && relation.set[0]?.id)
      return relation.set[0].id;
    if ('id' in relation && typeof relation.id === 'number') return relation.id;
    return null;
  };

  const firstId = getId(data.firstPlate);
  const secondId = getId(data.secondPlate);
  const thirdId = getId(data.dessert);

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

    const totalPriceWithoutVAT = await calculateTotalPriceWithoutVAT(firstPrice, secondPrice, thirdPrice);
    const totalPriceWithVAT = await calculateTotalPriceWithVAT(totalPriceWithoutVAT);

    data.priceWithOutIVA = totalPriceWithoutVAT;
    data.priceIVA = totalPriceWithVAT;
  } catch (err) {
    console.error('Error during manual price calculation:', err);
  }
}
