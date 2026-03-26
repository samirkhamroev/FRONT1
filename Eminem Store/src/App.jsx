// src/App.jsx
import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct, login, register, getUsers, deleteUser, uploadImage } from './api';
import ProductCard from './components/ProductCard';

function App() {
  const [products, setProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('shop'); // shop, login, register, admin
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const [authData, setAuthData] = useState({ username: '', password: '', role: 'user' });
  const [formData, setFormData] = useState({ title: '', category: '', description: '', price: '', stock: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchProducts();
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) { console.error("Ошибка при загрузке товаров", err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setAllUsers(res.data);
    } catch (err) { console.error("Ошибка при загрузке пользователей", err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username: authData.username, password: authData.password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setView('shop');
    } catch (err) { alert(err.response?.data?.error || "Ошибка входа"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(authData);
      alert("Регистрация успешна! Теперь войдите в аккаунт.");
      setView('login');
    } catch (err) { alert(err.response?.data?.error || "Ошибка регистрации"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('shop');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const data = new FormData();
    data.append('image', file);
    
    setUploading(true);
    try {
      const res = await uploadImage(data);
      setFormData({ ...formData, image: res.data.imageUrl });
    } catch (err) {
      alert("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Удалить этого пользователя?")) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  if (loading) return <div className="container">Загрузка магазина...</div>;

  return (
    <div className="App">
      <header className="navbar">
        <div className="container nav-content">
          <div className="logo-container" onClick={() => setView('shop')} style={{cursor:'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img src="/images/logo.jpg" alt="Logo" className="nav-logo" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} />
            <h1 className="logo">EMINEM SHOP</h1>
          </div>
          <nav>
            <button className="btn-link" onClick={() => setView('shop')}>Магазин</button>
            {user ? (
              <>
                {user.role === 'admin' && <button className="btn-link" onClick={() => setView('admin')}>Пользователи</button>}
                <span className="user-badge">{user.username} ({user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавец' : 'Пользователь'})</span>
                <button className="btn btn-danger" onClick={handleLogout}>Выйти</button>
              </>
            ) : (
              <>
                <button className="btn-link" onClick={() => setView('login')}>Войти</button>
                <button className="btn btn-primary" onClick={() => setView('register')}>Регистрация</button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        {view === 'login' && (
          <div className="auth-form">
            <h2>Вход</h2>
            <form onSubmit={handleLogin}>
              <input placeholder="Имя пользователя" onChange={e => setAuthData({...authData, username: e.target.value})} required />
              <input type="password" placeholder="Пароль" onChange={e => setAuthData({...authData, password: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Войти</button>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div className="auth-form">
            <h2>Регистрация</h2>
            <form onSubmit={handleRegister}>
              <input placeholder="Имя пользователя" onChange={e => setAuthData({...authData, username: e.target.value})} required />
              <input type="password" placeholder="Пароль" onChange={e => setAuthData({...authData, password: e.target.value})} required />
              <select onChange={e => setAuthData({...authData, role: e.target.value})}>
                <option value="user">Покупатель</option>
                <option value="seller">Продавец (управление товарами)</option>
                <option value="admin">Админ (полный доступ)</option>
              </select>
              <button type="submit" className="btn btn-primary">Зарегистрироваться</button>
            </form>
          </div>
        )}

        {view === 'admin' && (
          <div className="admin-view">
            <h2>Управление пользователями</h2>
            <table>
              <thead><tr><th>Логин</th><th>Роль</th><th>Действие</th></tr></thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.role}</td>
                    <td>
                      {u.id !== user.id && <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(u.id)}>Удалить</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === 'shop' && (
          <>
            {user && (user.role === 'seller' || user.role === 'admin') && (
              <section className="product-form-section">
                <h2>Добавить товар</h2>
                <form onSubmit={async (e) => { e.preventDefault(); await createProduct(formData); setFormData({title:'',category:'',description:'',price:'',stock:'',image:''}); fetchProducts(); }} className="product-form">
                  <div className="form-grid">
                    <input placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <input placeholder="Категория" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                    <input type="number" placeholder="Цена ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    <input placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                  </div>
                  <div className="upload-section" style={{margin: '10px 0'}}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      ref={fileInputRef}
                      style={{ display: 'none' }} 
                    />
                    <button 
                      type="button" 
                      className="btn-sm" 
                      onClick={() => fileInputRef.current.click()}
                    >
                      {uploading ? 'Загрузка...' : 'фото'}
                    </button>
                    {formData.image && <div style={{marginTop:'5px'}}><img src={formData.image} alt="Превью" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} /></div>}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>Добавить товар</button>
                </form>
              </section>
            )}
            <section className="products-grid">
              {products.map(p => (
                <div key={p.id} className="product-card-wrapper">
                  <ProductCard product={p} />
                  {user?.role === 'admin' && (
                    <div className="card-controls">
                      <button className="btn-sm btn-danger" onClick={async () => { if(window.confirm('Удалить товар?')){await deleteProduct(p.id); fetchProducts();} }}>Удалить</button>
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
