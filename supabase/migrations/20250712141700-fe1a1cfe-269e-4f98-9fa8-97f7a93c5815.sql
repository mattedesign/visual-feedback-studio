-- Create sample products for testing
INSERT INTO public.products (name, description, price_monthly, price_yearly, analyses_limit, is_active, stripe_product_id) VALUES
('Starter Plan', 'Perfect for small teams getting started with UX analysis', 29.00, 290.00, 25, true, 'prod_starter'),
('Professional Plan', 'Advanced features for growing businesses', 59.00, 590.00, 100, true, 'prod_professional'),
('Enterprise Plan', 'Unlimited access for large organizations', 149.00, 1490.00, 500, true, 'prod_enterprise');