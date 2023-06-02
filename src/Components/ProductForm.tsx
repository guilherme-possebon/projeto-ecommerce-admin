import axios from 'axios'
import { useRouter } from 'next/router'
import { ChangeEvent, useEffect, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../services/firebase'

export interface ExistingType {
  existingTitle?: object | string
  title?: string
  existingDescription?: object | string
  description?: string
  existingPrice?: object | string
  price?: string
  _id?: string
  images?: File
  url?: string
}
export interface ImageFile extends File {
  name: string
}

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice
}: ExistingType) {
  // ------------------Produto------------------
  const [title, setTitle] = useState(existingTitle)
  const [description, setDescription] = useState(existingDescription)
  const [price, setPrice] = useState(existingPrice)
  const [producturl, setProductUrl] = useState<string>('')
  const [goToProducts, setGoToProducts] = useState(false)

  const router = useRouter()

  async function saveProduct(ev: { preventDefault: () => void }) {
    ev.preventDefault()
    const data = { title, description, price, producturl }

    if (_id) {
      //update
      await axios.put('/api/products', { ...data, _id })
      console.log(data, 'update')
    } else {
      //create
      await axios.post('/api/products', data)
    }
    setGoToProducts(true)
  }

  if (goToProducts) {
    router.push('/products')
  }

  // ------------------Imagem------------------
  const [file, setFile] = useState<ImageFile | undefined>()
  const [progress, setProgress] = useState<number>(0)

  const metadata = {
    contentType: 'image/jpeg'
  }

  function addProductPhoto(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0]
      setFile(selectedFile)

      const storageRef = ref(storage, selectedFile.name)
      const uploadTask = uploadBytesResumable(
        storageRef,
        selectedFile,
        metadata
      )

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setProgress(progress)
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused')
              break
            case 'running':
              console.log('Upload is running')
              break
          }
        },
        (error) => {
          switch (error.code) {
            case 'storage/unauthorized':
              break
            case 'storage/canceled':
              break
            case 'storage/unknown':
              break
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL)
            setProductUrl(downloadURL)
          })
        }
      )
    }
  }

  const { id } = router.query

  useEffect(() => {
    if (!id) {
      return
    }
    axios.get('/api/products?id=' + id).then((response) => {
      const { producturl } = response.data
      setProductUrl(producturl)
    })
  }, [id])

  return (
    <form onSubmit={saveProduct}>
      <label htmlFor="product-name">
        Product name
        <input
          type="text"
          name="product-name"
          id="product-name"
          placeholder="product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label htmlFor="Photo">Photos</label>
      <div className="mb-2">
        {producturl?.length === 0 ? (
          <>
            <div>
              {progress > 0
                ? `Upload ${progress.toFixed()}% concluido`
                : 'Fazer upload da imagem:'}
            </div>
            <label className="add-image-btn">
              <input
                type="file"
                name="image-file"
                id="image-file"
                className="file-input"
                accept="image/*"
                onChange={addProductPhoto}
              />
            </label>
          </>
        ) : (
          <div className="image-infos">
            <div>
              <img src={producturl} alt="" className="w-96" loading="lazy" />
            </div>
            <a href={producturl} target="_blank">
              Link da imagem
            </a>
            <label>
              Trocar Imagem
              <input
                type="file"
                name="image-file"
                id="image-file"
                onChange={addProductPhoto}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      <label htmlFor="description">
        Description
        <textarea
          name="description"
          id="description"
          placeholder="description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        ></textarea>
      </label>
      <label htmlFor="price">
        Price (in R$)
        <input
          type="text"
          name="price"
          id="price"
          placeholder="price"
          onChange={(e) => setPrice(e.target.value)}
          value={price}
        />
      </label>
      <button className="btn-primary" type="submit">
        Save
      </button>
    </form>
  )
}
