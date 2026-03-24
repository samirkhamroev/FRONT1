// src/App.jsx
import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct, updateProduct } from './api';
import ProductCard from './components/ProductCard';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', description: '', image: '' });

  const availableImages = [
    'Slim Shady LP Anniversary T-Shirt.webp',
    'Marshall Mathers LP Vinyl.webp',
    'Eminem Logo Snapback.webp',
    'The Death of Slim Shady (Coup de Grâce) CD.webp',
    'The Eminem Show - Expanded Edition Vinyl.jpg',
    'Shady Records Grey Hoodie.jpg',
    'Recovery Anniversary T-Shirt.webp',
    'Curtain Call 2 - 2CD Set.webp',
    'Kamikaze Red Vinyl.webp',
    'Slim Shady Beanie.webp',
    'Relapse Refill CD.webp'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        setEditingProduct(null);
      } else {
        await createProduct(formData);
      }
      setFormData({ name: '', category: '', price: '', description: '', image: '' });
      fetchProducts();
    } catch (err) {
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert("Error deleting product. Check if ID exists on server.");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image
    });
    window.scrollTo(0, 0);
  };

  if (loading) return <div className="container">Loading Eminem Store...</div>;

  return (
    <div className="App">
      <header className="header">
        <h1>EMINEM STORE</h1>
      </header>

      <main className="container">
        <section className="admin-panel">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Merch'}</h2>
          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Product Name" value={formData.name} onChange={handleInputChange} required />
            <input name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} required />
            <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleInputChange} required />
            
            <input 
              name="image" 
              placeholder="Image URL (e.g. http://... or /images/file.png)" 
              value={formData.image} 
              onChange={handleInputChange} 
            />
            {formData.image && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Preview:</p>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                  onLoad={(e) => { e.target.style.display = 'inline-block'; }}
                />
              </div>
            )}

            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} />
            <button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
            {editingProduct && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingProduct(null); 
                  setFormData({name:'',category:'',price:'',description:'',image:''})
                }} 
                style={{background: '#555', marginTop: '10px'}}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onDelete={handleDelete} 
              onEdit={handleEdit} 
            />
          ))}
        </div>
      </main>

      <footer className="container" style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>
        &copy; 2026 Marshall Mathers. All Shady.
      </footer>
    </div>
  );
}

export default App;
