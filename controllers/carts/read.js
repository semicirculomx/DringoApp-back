import Cart from '../../models/Cart.js';

const getCart = async (req, res, next) => {
    const userId = req.user._id;
    try {
        // Asegurarse de eliminar productos nulos directamente en la base de datos
        await Cart.updateOne(
            { user: userId },
            { $pull: { products: { product: null } } }
        );

        // Obtener el carrito actualizado y popular productos válidos
        const cart = await Cart.findOne({ user: userId }).populate('products.product');

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Carro de compras no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            cart,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Ocurrió un error al obtener el carro de compras',
        });
    }
};

export default getCart;

