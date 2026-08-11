import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CategoryFilterProps {
  activeType: string;
  availableTypes: string[];
  onTypeChange: (type: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
}

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function CategoryFilter({ activeType, availableTypes, onTypeChange, sortOption, onSortChange }: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label || "Sort";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 relative z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Curated Collection</h2>
          <p className="mt-4 max-w-xl text-sm text-gray-500 dark:text-gray-400">Thoughtfully designed pieces for your everyday life.</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Type Filter */}
          <div className="w-[100vw] -ml-4 pl-4 pr-4 sm:w-auto sm:-ml-0 sm:pl-0 sm:pr-0 overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex space-x-2 md:space-x-4 min-w-max">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    activeType === type
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative z-50 w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span>{activeSortLabel}</span>
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-48 bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      sortOption === option.value
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
