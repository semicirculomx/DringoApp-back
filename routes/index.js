// Importamos el módulo Express
import express from 'express';
import usersRouter from './users.js'; // Enrutador para las rutas de usuarios
import categoriesRouter from './categories.js'
import productsRouter from './products.js';
import cartsRouter from './carts.js'
import couponsRouter from './coupons.js'
import favoritesRouter from './favorites.js'
import paymentsRouter from './payments.js'
import ordersRoutes from './orders.js'
import bannersRoutes from './banners.js'
import utilsRoutes from './utils.js'
// Creamos un nuevo objeto router
const router = express.Router();

router.use('/users', usersRouter); // Usar el enrutador para rutas de usuarios
router.use('/products', productsRouter)
router.use('/categories', categoriesRouter)
router.use('/subcategories', categoriesRouter)
router.use('/carts', cartsRouter)
router.use('/favorites', favoritesRouter)
router.use('/coupons', couponsRouter)
router.use('/payments', paymentsRouter)
router.use('/orders', ordersRoutes)
router.use('/banners', bannersRoutes)
router.use('/utils', utilsRoutes)
// Exportamos el objeto router
export default router;
