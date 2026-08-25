import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

function shortId(value: unknown) {
  const str = String(value ?? "");
  return str ? `#${str.slice(-6)}` : "—";
}

export default function AdminOrders({ orders = [], loading, fetchData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    orderStatus: "",
    paymentStatus: "",
  });

  const handleOpen = (order: any) => {
    setEditingOrder(order);
    setFormData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder?.id) return;
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${editingOrder.id}`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify(formData),
        fallbackError: "Failed to update order",
      });
      toast.success("Order updated");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error updating order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>View and manage customer orders.</CardDescription>
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {shortId(order.id)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="font-medium text-[#0D162B]">
                        {[order.address?.firstName, order.address?.lastName]
                          .filter(Boolean)
                          .join(" ") || "Guest"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.address?.phone || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.orderStatus === "delivered"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      LKR {Number(order.totalPrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpen(order)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No orders yet.
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
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.orderStatus}
                onChange={(e) =>
                  setFormData({ ...formData, orderStatus: e.target.value })
                }
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, paymentStatus: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
