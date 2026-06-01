import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Users, ShoppingCart, Activity } from "lucide-react";
import AdminProducts from "./Products";
import AdminOrders from "./Orders";
import AdminUsers from "./Users";
import AdminAdvertisements from "./Advertisements";
import AdminCategories from "./Categories";
import AdminBrands from "./Brands";

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, usrRes, catRes, brandRes] = await Promise.all([
        fetch(`/api/products`),
        fetch(`/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/categories`),
        fetch(`/api/brands`)
      ]);
      const prodData = await prodRes.json();
      const ordData = await ordRes.json();
      const usrData = await usrRes.json();
      const catData = await catRes.json();
      const brandData = await brandRes.json();

      setProducts(prodData);
      setOrders(Array.isArray(ordData) ? ordData : []);
      setUsers(Array.isArray(usrData) ? usrData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
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
    <div className="flex-1 bg-gray-50/50 min-h-screen py-8 md:py-10">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-gray-900 mb-2">Admin Command Center</h1>
            <p className="text-gray-500 text-base md:text-lg">
              Manage your store, products, orders, and promotions seamlessly.
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          orientation="vertical"
          className="flex flex-col lg:flex-row gap-8 lg:gap-12"
        >
          <TabsList className="bg-transparent lg:bg-white lg:border lg:border-gray-100 lg:shadow-sm w-full lg:w-72 flex flex-row lg:flex-col justify-start p-0 lg:p-4 h-fit gap-2 lg:rounded-3xl overflow-x-auto hide-scrollbar shrink-0">
            <TabsTrigger
              value="overview"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Brands
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Customers (CRM)
            </TabsTrigger>
            <TabsTrigger
              value="ads"
              className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
            >
              Promotions
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden min-w-0">
            <TabsContent value="overview" className="mt-0">
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

            <TabsContent value="products" className="mt-0">
              <AdminProducts
                products={products}
                categories={categories}
                brands={brands}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <AdminCategories
                categories={categories}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="brands" className="mt-0">
              <AdminBrands
                brands={brands}
                categories={categories}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <AdminOrders
                orders={orders}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <AdminUsers
                users={users}
                loading={loading}
                fetchData={fetchData}
              />
            </TabsContent>

            <TabsContent value="ads" className="mt-0">
              <AdminAdvertisements />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
