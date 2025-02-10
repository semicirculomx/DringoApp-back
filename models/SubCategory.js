import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const subcategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // Relacionado con la categoría principal
}, { timestamps: true });

const Subcategory = model('Subcategory', subcategorySchema);
export default Subcategory;