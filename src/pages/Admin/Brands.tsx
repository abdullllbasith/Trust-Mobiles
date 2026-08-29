import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

export default function AdminBrands({ brands, categories, loading, fetchData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleToggleCategory = (categoryName: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked
        ? prev.includes(categoryName) ? prev : [...prev, categoryName]
        : prev.filter((c) => c !== categoryName),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Brand name is required");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/brands", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ name: trimmed, categories: selectedCategories }),
        fallbackError: "Failed to save brand",
      });
      toast.success("Brand created");
      setIsModalOpen(false);
      setName("");
      setSelectedCategories([]);
      fetchData({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Error saving brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await apiFetch(`/api/brands/${id}`, {
        method: "DELETE",
        auth: true,
        fallbackError: "Failed to delete brand",
      });
      toast.success("Brand deleted");
      fetchData({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Error deleting brand");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Brands Management</CardTitle>
          <CardDescription>
            Manage brands and assign them to categories.
          </CardDescription>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Associated Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand: any) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {brand.categories?.map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(brand.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {brands.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No brands found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Apple, Samsung"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Select Categories</Label>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={selectedCategories.includes(cat.name)}
                      onCheckedChange={(checked) =>
                        handleToggleCategory(cat.name, checked === true)
                      }
                    />
                    <label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-2">No categories available. Please create categories first.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Brand"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
