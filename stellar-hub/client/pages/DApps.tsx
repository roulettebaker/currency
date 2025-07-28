import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Star, TrendingUp, Shield, Zap, Globe } from 'lucide-react';

interface DApp {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  users: number;
  rating: number;
  verified: boolean;
  featured: boolean;
}

const dapps: DApp[] = [
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Decentralized exchange protocol',
    category: 'DEX',
    icon: '🦄',
    url: 'https://app.uniswap.org',
    users: 2500000,
    rating: 4.8,
    verified: true,
    featured: true
  },
  {
    id: 'aave',
    name: 'Aave',
    description: 'Decentralized lending platform',
    category: 'Lending',
    icon: '👻',
    url: 'https://app.aave.com',
    users: 890000,
    rating: 4.6,
    verified: true,
    featured: true
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'Algorithmic money markets',
    category: 'Lending',
    icon: '🏛️',
    url: 'https://app.compound.finance',
    users: 650000,
    rating: 4.5,
    verified: true,
    featured: false
  },
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'NFT marketplace',
    category: 'NFT',
    icon: '🌊',
    url: 'https://opensea.io',
    users: 1800000,
    rating: 4.3,
    verified: true,
    featured: true
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    description: 'BSC DEX and yield farming',
    category: 'DEX',
    icon: '🥞',
    url: 'https://pancakeswap.finance',
    users: 1200000,
    rating: 4.4,
    verified: true,
    featured: false
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    description: 'Stablecoin exchange',
    category: 'DEX',
    icon: '📈',
    url: 'https://curve.fi',
    users: 450000,
    rating: 4.2,
    verified: true,
    featured: false
  }
];

const categories = ['All', 'DEX', 'Lending', 'NFT', 'Gaming', 'Social', 'Tools'];

export default function DApps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDApps = dapps.filter(dapp => {
    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredDApps = dapps.filter(dapp => dapp.featured);

  const formatUsers = (users: number) => {
    if (users >= 1000000) return `${(users / 1000000).toFixed(1)}M`;
    if (users >= 1000) return `${(users / 1000).toFixed(0)}K`;
    return users.toString();
  };

  const handleDAppClick = (dapp: DApp) => {
    // In a real app, this would open the DApp in a secure webview or external browser
    console.log(`Opening ${dapp.name}: ${dapp.url}`);
    // For demo purposes, we'll just log it
    alert(`Would open ${dapp.name} at ${dapp.url}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Link to="/" className="mr-4 hover:bg-secondary p-1 rounded">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-lg font-medium text-white">DApps</h1>
        </div>
        <Globe className="w-6 h-6 text-white" />
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search DApps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured DApps */}
      {selectedCategory === 'All' && (
        <div className="p-4 border-b border-border">
          <h2 className="text-white font-medium mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400" />
            Featured DApps
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {featuredDApps.map((dapp) => (
              <button
                key={dapp.id}
                onClick={() => handleDAppClick(dapp)}
                className="bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{dapp.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium flex items-center">
                      {dapp.name}
                      {dapp.verified && (
                        <Shield className="w-4 h-4 ml-1 text-green-400" />
                      )}
                    </div>
                    <div className="text-muted-foreground text-sm truncate">
                      {dapp.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatUsers(dapp.users)} users</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white">{dapp.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All DApps */}
      <div className="p-4">
        <h2 className="text-white font-medium mb-3">
          {selectedCategory === 'All' ? 'All DApps' : `${selectedCategory} DApps`}
        </h2>
        <div className="space-y-3">
          {filteredDApps.map((dapp) => (
            <button
              key={dapp.id}
              onClick={() => handleDAppClick(dapp)}
              className="w-full bg-secondary border border-border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{dapp.icon}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium">{dapp.name}</span>
                    {dapp.verified && (
                      <Shield className="w-4 h-4 text-green-400" />
                    )}
                    {dapp.featured && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm mb-2">
                    {dapp.description}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      {formatUsers(dapp.users)} users
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white">{dapp.rating}</span>
                    </div>
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">
                      {dapp.category}
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
          
          {filteredDApps.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-muted-foreground">No DApps found</div>
              <div className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or category filter
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 border-t border-border">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-yellow-400 text-sm">
              <strong>Security Notice:</strong> Always verify DApp URLs and never share your private keys. 
              Only connect to trusted applications with verified badges.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
