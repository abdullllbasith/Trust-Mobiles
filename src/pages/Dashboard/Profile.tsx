import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="flex-1 bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground mb-8">
          Manage your orders and personal details.
        </p>

        <Tabs
          defaultValue="orders"
          className="w-full flex md:flex-row flex-col gap-8"
        >
          <div className="md:w-64 w-full flex-shrink-0">
            <TabsList className="flex md:flex-col h-auto bg-transparent items-start w-full gap-2 p-0">
              <TabsTrigger
                value="orders"
                className="w-full justify-start md:text-left text-center data-[state=active]:bg-secondary data-[state=active]:shadow-none text-base py-3"
              >
                <Package className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="w-full justify-start md:text-left text-center data-[state=active]:bg-secondary data-[state=active]:shadow-none text-base py-3"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="w-full justify-start md:text-left text-center data-[state=active]:bg-secondary data-[state=active]:shadow-none text-base py-3"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Addresses
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="orders" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No orders found.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Order #{1000 + order.id}
                              </p>
                              <p className="text-sm font-medium">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {order.paymentStatus}
                              </Badge>
                              <Badge className="bg-primary text-primary-foreground capitalize">
                                {order.orderStatus}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-primary">
                                LKR {order.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-secondary/50 rounded flex items-center justify-center p-1 mix-blend-multiply">
                                  <img
                                    src={
                                      typeof item.images === "string"
                                        ? JSON.parse(item.images)[0]
                                        : item.images[0]
                                    }
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="text-sm font-medium">
                                  LKR 
                                  {(
                                    item.price *
                                    (1 - item.discount / 100) *
                                    item.quantity
                                  ).toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Full Name
                      </p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Email Address
                      </p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <Badge variant="outline" className="capitalize">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    We'll save your address from your next order here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
