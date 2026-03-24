// src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onDelete, onEdit }) => {
  const getImageUrl = () => {
    // Если у товара уже есть прямая ссылка на изображение (из формы)
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }

    // Иначе подбираем по имени для "стандартных" товаров
    const specialFilenames = {
      'Shady Records Grey Hoodie': 'Shady Records Grey Hoodie.jpg',
      'The Eminem Show - Expanded Edition Vinyl': 'The Eminem Show - Expanded Edition Vinyl.jpg',
      'Relapse: Refill CD': 'Relapse Refill CD_fixed.webp'
    };
    
    const name = product.name;
    if (specialFilenames[name]) {
      return `/images/${specialFilenames[name]}`;
    }
    return `/images/${name}.webp`;
  };

  return (
    <div className="product-card">
      <div className="product-card__image-container">
        <img 
          src={getImageUrl()} 
          alt={product.name} 
          className="product-card__image" 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
        />
      </div>
      <h3 className="product-card__title">{product.name}</h3>
      <p className="product-card__category">{product.category}</p>
      <p className="product-card__price">${product.price}</p>
      
      <div className="product-card__actions">
        <button onClick={() => onEdit(product)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(product.id)}>Delete</button>
      </div>
    </div>
  );
};

export default ProductCard;
