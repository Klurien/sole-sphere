import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown, Filter, Grid, List as ListIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import CardSkeleton from '../components/product/CardSkeleton';
import './Products.css';

const BRANDS = ['All', 'Nike', 'Jordan', 'Adidas', 'New Balance', 'Yeezy', 'Puma', 'Reebok'];
const CATEGORIES = ['All', 'Lifestyle', 'Basketball', 'Running', 'Streetwear', 'Limited Edition'];
const SIZES = ['All', 'US 4', 'US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13', 'US 14', 'US 15'];

const SORT_OPTIONS = [
    { value: 'default', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Latest Drops' },
];

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "");

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Pagination/Meta state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    // Filter state
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || 'All');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [sort, setSort] = useState('newest');

    const fetchProducts = async (pageNumber, isNewSearch = false) => {
        if (pageNumber > 1) setLoadingMore(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({
                page: pageNumber,
                limit: 12,
                q: searchQuery,
                brand: selectedBrand !== 'All' ? selectedBrand : '',
                category: selectedCategory !== 'All' ? selectedCategory : '',
                size: selectedSize !== 'All' ? selectedSize : '',
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                sort: sort
            });

            const res = await fetch(`${API}/api/products?${params.toString()}`);
            const data = await res.json();

            if (isNewSearch) {
                setProducts(data.products);
            } else {
                setProducts(prev => [...prev, ...data.products]);
            }

            setTotalResults(data.total);
            setHasMore(data.page < data.totalPages);
            setLoading(false);
            setLoadingMore(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Initial fetch and filter change
    useEffect(() => {
        setPage(1);
        fetchProducts(1, true);
    }, [searchQuery, selectedBrand, selectedCategory, selectedSize, priceRange, sort]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchProducts(page, false);
        }
    }, [page]);

    // Intersection Observer for Infinite Scroll
    const observer = React.useRef();
    const lastElementRef = React.useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedBrand('All');
        setSelectedCategory('All');
        setSelectedSize('All');
        setPriceRange([0, 100000]);
        setSort('newest');
        setSearchParams({});
    };

    const activeFilterCount = [
        selectedBrand !== 'All',
        selectedCategory !== 'All',
        selectedSize !== 'All',
        priceRange[0] > 0 || priceRange[1] < 100000,
    ].filter(Boolean).length;

    return (
        <div className="inventory-page-v3">
            <Helmet>
                <title>Sole Sphere | Premium Authentic Sneakers in Kenya</title>
                <meta name="description" content="Explore our curated collection of authentic sneakers from Nike, Jordan, Adidas, and more." />
            </Helmet>

            <div className="inventory-header-v3">
                <div className="container">
                    <div className="v3-sub">CURATED SELECTION</div>
                    <div className="header-flex-v3">
                        <div className="header-text-v3">
                            <h1>THE <span className="highlight">COLLECTION</span></h1>
                            <p>Explore {totalResults} exclusive pairs across our elite sneaker warehouse.</p>
                        </div>
                        <div className="header-actions-v3">
                            <button className="h-action-btn-v3 mobile-only" onClick={() => setSidebarOpen(true)}>
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container inventory-grid-layout">
                {/* Advanced Filters Sidebar */}
                <aside className={`inventory-sidebar-v3 ${sidebarOpen ? 'sidebar-v3-open' : ''}`}>
                    <div className="sidebar-v3-header">
                        <h3>FILTERS</h3>
                        <button className="v3-close-sidebar" onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="v3-filter-wrapper">
                        <div className="v3-filter-group">
                            <label>SEARCH COLLECTION</label>
                            <div className="v3-search-box glass-panel">
                                <input
                                    type="text"
                                    placeholder="Model, silhouette..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <Search size={16} />
                            </div>
                        </div>

                        <div className="v3-filter-group">
                            <label>SELECT BRAND</label>
                            <div className="v3-select-grid">
                                {BRANDS.map(brand => (
                                    <button
                                        key={brand}
                                        className={`v3-select-pill ${selectedBrand === brand ? 'active' : ''}`}
                                        onClick={() => setSelectedBrand(brand)}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="v3-filter-group">
                            <label>CATEGORY</label>
                            <div className="v3-select-grid">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        className={`v3-select-pill ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="v3-filter-group">
                            <label>SIZE (US)</label>
                            <div className="v3-select-grid">
                                {SIZES.map(size => (
                                    <button
                                        key={size}
                                        className={`v3-select-pill ${selectedSize === size ? 'active' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="v3-filter-group">
                            <label>PRICE CAP (KSh)</label>
                            <div className="v3-price-inputs">
                                <div className="price-input-v3 glass-panel">
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    />
                                </div>
                            </div>
                        </div>

                        {activeFilterCount > 0 && (
                            <button className="v3-reset-btn" onClick={clearFilters}>
                                RESET FILTERS
                            </button>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="inventory-main-v3">
                    <div className="v3-toolbar-top">
                        <div className="toolbar-info-v3">
                            <p>Showing <strong>{products.length}</strong> of <strong>{totalResults}</strong> sneakers</p>
                        </div>
                        <div className="toolbar-controls-v3">
                            <div className="v3-sort-control">
                                <span>Sort By</span>
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Tags */}
                    {activeFilterCount > 0 && (
                        <div className="v3-active-tags">
                            {selectedBrand !== 'All' && (
                                <span className="v3-tag">
                                    {selectedBrand} <X size={14} onClick={() => setSelectedBrand('All')} />
                                </span>
                            )}
                            {selectedCategory !== 'All' && (
                                <span className="v3-tag">
                                    {selectedCategory} <X size={14} onClick={() => setSelectedCategory('All')} />
                                </span>
                            )}
                            {selectedSize !== 'All' && (
                                <span className="v3-tag">
                                    {selectedSize} <X size={14} onClick={() => setSelectedSize('All')} />
                                </span>
                            )}
                        </div>
                    )}

                    {/* Content Grid */}
                    {loading ? (
                        <div className="v3-inventory-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="v3-inventory-grid">
                                {products.map((shoe, index) => {
                                    if (products.length === index + 1) {
                                        return (
                                            <div ref={lastElementRef} key={shoe.id}>
                                                <ProductCard product={shoe} />
                                            </div>
                                        );
                                    }
                                    return <ProductCard key={shoe.id} product={shoe} />;
                                })}
                            </div>
                            
                            {loadingMore && (
                                <div className="v3-loading-more">
                                    <div className="spinner"></div>
                                    <span>Unboxing more drops...</span>
                                </div>
                            )}

                            {!hasMore && products.length > 0 && (
                                <div className="v3-end-of-list">
                                    <p>You've reached the end of our current collection.</p>
                                </div>
                            )}
                        </>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="v3-empty-state">
                            <Search size={48} />
                            <h3>No results found</h3>
                            <p>Try adjusting your filters to find what you're looking for.</p>
                            <button onClick={clearFilters}>Clear All Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;

