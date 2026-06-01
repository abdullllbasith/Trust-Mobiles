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

export default function AdminProducts({ products, loading, fetchData }: any) {
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
    images: "",
    specs: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: prev.images
            ? `${prev.images}, ${base64String}`
            : base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        images: Array.isArray(product.images)
          ? product.images.join(", ")
          : product.images,
        specs: JSON.stringify(product.specs || {}),
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        discount: "0",
        stock: "0",
        images: "",
        specs: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...formData,
        images: formData.images.split(",").map((s) => s.trim()),
        specs: formData.specs ? JSON.parse(formData.specs) : {},
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
                            src={
                              typeof product.images === "string"
                                ? JSON.parse(product.images)[0]
                                : product.images[0]
                            }
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
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
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
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.images && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {formData.images
                    .split(",")
                    .map(
                      (img, idx) =>
                        img.trim() && (
                          <img
                            key={idx}
                            src={img.trim()}
                            alt={`Preview ${idx}`}
                            className="w-16 h-16 object-cover rounded border flex-shrink-0"
                          />
                        ),
                    )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, images: "" })}
                  >
                    Clear Images
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Specs (JSON format)</Label>
              <Input
                placeholder='{"color": "black", "ram": "8GB"}'
                value={formData.specs}
                onChange={(e) =>
                  setFormData({ ...formData, specs: e.target.value })
                }
              />
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
