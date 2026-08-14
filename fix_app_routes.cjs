const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<Routes>[\s\S]*?<\/Routes>\s*\)\}/;

const correctCode = `
      <Routes>
        <Route path="/" element={
          <>
            <Hero onSearch={setSearchQuery} />
            <div className="relative z-20 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
            <CategoryFilter 
              activeType={activeType}
              availableTypes={productTypes} 
              onTypeChange={(type) => {
                if (type === 'All') setActiveCategory('All');
                setActiveType(type);
                setSearchQuery('');
                setAiMatchedIds(null);
              }} 
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
            
            <ProductGrid cartItems={cartItems} 
              aiMatchedIds={aiMatchedIds}
              isAiSearching={isAiSearching}
              onAddToCart={handleAddToCart} 
              searchQuery={searchQuery} 
              activeCategory={activeCategory}
              activeType={activeType} 
              sortOption={sortOption}
              wishlistItems={wishlistItems}
              onToggleWishlist={handleToggleWishlist}
              isLoading={isLoading}
              reviews={reviews}
              onOpenReviews={setReviewModalProduct}
              compareProducts={compareProducts}
              onToggleCompare={handleToggleCompare}
              onProductClick={handleProductClick}
              onNotifyMe={setNotifyProduct}
              onClearSearch={() => {
                setSearchQuery('');
                setAiMatchedIds(null);
              }}
            />
            </div>
          </>
        } />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/product/:productId" element={<ProductPage cartItems={cartItems} onAddToCart={handleAddToCart} reviews={reviews} onNotifyMe={setNotifyProduct} />} />
      </Routes>
`;

code = code.replace(regex, correctCode);
fs.writeFileSync('src/App.tsx', code);
