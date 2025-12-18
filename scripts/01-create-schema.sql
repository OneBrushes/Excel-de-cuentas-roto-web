-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Stores table (cada producto es una tienda)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shopify_store_url TEXT,
  shopify_access_token TEXT,
  product_cost DECIMAL(10, 2) DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (pedidos de Shopify)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shopify_order_id TEXT UNIQUE,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) GENERATED ALWAYS AS (revenue - cost) STORED,
  customer_email TEXT,
  order_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Manual expenses table (gastos adicionales por producto)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products(is_visible);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_expenses_product_id ON public.expenses(product_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for products table
CREATE POLICY "Users can view own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can view orders for own products" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert orders for own products" ON public.orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update orders for own products" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete orders for own products" ON public.orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

-- RLS Policies for expenses table
CREATE POLICY "Users can view expenses for own products" ON public.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = expenses.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses for own products" ON public.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = expenses.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses for own products" ON public.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = expenses.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses for own products" ON public.expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = expenses.product_id
      AND products.user_id = auth.uid()
    )
  );
