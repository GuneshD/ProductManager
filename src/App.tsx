import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProductProvider } from './contexts/ProductContext'
import { TenantProvider } from './contexts/TenantContext'
import Layout from './components/Layout/Layout'
import ProductsPage from './pages/ProductsPage'
import ImportPage from './pages/ImportPage'
import './App.css'

function App() {
  return (
    <TenantProvider>
      <ProductProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                <Route path="/" element={<ProductsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/import" element={<ImportPage />} />
              </Routes>
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  },
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
                loading: {
                  style: {
                    background: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid #fed7aa',
                  },
                  iconTheme: {
                    primary: '#f59e0b',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ProductProvider>
    </TenantProvider>
  )
}

export default App