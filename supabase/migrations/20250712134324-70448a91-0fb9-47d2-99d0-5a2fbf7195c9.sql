-- Add product_id to user_subscriptions table to link subscriptions to products
ALTER TABLE public.user_subscriptions 
ADD COLUMN product_id UUID REFERENCES public.products(id);

-- Create product_features table to store feature configurations for each product
CREATE TABLE public.product_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, feature_key)
);

-- Enable RLS on product_features
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;

-- Create policies for product_features table
CREATE POLICY "Anyone can view product features" 
ON public.product_features 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage product features" 
ON public.product_features 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.super_admin = true
  )
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_product_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_features_updated_at
BEFORE UPDATE ON public.product_features
FOR EACH ROW
EXECUTE FUNCTION public.update_product_features_updated_at();