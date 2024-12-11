import mongoose from 'mongoose';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import { handleCouponUsage } from '../../utils/couponUtils.js';
import { validateCartProducts } from '../../utils/productUtils.js';
import { clearCart } from '../../utils/clearCart.util.js';

const createOrder = async (req, res) => {
    const { cartId, deliveryAddress, paymentMethod, couponId = null, nota } = req.body;
    const userId = req.user._id.toString();

    const session = await mongoose.startSession(); // Start a new session
    session.startTransaction(); // Start the transaction

    try {
        // Validar que el carrito exista
        const cart = await Cart.findById(cartId).session(session); // Use session in queries
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Validar productos y calcular el precio total
        const { validatedProducts, totalPrice: initialTotalPrice } = await validateCartProducts(cart.products);

        let totalPrice = initialTotalPrice;

        // Si hay un cupón, aplicar el descuento correspondiente
        let coupon = null;
        if (couponId) {
            coupon = await handleCouponUsage(couponId, userId);

            if (coupon.discountPercentage && coupon.discountPercentage > 0) {
                totalPrice -= totalPrice * (coupon.discountPercentage / 100);
            } else if (coupon.discountAmount && coupon.discountAmount > 0) {
                totalPrice -= coupon.discountAmount;
            }

            if (totalPrice < 0) totalPrice = 0;
        }

        // Actualizar el stock de los productos
        for (const product of validatedProducts) {
            const updatedProduct = await Product.findByIdAndUpdate(
                product.product,
                { $inc: { stock: -product.quantity } }, // Decrease stock
                { new: true, session } // Use session
            );

            if (!updatedProduct) {
                throw new Error(`Producto no encontrado: ${product.name}`);
            }

            if (updatedProduct.stock < 0) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}`);
            }
        }

        // Crear la orden
        const newOrder = new Order({
            user: userId,
            products: validatedProducts,
            totalPrice,
            deliveryAddress,
            paymentMethod,
            coupon: coupon ? {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                discountAmount: coupon.discountAmount
            } : null,
            nota
        });

        await newOrder.save({ session }); // Use session

        // Limpiar el carrito del usuario
        await clearCart(userId, session); // Adjust clearCart to accept session

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        // Rollback any changes
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        return res.status(500).json({ success: false, message: 'Ocurrió un error al crear la orden, por favor intente de nuevo' });
    }
};

export default createOrder;
