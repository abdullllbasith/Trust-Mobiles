import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Users, ShoppingCart, Activity } from "lucide-react";
import AdminProducts from "./Products";
import AdminOrders from "./Orders";
import AdminUsers from "./Users";
import AdminAdvertisements from "./Advertisements";

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, usrRes] = await Promise.all([
        fetch(`/api/products`),
        fetch(`/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const usrData = await usrRes.json();

      setProducts(prodData);
      setOrders(Array.isArray(ordData) ? ordData : []);
      setUsers(Array.isArray(usrData) ? usrData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalPrice,
    0,
  );

  return (
    <div className="flex-1 bg-gray-50/50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 mb-2">Admin Command Center</h1>
            <p className="text-gray-500 text-lg">
              Manage your store, products, orders, and promotions seamlessly.
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          orientation="vertical"
          className="flex flex-col md:flex-row gap-10"
        >
          <TabsList className="bg-white border border-gray-100 shadow-sm w-full md:w-72 flex flex-col justify-start p-3 h-fit gap-2 rounded-2xl">
            <TabsTrigger
              value="overview"
              className="w-full justify-start py-4 px-5 font-medium text-base rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="w-full justify-start py-4 px-5 font-medium text-base rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="w-full justify-start py-4 px-5 font-medium text-base rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="w-full justify-start py-4 px-5 font-medium text-base rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Customers (CRM)
            </TabsTrigger>
            <TabsTrigger
              value="ads"
              className="w-full justify-start py-4 px-5 font-medium text-base rounded-xl data-[state=active]:bg-black data-[state=active]:text-white transition-all"
            >
              Promotions & Flash Sales
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="rounded-3xl shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </CardTitle>
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                      <Activity className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-gray-900 mt-2">
                      LKR {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Orders
                    </CardTitle>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-gray-900 mt-2">{orders.length}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Products
                    </CardTitle>
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                      <Box className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-gray-900 mt-2">{products.length}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl shadow-sm border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Customers
                    </CardTitle>
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-gray-900 mt-2">{users.length}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <AdminProducts
                products={products}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="orders">
              <AdminOrders
                orders={orders}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers
                users={users}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="ads">
              <AdminAdvertisements />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
