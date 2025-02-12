import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const subcategorySchema = new Schema({
    name: { type: String, required: true },
  image: { type: String, required: true },
  description:{type:String, required: true},
}, { timestamps: true });

const Subcategory = model('Subcategory', subcategorySchema);
export default Subcategory;