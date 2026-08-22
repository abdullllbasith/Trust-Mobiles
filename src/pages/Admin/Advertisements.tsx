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
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch, apiFetchArray } from "@/lib/api";

export default function AdminAdvertisements() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    endDate: "",
    image: "",
    link: "",
    position: "carousel",
    active: true,
  });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await apiFetchArray("/api/ads", {
        fallbackError: "Failed to fetch ads",
      });
      setAds(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch ads");
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpen = (ad?: any) => {
    if (ad) {
      setEditingId(ad.id);
      setFormData({
        title: ad.title,
        description: ad.description || "",
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : "",
        image: ad.image,
        link: ad.link,
        position: ad.position || "carousel",
        active: ad.active,
      });
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", endDate: "", image: "", link: "", position: "carousel", active: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Ad title is required");
      return;
    }
    if (!formData.image) {
      toast.error("Please upload an ad image");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/ads/${editingId}` : "/api/ads";
      const method = editingId ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        auth: true,
        body: JSON.stringify(formData),
        fallbackError: "Failed to save advertisement",
      });
      toast.success(`Advertisement ${editingId ? "updated" : "created"}`);
      setIsModalOpen(false);
      fetchAds();
    } catch (err: any) {
      toast.error(err.message || "Error saving advertisement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?"))
      return;
    try {
      await apiFetch(`/api/ads/${id}`, {
        method: "DELETE",
        auth: true,
        fallbackError: "Failed to delete advertisement",
      });
      toast.success("Advertisement deleted");
      fetchAds();
    } catch (err: any) {
      toast.error(err.message || "Error deleting advertisement");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Advertisements & Banners</CardTitle>
          <CardDescription>
            Manage promotional banners for the website.
          </CardDescription>
        </div>
        <Button className="gap-2" onClick={() => handleOpen()}>
          <Plus className="h-4 w-4" /> Add Ad
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
                  <TableHead>Ad Banner</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad: any) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center overflow-hidden">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-medium">{ad.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {ad.position || "carousel"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ad.active ? "default" : "secondary"}>
                        {ad.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {ad.link || "None"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(ad)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {ads.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No advertisements found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Advertisement" : "Add New Advertisement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <select
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="carousel">Carousel (Scrolling Horizontal Ads)</option>
                <option value="banner">Prominent Banner (Bottom Section)</option>
                <option value="flash_sale">Flash Sale</option>
              </select>
            </div>
            {formData.position === 'flash_sale' && (
              <>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Action Link (Optional)</Label>
              <Input
                placeholder="https://example.com/promo"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Banner Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required={!formData.image}
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-24 w-auto object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="active-status"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="active-status">Active (Show on website)</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Advertisement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
