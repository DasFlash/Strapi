/**
 * animal controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::animal.animal', ({ strapi: _strapi }) => ({
    async getAlas(ctx){
        console.log("todas las alas")
        console.log(ctx.request.body)
        return ctx.send({status: 200})

    }
}))
