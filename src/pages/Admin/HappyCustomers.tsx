import React, { useState, useEffect } from "react";
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
import { Loader2, Plus, Edit, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch, apiFetchArray } from "@/lib/api";
import { compressImageFile } from "@/lib/compressImage";

type HappyCustomer = {
  id: string;
  name?: string;
  caption?: string;
  image: string;
  active: boolean;
  sortOrder?: number;
};

const emptyForm = {
  name: "",
  caption: "",
  image: "",
  active: true,
  sortOrder: "0",
};

export default function AdminHappyCustomers() {
  const [items, setItems] = useState<HappyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiFetchArray("/api/happy-customers?all=1", {
        fallbackError: "Failed to load happy customers",
      });
      setItems(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load happy customers");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 1500,
        quality: 0.82,
      });
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    } catch {
      toast.error("Could not process that image. Try another photo.");
    }
  };

  const handleOpen = (item?: HappyCustomer) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name || "",
        caption: item.caption || "",
        image: item.image,
        active: item.active !== false,
        sortOrder: String(item.sortOrder ?? 0),
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Please upload a customer photo");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: formData.name.trim(),
        caption: formData.caption.trim(),
        image: formData.image,
        active: formData.active,
        sortOrder: Number(formData.sortOrder) || 0,
      };
      const url = editingId
        ? `/api/happy-customers/${editingId}`
        : "/api/happy-customers";
      const method = editingId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        auth: true,
        body: JSON.stringify(body),
        fallbackError: "Failed to save happy customer",
      });
      toast.success(editingId ? "Customer photo updated" : "Customer photo added");
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this photo from the carousel?")) return;
    try {
      await apiFetch(`/api/happy-customers/${id}`, {
        method: "DELETE",
        auth: true,
        fallbackError: "Failed to delete",
      });
      toast.success("Removed");
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Error deleting");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Happy Customers</CardTitle>
          <CardDescription>
            Photos shown in the homepage Happy Customers carousel. Lower sort
            order appears first.
          </CardDescription>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => handleOpen()}>
          <Plus className="h-4 w-4" /> Add Photo
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
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.image}
                        alt={item.name || "Customer"}
                        className="h-14 w-14 rounded-lg object-cover border"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.name || "—"}</div>
                      {item.caption ? (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {item.caption}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.sortOrder ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No photos yet. Add customer images to show on the homepage.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Customer Photo" : "Add Customer Photo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Photo</Label>
              {formData.image ? (
                <div className="relative overflow-hidden rounded-xl border">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                  <label className="absolute bottom-3 right-3">
                    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold shadow">
                      <Upload className="h-3.5 w-3.5" /> Change
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-500 hover:border-[#C5A059]">
                  <Upload className="h-6 w-6" />
                  Upload customer photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label>Customer name (optional)</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Ayesha"
              />
            </div>
            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                placeholder="Short note shown under the photo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.active ? "active" : "hidden"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      active: e.target.value === "active",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
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
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Photo"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
