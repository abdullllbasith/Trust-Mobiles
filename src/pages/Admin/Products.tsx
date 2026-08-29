import React, { useMemo, useState } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { normalizeImages } from "@/lib/productImages";
import { apiFetch } from "@/lib/api";

type ProductStatus = "available" | "sold";

export default function AdminProducts({
  products = [],
  setProducts,
  categories = [],
  brands = [],
  loading,
  fetchData,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    discount: "0",
    stock: "0",
  });
  const [imageList, setImageList] = useState<string[]>([]);
  const [highlightsList, setHighlightsList] = useState<string[]>([""]);
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product: any) => {
      const status: ProductStatus = product.status === "sold" ? "sold" : "available";
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${product.name || ""} ${product.brand || ""} ${product.category || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: any) => selectedIds.includes(String(p.id)));

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredProducts.some((p: any) => String(p.id) === id)),
      );
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredProducts.forEach((p: any) => next.add(String(p.id)));
      return [...next];
    });
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleOpen = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description || "",
        price: product.price.toString(),
        discount: product.discount.toString(),
        stock: product.stock.toString(),
      });
      setImageList(normalizeImages(product.images));
      const existingHighlights = Array.isArray(product.highlights)
        ? product.highlights.filter((h: unknown) => String(h || "").trim())
        : [];
      setHighlightsList(existingHighlights.length ? existingHighlights.map(String) : [""]);
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
        description: "",
        price: "",
        discount: "0",
        stock: "0",
      });
      setImageList([]);
      setHighlightsList([""]);
      setSpecsList([{ key: "", value: "" }]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || !formData.price) {
      toast.error("Name, category, and price are required");
      return;
    }

    setSaving(true);
    try {
      const specsObj = specsList.reduce((acc, curr) => {
        if (curr.key.trim() && curr.value.trim()) {
          acc[curr.key.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const body = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        highlights: highlightsList.map((h) => h.trim()).filter(Boolean),
        images: imageList,
        specs: specsObj,
      };

      const url = editingId ? `/api/products/${editingId}` : `/api/products`;
      const method = editingId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        auth: true,
        body: JSON.stringify(body),
        fallbackError: "Failed to save product",
      });
      toast.success(`Product ${editingId ? "updated" : "created"}`);
      setIsModalOpen(false);
      await fetchData({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const snapshot = products.find((p: any) => String(p.id) === String(id));
    removeLocalProducts([String(id)]);
    setSelectedIds((prev) => prev.filter((x) => x !== String(id)));
    try {
      await apiFetch(`/api/products/${id}`, {
        method: "DELETE",
        auth: true,
        fallbackError: "Failed to delete product",
      });
      toast.success("Product deleted");
    } catch (err: any) {
      if (snapshot && typeof setProducts === "function") {
        setProducts((prev: any[]) => [snapshot, ...prev]);
      }
      toast.error(err.message || "Error deleting product");
    }
  };

  const patchLocalStatus = (ids: string[], status: ProductStatus) => {
    if (typeof setProducts !== "function") return;
    const idSet = new Set(ids.map(String));
    const soldAt = status === "sold" ? new Date().toISOString() : null;
    setProducts((prev: any[]) =>
      prev.map((p) =>
        idSet.has(String(p.id)) ? { ...p, status, soldAt } : p,
      ),
    );
  };

  const removeLocalProducts = (ids: string[]) => {
    if (typeof setProducts !== "function") return;
    const idSet = new Set(ids.map(String));
    setProducts((prev: any[]) => prev.filter((p) => !idSet.has(String(p.id))));
  };

  const handleToggleStatus = async (product: any) => {
    const id = String(product.id);
    const prevStatus: ProductStatus = product.status === "sold" ? "sold" : "available";
    const next: ProductStatus = prevStatus === "sold" ? "available" : "sold";

    // Instant UI update
    patchLocalStatus([id], next);

    try {
      await apiFetch(`/api/products/${id}/status`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status: next }),
        fallbackError: "Failed to update status",
      });
      toast.success(
        next === "sold"
          ? "Marked as sold — will auto-delete after 1 day"
          : "Marked as available",
      );
    } catch (err: any) {
      patchLocalStatus([id], prevStatus);
      toast.error(err.message || "Error updating status");
    }
  };

  const runBulk = async (action: "delete" | "status", status?: ProductStatus) => {
    if (!selectedIds.length) {
      toast.error("Select at least one product");
      return;
    }
    if (action === "delete" && !confirm(`Delete ${selectedIds.length} product(s)?`)) {
      return;
    }

    const ids = [...selectedIds];
    const previousSnapshot =
      typeof setProducts === "function"
        ? products.filter((p: any) => ids.includes(String(p.id)))
        : [];

    setBulkWorking(true);

    // Instant UI update
    if (action === "delete") {
      removeLocalProducts(ids);
      clearSelection();
    } else if (status) {
      patchLocalStatus(ids, status);
      clearSelection();
    }

    try {
      const result = await apiFetch<{ deleted?: number; updated?: number }>("/api/products/bulk", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          ids,
          action,
          ...(action === "status" ? { status } : {}),
        }),
        fallbackError: "Bulk operation failed",
      });
      if (action === "delete") {
        toast.success(`Deleted ${result.deleted ?? ids.length} product(s)`);
      } else {
        toast.success(
          status === "sold"
            ? `Marked ${result.updated ?? ids.length} as sold — auto-delete after 1 day`
            : `Marked ${result.updated ?? ids.length} as available`,
        );
      }
    } catch (err: any) {
      // Roll back optimistic update
      if (typeof setProducts === "function" && previousSnapshot.length) {
        setProducts((prev: any[]) => {
          const byId = new Map(previousSnapshot.map((p: any) => [String(p.id), p]));
          if (action === "delete") {
            return [...previousSnapshot, ...prev].sort((a, b) => {
              const ta = new Date(a.createdAt || 0).getTime();
              const tb = new Date(b.createdAt || 0).getTime();
              return tb - ta;
            });
          }
          return prev.map((p) => byId.get(String(p.id)) || p);
        });
      }
      toast.error(err.message || "Bulk operation failed");
    } finally {
      setBulkWorking(false);
    }
  };

  const availableBrands = brands.filter((b: any) =>
    b.categories?.includes(formData.category),
  );

  const selectClass =
    "flex h-10 shrink-0 items-center rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Add, update, or remove products in your store.
          </CardDescription>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => handleOpen()}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or category…"
              className="pl-9 w-full"
            />
          </div>
          <select
            className={`${selectClass} w-full sm:w-[150px]`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            className={`${selectClass} w-full sm:w-[130px]`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | ProductStatus)}
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-[#C5A059]/30 bg-[#F3EBD8]/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#1C1C1C]">
              {selectedIds.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={bulkWorking}
                onClick={() => runBulk("status", "available")}
              >
                Mark available
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={bulkWorking}
                onClick={() => runBulk("status", "sold")}
              >
                Mark sold
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={bulkWorking}
                onClick={() => runBulk("delete")}
              >
                Delete selected
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={bulkWorking}
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#C5A059]"
                      checked={allFilteredSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      aria-label="Select all filtered products"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: any) => {
                  const thumb = normalizeImages(product.images)[0];
                  const id = String(product.id);
                  const isSold = product.status === "sold";
                  return (
                  <TableRow key={id} className={isSold ? "opacity-80" : undefined}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#C5A059]"
                        checked={selectedIds.includes(id)}
                        onChange={(e) => toggleSelectOne(id, e.target.checked)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center mix-blend-multiply p-1 overflow-hidden">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">N/A</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.brand || "—"}
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
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
                          isSold
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                        title={
                          isSold
                            ? "Shows SOLD on the website; auto-deletes after 1 day. Click to mark available again."
                            : "Mark sold — red SOLD on website; auto-deletes after 1 day"
                        }
                      >
                        {isSold ? "Sold" : "Available"}
                      </button>
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
                          onClick={() => handleDelete(id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {products.length === 0
                        ? "No products found. Create one to get started."
                        : "No products match your search or filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto p-6 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Left column — basics */}
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value, brand: "" })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Brand{" "}
                      <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <select
                      className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      disabled={!formData.category}
                    >
                      <option value="">
                        {formData.category ? "Select Brand" : "Select Category First"}
                      </option>
                      {availableBrands.map((brand: any) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
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
                  <Label>Description</Label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Shown on the product page Description tab. Leave blank to use the default store text."
                  />
                </div>
                <ProductImageManager images={imageList} onChange={setImageList} />
              </div>

              {/* Right column — highlights & specs */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Highlights</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHighlightsList([...highlightsList, ""])}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Highlight
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Checklist items under the description. Leave empty for the default store list.
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {highlightsList.map((line, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. 100% authentic product"
                          value={line}
                          onChange={(e) => {
                            const next = [...highlightsList];
                            next[index] = e.target.value;
                            setHighlightsList(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 shrink-0"
                          onClick={() => {
                            const next = highlightsList.filter((_, i) => i !== index);
                            setHighlightsList(next.length ? next : [""]);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
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
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
