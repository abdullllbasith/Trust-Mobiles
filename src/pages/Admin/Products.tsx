import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { normalizeImages } from "@/lib/productImages";

export default function AdminProducts({ products, categories = [], brands = [], loading, fetchData }: any) {
  const { token } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    discount: "0",
    stock: "0",
  });
  const [imageList, setImageList] = useState<string[]>([]);
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const handleOpen = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price.toString(),
        discount: product.discount.toString(),
        stock: product.stock.toString(),
      });
      setImageList(normalizeImages(product.images));
      const existingSpecs = product.specs || {};
      const specsArray = Object.keys(existingSpecs).length > 0 
        ? Object.entries(existingSpecs).map(([key, value]) => ({ key, value: String(value) }))
        : [{ key: "", value: "" }];
      setSpecsList(specsArray);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        discount: "0",
        stock: "0",
      });
      setImageList([]);
      setSpecsList([{ key: "", value: "" }]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specsObj = specsList.reduce((acc, curr) => {
        if (curr.key.trim() && curr.value.trim()) {
          acc[curr.key.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const body = {
        ...formData,
        images: imageList,
        specs: specsObj,
      };

      const url = editingId ? `/api/products/${editingId}` : `/api/products`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");
      toast.success(`Product ${editingId ? "updated" : "created"}`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error saving product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Product deleted");
      fetchData();
    } catch (err) {
      toast.error("Error deleting product");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Add, update, or remove products in your store.
          </CardDescription>
        </div>
        <Button className="gap-2" onClick={() => handleOpen()}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center mix-blend-multiply p-1">
                          <img
                            src={normalizeImages(product.images)[0]}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.stock > 10 ? "outline" : "destructive"}
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>LKR {product.price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val, brand: "" })}
                  required
                >
                  <SelectTrigger className="rounded-[8px]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[8px]">
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(val) => setFormData({ ...formData, brand: val })}
                  required
                  disabled={!formData.category}
                >
                  <SelectTrigger className="rounded-[8px]">
                    <SelectValue placeholder={formData.category ? "Select Brand" : "Select Category First"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[8px]">
                    {brands
                      .filter((b: any) => b.categories?.includes(formData.category))
                      .map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (LKR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: e.target.value })
                  }
                />
              </div>
            </div>
            <ProductImageManager images={imageList} onChange={setImageList} />
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Specifications</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSpecsList([...specsList, { key: "", value: "" }])}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Spec
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {specsList.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Name (e.g. Color)"
                      value={spec.key}
                      onChange={(e) => {
                        const newList = [...specsList];
                        newList[index].key = e.target.value;
                        setSpecsList(newList);
                      }}
                    />
                    <Input
                      placeholder="Value (e.g. Black)"
                      value={spec.value}
                      onChange={(e) => {
                        const newList = [...specsList];
                        newList[index].value = e.target.value;
                        setSpecsList(newList);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 shrink-0"
                      onClick={() => {
                        const newList = specsList.filter((_, i) => i !== index);
                        setSpecsList(newList.length ? newList : [{ key: "", value: "" }]);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
