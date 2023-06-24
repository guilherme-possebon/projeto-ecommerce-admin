import { Product } from '../../../models/Product'
import type { ProductInterface } from '../../../models/Product'
import type { NextApiRequest, NextApiResponse } from 'next'
import { mongooseConnect } from '../../../lib/mongoose'
import { isAdminRequest } from './auth/[...nextauth]'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  await mongooseConnect()
  await isAdminRequest(req, res)

  if (method === 'GET') {
    // verifica o id do produto
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }))
    } else {
      res.json(await Product.find())
    }
  }

  if (method === 'POST') {
    // Possibilita a cração do produto
    const {
      title,
      description,
      price,
      productUrls,
      selectedCategory,
      productProperties
    }: ProductInterface = req.body
    try {
      const productDoc = await Product.create({
        title,
        description,
        price,
        productUrls,
        category: selectedCategory || undefined,
        productProperties
      })
      res.json(productDoc)
    } catch (error) {
      if (error) throw error
      res.status(500).json({ error: 'Failed to create product' })
    }
  }

  if (method === 'PUT') {
    // possibilita a edição do produto
    const {
      title,
      description,
      price,
      _id,
      productUrls,
      selectedCategory,
      productProperties
    }: ProductInterface = req.body
    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        productUrls,
        category: selectedCategory || undefined,
        productProperties
      }
    )
    res.json(true)
  }
  if (method === 'DELETE') {
    // Deleta o produto
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id })
      res.json(true)
    }
  }
}
