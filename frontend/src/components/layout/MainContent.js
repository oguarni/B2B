import React, { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { useAppContext } from '../../contexts/AppProvider';

// Simple Product Card
const ProductCard = ({ product, onRequestQuote, user }) => {
  const canRequest = user && (user.role === 'buyer' || user.role === 'admin');
  const isOwner = user && user.role === 'supplier' && product.supplierId === user.id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border">
      <div className="p-4">
        <div className="text-4xl mb-3 text-center bg-gray-50 py-4 rounded-lg">
          {product.image || '📦'}
        </div>
        
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-xs text-blue-600 mb-2">{product.supplier || 'Fornecedor Industrial'}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-blue-600">
              R$ {parseFloat(product.price || 0).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/{product.unit || 'un'}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Package size={14} className="mr-1" />
            <span>Mín: {product.minQuantity || 1} {product.unit || 'un'}</span>
          </div>
        </div>
        
        {isOwner ? (
          <div className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg text-center text-sm font-medium">
            Seu Produto
          </div>
        ) : canRequest ? (
          <button
            onClick={() => onRequestQuote(product)}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            Solicitar Cotação
          </button>
        ) : (
          <button
            onClick={() => onRequestQuote(product)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login para Cotar
          </button>
        )}
      </div>
    </div>
  );
};

// Search and Filters
const SearchAndFilters = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) => {
  const categories = ['Todas', 'Maquinário', 'Matéria-Prima', 'Componentes', 'Ferramentas', 'Equipamentos'];

  return (
    <div className="bg-white shadow-sm sticky top-14 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = () => {
  const { 
    products, 
    loading, 
    error, 
    user, 
    handleRequestQuote, 
    loadProducts,
    addNotification 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleQuoteRequest = (product) => {
    if (!user) {
      addNotification({
        type: 'info',
        message: 'Faça login para solicitar cotações'
      });
    } else {
      addNotification({
        type: 'success',
        message: `Cotação solicitada para ${product.name}`
      });
    }
    handleRequestQuote(product);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchAndFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto mb-4 text-gray-400" size={80} />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500">
            {products.length === 0 
              ? 'Nenhum produto cadastrado ainda. Use o botão "Popular DB" para adicionar dados de exemplo.'
              : 'Tente ajustar os filtros ou termos de pesquisa.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product} 
              onRequestQuote={handleQuoteRequest} 
              user={user} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MainContent;