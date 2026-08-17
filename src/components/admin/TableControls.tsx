import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search } from 'lucide-react';

interface TableControlsProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  
  // Date filter
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function TableControls({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  dateFilter,
  onDateFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: TableControlsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // We detect if dateFilter is a custom date/month/year format by checking prefix
  const isCustomDate = dateFilter.startsWith('date:');
  const isCustomMonth = dateFilter.startsWith('month:');
  const isCustomYear = dateFilter.startsWith('year:');

  const handleCustomDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateFilterChange(`date:${e.target.value}`);
    } else {
      onDateFilterChange('all');
    }
  };

  const handleCustomMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateFilterChange(`month:${e.target.value}`);
    } else {
      onDateFilterChange('all');
    }
  };

  const handleCustomYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      onDateFilterChange(`year:${e.target.value}`);
    } else {
      onDateFilterChange('all');
    }
  };

  // Get base value for the dropdown
  const dropdownValue = (isCustomDate || isCustomMonth || isCustomYear) ? 'custom' : dateFilter;

  // Generate some years for the dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);

  return (
    <div className="space-y-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 w-full transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select 
              value={dropdownValue}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  onDateFilterChange(e.target.value);
                }
              }}
              className="bg-transparent border-none text-sm py-2 pr-2 focus:ring-0 text-gray-700 cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom" disabled>Custom Range...</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="date"
              title="Filter by exact date"
              onChange={handleCustomDate}
              value={isCustomDate ? dateFilter.replace('date:', '') : ''}
              className="border border-gray-200 bg-gray-50 rounded-lg text-sm px-3 py-2 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
            <input 
              type="month"
              title="Filter by exact month"
              onChange={handleCustomMonth}
              value={isCustomMonth ? dateFilter.replace('month:', '') : ''}
              className="border border-gray-200 bg-gray-50 rounded-lg text-sm px-3 py-2 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
            <select
              title="Filter by year"
              onChange={handleCustomYear}
              value={isCustomYear ? dateFilter.replace('year:', '') : ''}
              className="border border-gray-200 bg-gray-50 rounded-lg text-sm px-3 py-2 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Year...</option>
              {years.map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
            
            {(isCustomDate || isCustomMonth || isCustomYear) && (
              <button 
                onClick={() => onDateFilterChange('all')}
                className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 px-2 py-1.5 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      
      {totalItems > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 mt-4">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            Showing <span className="font-medium text-gray-900">{totalItems === 0 ? 0 : startItem}</span> to <span className="font-medium text-gray-900">{endItem}</span> of{' '}
            <span className="font-medium text-gray-900">{totalItems}</span> results
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center px-3 py-1 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function filterByDateRange(items: any[], dateField: string, filterType: string) {
  if (filterType === 'all' || !filterType) return items;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return items.filter(item => {
    let itemDate;
    
    // Support Firestore Timestamps and string dates
    if (item[dateField]?.seconds) {
      itemDate = new Date(item[dateField].seconds * 1000);
    } else if (item[dateField]) {
      itemDate = new Date(item[dateField]);
    } else {
      return false; // Skip items without dates if we are filtering
    }

    if (filterType.startsWith('date:')) {
      const targetDate = filterType.replace('date:', '');
      const itemDateStr = itemDate.toISOString().split('T')[0];
      return itemDateStr === targetDate;
    }
    
    if (filterType.startsWith('month:')) {
      const targetMonth = filterType.replace('month:', ''); // YYYY-MM
      const itemMonthStr = itemDate.toISOString().substring(0, 7);
      return itemMonthStr === targetMonth;
    }
    
    if (filterType.startsWith('year:')) {
      const targetYear = filterType.replace('year:', '');
      return itemDate.getFullYear().toString() === targetYear;
    }

    switch (filterType) {
      case 'today':
        return itemDate >= today;
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return itemDate >= sevenDaysAgo;
      case 'thisMonth':
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'lastMonth':
        let lastMonth = now.getMonth() - 1;
        let year = now.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          year--;
        }
        return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === year;
      case 'thisYear':
        return itemDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });
}
