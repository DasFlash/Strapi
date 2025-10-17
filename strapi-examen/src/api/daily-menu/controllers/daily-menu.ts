import { factories } from '@strapi/strapi';
import { Context } from 'koa';

interface PlateCount {
  id: number;
  name: string;
  count: number;
}

export default factories.createCoreController('api::daily-menu.daily-menu', ({ strapi }) => ({
  async getPrices(ctx: Context) {
    const { id } = ctx.params;

    try {
      const prices = await strapi
        .service('api::daily-menu.daily-menu')
        .getMenuPlatePrices(Number(id));

      ctx.send(prices);
    } catch (error: any) {
      ctx.throw(404, error.message);
    }
  },

  // Método para obtener todos los postres (dessert) de los menús diarios
  async getAllDesserts(ctx: Context): Promise<void> {
    try {
      const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        populate: {
          plate2: {
            fields: ['name', 'price'], // Solo queremos estos campos del postre
          },
        },
      });

      const desserts = menus
        .map(menu => {
          const plate2 = (menu as any)?.plate2;
          if (plate2 && typeof plate2 === 'object') {
            return {
              name: plate2.name,
              price: plate2.price,
            };
          }
          return null;
        })
        .filter(Boolean);

      ctx.send(desserts);
    } catch (error: any) {
      ctx.throw(500, 'Error fetching desserts: ' + error.message);
    }
  },

  // Método para filtrar menús por rango de precios
  async getMenusByPriceRange(ctx: Context): Promise<void> {
    try {
      const min = parseFloat(ctx.query.min as string);
      const max = parseFloat(ctx.query.max as string);

      if (isNaN(min) || isNaN(max)) {
        return ctx.throw(400, 'Invalid or missing "min" or "max" query parameters.');
      }

      const filteredMenus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        filters: {
          price: {
            $gte: min,
            $lte: max,
          },
        },
        fields: ['id', 'price'], // Solo id y price
      });

      // Formatear salida para evitar "data" y "attributes"
      const result = filteredMenus.map(menu => ({
        id: menu.id,
        price: menu.price,
      }));

      ctx.body = result;
    } catch (error: any) {
      ctx.throw(500, 'Error filtering menus by price: ' + error.message);
    }
  },

  // Método para obtener el plato que aparece más frecuentemente en cada categoría
  async getMostFrequentPlates(ctx: Context): Promise<void> {
    try {
      // Obtener todos los menús con relaciones pobladas
      const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
        populate: {
          firstPlate: true,
          plate: true,
          plate2: true,
        },
      });

      // Función para contar apariciones de platos en una categoría
      const countPlates = (menus: any[], relationKey: 'firstPlate' | 'plate' | 'plate2'): PlateCount[] => {
        const counts: Record<number, PlateCount> = {};

        menus.forEach(menu => {
          const plate = menu[relationKey];
          if (plate && typeof plate === 'object') {
            const id = plate.id;
            const name = plate.name;
            if (!counts[id]) {
              counts[id] = { id, name, count: 0 };
            }
            counts[id].count += 1;
          }
        });

        return Object.values(counts);
      };

      const firstCounts = countPlates(menus, 'firstPlate');
      const secondCounts = countPlates(menus, 'plate');
      const dessertCounts = countPlates(menus, 'plate2');

      const findMax = (arr: PlateCount[]): PlateCount | null => {
        if (arr.length === 0) return null;
        return arr.reduce((prev, curr) => (curr.count > prev.count ? curr : prev));
      };

      const mostFirst = findMax(firstCounts);
      const mostSecond = findMax(secondCounts);
      const mostDessert = findMax(dessertCounts);

      ctx.body = {
        firstPlate: mostFirst,
        secondPlate: mostSecond,
        dessert: mostDessert,
      };
    } catch (error: any) {
      ctx.throw(500, 'Error computing most frequent plates: ' + error.message);
    }
  },




  
  


  // Otros métodos que tengas aquí...

  // Método para filtrar menús sin ciertos alérgenos
  async getMenusWithoutAllergens(ctx: Context): Promise<void> {
  try {
    const excludedAllergensQuery = ctx.query.excluded as string | undefined;
    if (!excludedAllergensQuery) {
      return ctx.throw(400, 'Missing "excluded" query parameter');
    }

    const excludedAllergens = excludedAllergensQuery
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    // Obtener todos los menús con platos poblados y sus alérgenos
    const menus = await strapi.entityService.findMany('api::daily-menu.daily-menu', {
      populate: {
        firstPlate: { populate: ['allergen'] },
        plate: { populate: ['allergen'] },
        plate2: { populate: ['allergen'] },
      },
    });

    const plateKeys = ['firstPlate', 'plate', 'plate2'];

    const hasExcludedAllergen = (plate: any): boolean => {
      if (!plate) return false;

      const allergens = plate.allergen
        ? Array.isArray(plate.allergen) ? plate.allergen : [plate.allergen]
        : [];

      return allergens.some((allergen: any) => {
        if (!allergen?.name) return false;
        return excludedAllergens.includes(allergen.name.toLowerCase());
      });
    };

    const filteredMenus = menus.filter(menu => {
      return !plateKeys.some(key => {
        // Asegurar que la propiedad exista y tenga valor
        if (!menu[key]) return false;
        return hasExcludedAllergen(menu[key]);
      });
    });

    ctx.send(filteredMenus);
  } catch (error: any) {
    ctx.throw(500, 'Error filtering menus by allergens: ' + error.message);
  }
},







}));








