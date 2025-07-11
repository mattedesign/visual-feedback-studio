import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  stripe_product_id: string;
  price_monthly: number;
  price_yearly: number;
  analyses_limit: number;
  is_active: boolean;
  created_at: string;
}

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      if (selectedProduct && !isCreating) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      setEditDialogOpen(false);
      setSelectedProduct(null);
      setIsCreating(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const openCreateDialog = () => {
    setSelectedProduct(null);
    setIsCreating(true);
    setEditDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsCreating(false);
    setEditDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Management
            </CardTitle>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isCreating ? 'Create New Product' : 'Edit Product'}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={selectedProduct}
                  onSave={saveProduct}
                  isCreating={isCreating}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No products found. Create your first product to get started.
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span>Monthly: <strong>${product.price_monthly}</strong></span>
                        <span>Yearly: <strong>${product.price_yearly}</strong></span>
                        <span>Analyses: <strong>{product.analyses_limit}</strong></span>
                        {product.stripe_product_id && (
                          <span>Stripe ID: <code className="bg-muted px-1 rounded">
                            {product.stripe_product_id}
                          </code></span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProductFormProps {
  product: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'created_at'>) => void;
  isCreating: boolean;
}

const ProductForm = ({ product, onSave, isCreating }: ProductFormProps) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [stripeProductId, setStripeProductId] = useState(product?.stripe_product_id || '');
  const [priceMonthly, setPriceMonthly] = useState(product?.price_monthly || 0);
  const [priceYearly, setPriceYearly] = useState(product?.price_yearly || 0);
  const [analysesLimit, setAnalysesLimit] = useState(product?.analyses_limit || 25);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      stripe_product_id: stripeProductId,
      price_monthly: priceMonthly,
      price_yearly: priceYearly,
      analyses_limit: analysesLimit,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="stripeProductId">Stripe Product ID</Label>
          <Input
            id="stripeProductId"
            value={stripeProductId}
            onChange={(e) => setStripeProductId(e.target.value)}
            placeholder="prod_..."
          />
        </div>

        <div>
          <Label htmlFor="priceMonthly">Monthly Price ($)</Label>
          <Input
            id="priceMonthly"
            type="number"
            step="0.01"
            value={priceMonthly}
            onChange={(e) => setPriceMonthly(Number(e.target.value))}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="priceYearly">Yearly Price ($)</Label>
          <Input
            id="priceYearly"
            type="number"
            step="0.01"
            value={priceYearly}
            onChange={(e) => setPriceYearly(Number(e.target.value))}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="analysesLimit">Analyses Limit</Label>
          <Input
            id="analysesLimit"
            type="number"
            value={analysesLimit}
            onChange={(e) => setAnalysesLimit(Number(e.target.value))}
            min="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isCreating ? 'Create Product' : 'Update Product'}
      </Button>
    </form>
  );
};