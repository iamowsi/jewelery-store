import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice } from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-300 transition flex flex-col">
      <Link to={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-stone-100 block">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-medium text-stone-900 line-clamp-1 group-hover:text-amber-800 transition">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <span className="text-sm font-semibold text-stone-900">
            {formatPrice(product.price)}
          </span>

          {!isAdmin && (
            <button
              disabled={product.stock === 0}
              onClick={() => addItem(product)}
              className="flex items-center gap-1 text-xs bg-stone-900 text-white px-3 py-1.5 rounded-full hover:bg-amber-800 disabled:bg-stone-300 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {product.stock > 0 ? 'افزودن' : 'ناموجود'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}