import mongoose, { Schema, models, model } from 'mongoose'

export interface CategoryInterface {
  name: string
  _id: string
  parent: string & { name: string; _id: string }
  parentCategory: string
  properties: string
}

const CategorySchema = new Schema({
  name: { type: String, require: true },
  parent: { type: mongoose.Types.ObjectId, ref: 'Category' }
})

export const Category = models?.Category || model('Category', CategorySchema)
