import { useEffect, useState } from 'react';
import { AppShell, ShellHeader, Price, withViewTransition } from '../../design-system';
import { isMockMode } from '../../mocks/checkoutService';
import { listCatalogProducts, type Product } from './checkoutApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectProduct, setStocks } from '../../store/checkoutSlice';
import { useNavigate } from 'react-router-dom';
import './catalog.css';

export function CatalogPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const stocks = useAppSelector((s) => s.checkout.stocks);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await listCatalogProducts();
        if (cancelled) return;
        setProducts(items);
        dispatch(setStocks(Object.fromEntries(items.map((p) => [p.id, p.stock]))));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load catalog.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const openProduct = (id: string) => {
    dispatch(selectProduct(id));
    withViewTransition(() => navigate(`/product/${id}`));
  };

  const featured = products[0];
  const rest = products.slice(1);

  return (
    <AppShell layout="store" mockBanner={isMockMode()}>
      <ShellHeader
        home
        trailing={
          <a className="nora-catalog__nav-link" href="#edit">
            Shop
          </a>
        }
      />

      <main className="nora-catalog">
        {loading ? <p className="nora-catalog__state">Loading the edit…</p> : null}
        {error ? (
          <p className="nora-catalog__state nora-catalog__state--error" role="alert">
            {error}
            {!isMockMode() ? ' Is the API running on VITE_API_BASE_URL?' : ''}
          </p>
        ) : null}

        {featured ? (
          <section className="nora-catalog__hero" aria-labelledby="featured-title">
            <button
              type="button"
              className="nora-catalog__hero-hit"
              onClick={() => openProduct(featured.id)}
            >
              <span className="nora-catalog__hero-media">
                <img
                  className={`nora-vt-product nora-vt-product--${featured.id}`}
                  src={featured.imageUrl}
                  alt={featured.imageAlt}
                  width={1600}
                  height={1600}
                  decoding="async"
                  fetchPriority="high"
                />
                <span className="nora-catalog__hero-veil" aria-hidden="true" />
              </span>
              <span className="nora-catalog__hero-copy">
                <span className="nora-catalog__eyebrow">Featured</span>
                <span id="featured-title" className="nora-catalog__hero-title">
                  {featured.name}
                </span>
                <span className="nora-catalog__hero-lede">{featured.description}</span>
                <span className="nora-catalog__hero-meta">
                  <Price minorUnits={featured.priceMinor} size="md" />
                  <span className="nora-catalog__stock-quiet">
                    {(stocks[featured.id] ?? featured.stock) > 0
                      ? `${stocks[featured.id] ?? featured.stock} available`
                      : 'Sold out'}
                  </span>
                </span>
                <span className="nora-catalog__hero-cta">Discover</span>
              </span>
            </button>
          </section>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <section id="edit" className="nora-catalog__edit" aria-labelledby="edit-title">
            <header className="nora-catalog__edit-head">
              <p className="nora-catalog__eyebrow">The edit</p>
              <h2 id="edit-title" className="nora-catalog__edit-title">
                Quiet companions
              </h2>
            </header>

            <ul className="nora-catalog__bento">
              {rest.map((product, index) => {
                const stock = stocks[product.id] ?? product.stock;
                const wide = index === rest.length - 1 && rest.length % 2 === 1;
                return (
                  <li
                    key={product.id}
                    className={`nora-catalog__tile${wide ? ' nora-catalog__tile--wide' : ''}`}
                    style={{ animationDelay: `${120 + index * 90}ms` }}
                  >
                    <button
                      type="button"
                      className="nora-catalog__tile-hit"
                      onClick={() => openProduct(product.id)}
                    >
                      <span className="nora-catalog__tile-media">
                        <img
                          className={`nora-vt-product nora-vt-product--${product.id}`}
                          src={product.imageUrl}
                          alt={product.imageAlt}
                          width={900}
                          height={900}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className="nora-catalog__tile-body">
                        <span className="nora-catalog__tile-kicker">
                          {product.kicker}
                        </span>
                        <span className="nora-catalog__tile-name">{product.name}</span>
                        <span className="nora-catalog__tile-meta">
                          <Price minorUnits={product.priceMinor} size="sm" />
                          <span className="nora-catalog__stock-quiet">
                            {stock > 0 ? `${stock} left` : 'Sold out'}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <footer className="nora-catalog__foot">
          <p>Designed for rooms that prefer quiet.</p>
        </footer>
      </main>
    </AppShell>
  );
}
