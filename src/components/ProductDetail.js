import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ProductDetail = () => {
  const { productId } = useParams(); // Get the productId from URL params
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, 'inventory', productId);
      const docSnap = await getDoc(productDoc);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.images || 'https://via.placeholder.com/320'}
            alt={product.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <h3>${product.price}</h3>
          <p><strong>Available Sizes:</strong> {product.sizes}</p>
          <button className="btn btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
