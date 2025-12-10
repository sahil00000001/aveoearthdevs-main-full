import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchContextType {
  searchQuery: string;
  navigateToSearch: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  const navigateToSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <SearchContext.Provider value={{ searchQuery, navigateToSearch }}>
      {children}
    </SearchContext.Provider>
  );
};
