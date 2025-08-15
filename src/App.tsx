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
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
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