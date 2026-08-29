import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiFetchArray, ApiError } from "@/lib/api";
import AdminProducts from "./Products";
import AdminUsers from "./Users";
import AdminAdvertisements from "./Advertisements";
import AdminCategories from "./Categories";
import AdminBrands from "./Brands";
import AdminHappyCustomers from "./HappyCustomers";
import type { AdminPermissionId } from "@/lib/permissions";

const TAB_PERMISSION: Record<string, AdminPermissionId> = {
  products: "inventory",
  categories: "categories",
  brands: "brands",
  users: "users",
  ads: "promotions",
  happy: "happy_customers",
};

export default function AdminDashboard() {
  const { token, can } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const allowedTabs = useMemo(
    () =>
      (Object.keys(TAB_PERMISSION) as Array<keyof typeof TAB_PERMISSION>).filter(
        (tab) => can(TAB_PERMISSION[tab]),
      ),
    [can, token],
  );

  const defaultTab = allowedTabs[0] || "products";

  const fetchData = async () => {
    setLoading(true);
    try {
      const tasks: Array<Promise<void>> = [];

      if (can("inventory") || can("categories") || can("brands")) {
        tasks.push(
          apiFetchArray("/api/products?full=1", { fallbackError: "Failed to load products" })
            .then(setProducts)
            .catch((err) => {
              toast.error(err instanceof ApiError ? err.message : "Failed to load products");
              setProducts([]);
            }),
        );
        tasks.push(
          apiFetchArray("/api/categories", { fallbackError: "Failed to load categories" })
            .then(setCategories)
            .catch((err) => {
              toast.error(err instanceof ApiError ? err.message : "Failed to load categories");
              setCategories([]);
            }),
        );
        tasks.push(
          apiFetchArray("/api/brands", { fallbackError: "Failed to load brands" })
            .then(setBrands)
            .catch((err) => {
              toast.error(err instanceof ApiError ? err.message : "Failed to load brands");
              setBrands([]);
            }),
        );
      }

      if (can("users")) {
        tasks.push(
          apiFetchArray("/api/users", { auth: true, fallbackError: "Failed to load users" })
            .then(setUsers)
            .catch((err) => {
              toast.error(err instanceof ApiError ? err.message : "Failed to load users");
              setUsers([]);
            }),
        );
      }

      await Promise.all(tasks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data. Please refresh or log in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  if (allowedTabs.length === 0) {
    return (
      <div className="flex-1 bg-gray-50/50 min-h-screen py-16 px-4 text-center">
        <h1 className="text-2xl font-display font-bold text-[#1C1C1C] mb-2">
          No permissions assigned
        </h1>
        <p className="text-gray-500">
          Ask a full admin to grant you access to at least one admin section.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50/50 min-h-screen py-8 md:py-10">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-[#1C1C1C] mb-2">
              Trust Mobile Admin
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Manage inventory, users, and promotions.
            </p>
          </div>
        </div>

        <Tabs
          key={defaultTab}
          defaultValue={defaultTab}
          orientation="vertical"
          className="flex flex-col lg:flex-row gap-8 lg:gap-12"
        >
          <TabsList className="bg-transparent lg:bg-white lg:border lg:border-gray-100 lg:shadow-sm w-full lg:w-72 flex flex-row lg:flex-col justify-start p-0 lg:p-4 h-fit gap-2 lg:rounded-3xl overflow-x-auto hide-scrollbar shrink-0">
            {can("inventory") && (
              <TabsTrigger
                value="products"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                Inventory
              </TabsTrigger>
            )}
            {can("categories") && (
              <TabsTrigger
                value="categories"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                Categories
              </TabsTrigger>
            )}
            {can("brands") && (
              <TabsTrigger
                value="brands"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                Brands
              </TabsTrigger>
            )}
            {can("users") && (
              <TabsTrigger
                value="users"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                User Roles
              </TabsTrigger>
            )}
            {can("promotions") && (
              <TabsTrigger
                value="ads"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                Promotions
              </TabsTrigger>
            )}
            {can("happy_customers") && (
              <TabsTrigger
                value="happy"
                className="w-auto lg:w-full justify-start py-3 px-5 font-semibold text-sm lg:text-base rounded-full lg:rounded-2xl data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
              >
                Happy Customers
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-hidden min-w-0">
            {can("inventory") && (
              <TabsContent value="products" className="mt-0">
                <AdminProducts
                  products={products}
                  categories={categories}
                  brands={brands}
                  loading={loading}
                  fetchData={fetchData}
                />
              </TabsContent>
            )}

            {can("categories") && (
              <TabsContent value="categories" className="mt-0">
                <AdminCategories
                  categories={categories}
                  loading={loading}
                  fetchData={fetchData}
                />
              </TabsContent>
            )}

            {can("brands") && (
              <TabsContent value="brands" className="mt-0">
                <AdminBrands
                  brands={brands}
                  categories={categories}
                  loading={loading}
                  fetchData={fetchData}
                />
              </TabsContent>
            )}

            {can("users") && (
              <TabsContent value="users" className="mt-0">
                <AdminUsers
                  users={users}
                  loading={loading}
                  fetchData={fetchData}
                />
              </TabsContent>
            )}

            {can("promotions") && (
              <TabsContent value="ads" className="mt-0">
                <AdminAdvertisements />
              </TabsContent>
            )}

            {can("happy_customers") && (
              <TabsContent value="happy" className="mt-0">
                <AdminHappyCustomers />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
