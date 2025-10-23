import { factories } from '@strapi/strapi';
import { Context } from 'koa';
import { ERROR_MESSAGES } from '../../../constants/index';
import {Allergen, Plate, DailyMenu, PlateCount} from '../../../type/index'

export default factories.createCoreController('api::daily-menu.daily-menu', ({ strapi }) => ({

  async getPrices(ctx: Context) {
    const { id } = ctx.params;

    try {
      const prices = await strapi
        .service('api::daily-menu.daily-menu')
        .getMenuPlatePrices(Number(id));

      ctx.send(prices);
    } catch {
      ctx.throw(404, ERROR_MESSAGES.PRICES_NOT_FOUND);
    }
  },

 
  async getAllDesserts(ctx: Context): Promise<void> {
    try {
      const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        populate: {
          dessert: {
            fields: ['name', 'price'],
          },
        },
      });

      const typedMenus = menus as DailyMenu[];

      const desserts = typedMenus
        .map(menu => {
          const dessert = menu.dessert;
          return dessert ? { name: dessert.name, price: dessert.price ?? 0 } : null;
        })
        .filter((d): d is { name: string; price: number } => d !== null);

      ctx.send(desserts);
    } catch {
      ctx.throw(500, ERROR_MESSAGES.FETCH_DESSERTS_ERROR);
    }
  },

 
  async getMenusByPriceRange(ctx: Context): Promise<void> {
    try {
      const min = parseFloat(ctx.query.min as string);
      const max = parseFloat(ctx.query.max as string);

      if (isNaN(min) || isNaN(max)) {
        return ctx.throw(400, ERROR_MESSAGES.INVALID_PRICE_QUERY);
      }

      const filteredMenus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        filters: {
          price: { $gte: min, $lte: max },
        },
        fields: ['id', 'price'],
      });

      const result = filteredMenus.map((menu) => ({
        id: menu.id,
        price: menu.price ?? 0,
      }));

      ctx.body = result;
    } catch {
      ctx.throw(500, ERROR_MESSAGES.FILTER_PRICE_ERROR);
    }
  },


  async getMostFrequentPlates(ctx: Context): Promise<void> {
    try {
      const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        populate: {
          firstPlate: true,
          secondPlate: true,
          dessert: true,
        },
      });

      const typedMenus = menus as DailyMenu[];

      const countPlates = (
        menus: DailyMenu[],
        relationKey: keyof Pick<DailyMenu, 'firstPlate' | 'secondPlate' | 'dessert'>
      ): PlateCount[] => {
        const counts: Record<string, PlateCount> = {};

        menus.forEach((menu) => {
          const plate = menu[relationKey];
          if (plate && plate.id && plate.name) {
            const key = plate.id.toString();
            if (!counts[key]) {
              counts[key] = { id: plate.id, name: plate.name, count: 0 };
            }
            counts[key].count += 1;
          }
        });

        return Object.values(counts);
      };

      const findMax = (arr: PlateCount[]): PlateCount | null =>
        arr.length > 0 ? arr.reduce((prev, curr) => (curr.count > prev.count ? curr : prev)) : null;

      ctx.body = {
        firstPlate: findMax(countPlates(typedMenus, 'firstPlate')),
        secondPlate: findMax(countPlates(typedMenus, 'secondPlate')),
        dessert: findMax(countPlates(typedMenus, 'dessert')),
      };
    } catch {
      ctx.throw(500, ERROR_MESSAGES.MOST_FREQUENT_PLATES_ERROR);
    }
  },


  async getMenusWithoutAllergens(ctx: Context): Promise<void> {
    try {
      const excludedAllergensQuery = ctx.query.excluded as string | undefined;
      if (!excludedAllergensQuery) {
        return ctx.throw(400, ERROR_MESSAGES.MISSING_EXCLUDED_PARAM);
      }

      const excludedAllergens = excludedAllergensQuery
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        populate: {
          firstPlate: { populate: ['allergen'] },
          secondPlate: { populate: ['allergen'] },
          dessert: { populate: ['allergen'] },
        },
      });

      const typedMenus = menus as DailyMenu[];

      const hasExcludedAllergen = (plate?: Plate | null): boolean => {
        if (!plate || !plate.allergen) return false;
        return plate.allergen.some((a) => excludedAllergens.includes(a.name.toLowerCase()));
      };

      const filteredMenus = typedMenus.filter((menu) => {
        return !(
          hasExcludedAllergen(menu.firstPlate) ||
          hasExcludedAllergen(menu.secondPlate) ||
          hasExcludedAllergen(menu.dessert)
        );
      });

      ctx.send(filteredMenus);
    } catch {
      ctx.throw(500, ERROR_MESSAGES.FILTER_ALLERGENS_ERROR);
    }
  },
}));












