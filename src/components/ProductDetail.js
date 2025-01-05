import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';

const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const ProductDetail = () => {
  const { productId } = useParams(); // Get the productId from URL params
  const [product, setProduct] = useState(null);
  const [value, setValue] = React.useState(2);
  const [hover, setHover] = React.useState(-1);
  
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
 console.log(product);
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
      <Rating
  name="hover-feedback"
  value={value}
  precision={0.5}
  getLabelText={getLabelText}
  onChange={(event, newValue) => {
    setValue(newValue);
  }}
  onChangeActive={(event, newHover) => {
    setHover(newHover);
  }}
  emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
/>
{value !== null && (
  <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
)}
    </div>
  );
};

export default ProductDetail;
