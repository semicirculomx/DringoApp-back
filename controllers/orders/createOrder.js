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

    let updatedProducts = []; // Track updated products for rollback

    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        const { validatedProducts, totalPrice: initialTotalPrice } = await validateCartProducts(cart.products);

        let totalPrice = initialTotalPrice;

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

        // Update stock and track changes
        for (const product of validatedProducts) {
            const updatedProduct = await Product.findByIdAndUpdate(
                product.product,
                { $inc: { stock: -product.quantity } },
                { new: true }
            );

            if (!updatedProduct) {
                throw new Error(`Producto no encontrado: ${product.name}`);
            }

            if (updatedProduct.stock < 0) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}`);
            }

            updatedProducts.push({ productId: product.product, quantity: product.quantity });
        }

        // Create the order
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

        await newOrder.save();

        // Clear the cart
        await clearCart(userId);

        return res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error(error);

        // Rollback stock changes
        for (const { productId, quantity } of updatedProducts) {
            await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
        }

        return res.status(500).json({ success: false, message: 'Ocurrió un error al crear la orden, por favor intente de nuevo' });
    }
};

export default createOrder;
