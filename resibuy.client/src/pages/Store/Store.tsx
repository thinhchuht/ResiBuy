import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProductList from './ProductList';
import CreateProduct from './components/CreateProduct';
import UpdateProduct from './components/UpdateProduct';
import ProductDetail from './components/ProductDetail';

export default function Store() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <main className="p-4 w-full">
          <Routes>
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/update/:id" element={<UpdateProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
