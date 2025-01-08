import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true }
}, { timestamps: true });

// Middleware para eliminar productos nulos
cartSchema.pre('save', function (next) {
  this.products = this.products.filter(item => item.product !== null);
  next();
});

// Middleware para eliminar productos nulos al consultar
cartSchema.pre('findOne', async function (next) {
  await this.model.updateOne(this.getFilter(), {
    $pull: { products: { product: null } }
  });
  next();
});

const Cart = model('Cart', cartSchema);

export default Cart;