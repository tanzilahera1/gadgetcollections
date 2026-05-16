import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { redirect } from "next/navigation";
import Order from "@/models/Order";
import User from "@/models/User";
import { formatPrice } from "@/lib/priceUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  MapPin,
  Heart,
  User as UserIcon,
  History,
  ArrowRight,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Overview | GadgetCollections",
  description: "View your account overview and recent activities.",
};

const STATUS_ICONS = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: Package,
};

const STATUS_COLORS = {
  pending: "text-amber-500 bg-amber-50 border-amber-200",
  processing: "text-blue-500 bg-blue-50 border-blue-200",
  shipped: "text-indigo-500 bg-indigo-50 border-indigo-200",
  delivered: "text-emerald-500 bg-emerald-50 border-emerald-200",
  cancelled: "text-rose-500 bg-rose-50 border-rose-200",
};

interface RecentOrderData {
  _id: string;
  orderNumber: string;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
}

async function getDashboardStats(userId: string) {
  await dbConnect();
  const [orderCount, userRecord, recentOrders] = await Promise.all([
    Order.countDocuments({ user: userId }),
    User.findById(userId).select("wishlist").lean<{ wishlist: string[] }>(),
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(2)
      .select("_id orderNumber orderStatus total createdAt")
      .lean(),
  ]);

  return {
    orderCount,
    wishlistCount: userRecord?.wishlist?.length || 0,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)) as RecentOrderData[],
  };
}

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const stats = await getDashboardStats(session.user.id!);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
        <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Welcome back,{" "}
              <span className="text-primary">
                {session.user.name?.split(" ")[0] || "User"}!
              </span>
            </h1>
            <p className="text-slate-500 font-medium tracking-tight max-w-md">
              Here is an overview of your account activities. Manage your
              profile, track upcoming orders, and review saved items.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="bg-white/60 p-4 rounded-3xl border border-white/80 shadow-sm text-center min-w-[100px]">
              <p className="text-3xl font-black text-slate-900">
                {stats.orderCount}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Total Orders
              </p>
            </div>
            <div className="bg-white/60 p-4 rounded-3xl border border-white/80 shadow-sm text-center min-w-[100px]">
              <p className="text-3xl font-black text-slate-900">
                {stats.wishlistCount}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Wishlist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Modules */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Quick Navigation
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* My Orders */}
            <Link href="/dashboard/my-orders" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden flex flex-col items-start gap-6">
                <div className="size-14 rounded-2xl bg-blue-50 text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                  <ShoppingBag className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                    My Orders
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    Track & manage orders
                  </p>
                </div>
                <ArrowRight className="size-6 text-slate-300 absolute bottom-8 right-8 group-hover:translate-x-2 group-hover:text-primary transition-all duration-300" />
              </div>
            </Link>

            {/* Wishlist */}
            <Link href="/dashboard/wishlist" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 relative overflow-hidden flex flex-col items-start gap-6">
                <div className="size-14 rounded-2xl bg-rose-50 text-rose-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                  <Heart className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-rose-500 transition-colors">
                    Wishlist
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    Your saved products
                  </p>
                </div>
                <ArrowRight className="size-6 text-slate-300 absolute bottom-8 right-8 group-hover:translate-x-2 group-hover:text-rose-500 transition-all duration-300" />
              </div>
            </Link>

            {/* Addresses */}
            <Link href="/dashboard/addresses" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden flex flex-col items-start gap-6">
                <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                  <MapPin className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-500 transition-colors">
                    Addresses
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    Manage shipping info
                  </p>
                </div>
                <ArrowRight className="size-6 text-slate-300 absolute bottom-8 right-8 group-hover:translate-x-2 group-hover:text-emerald-500 transition-all duration-300" />
              </div>
            </Link>

            {/* Profile Details */}
            <Link href="/dashboard/profile" className="group">
              <div className="h-full bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 relative overflow-hidden flex flex-col items-start gap-6">
                <div className="size-14 rounded-2xl bg-violet-50 text-violet-500 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                  <UserIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-violet-500 transition-colors">
                    Profile
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    Update account settings
                  </p>
                </div>
                <ArrowRight className="size-6 text-slate-300 absolute bottom-8 right-8 group-hover:translate-x-2 group-hover:text-violet-500 transition-all duration-300" />
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity / Orders */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              Recent Activity
            </h2>
            <Link
              href="/dashboard/my-orders"
              className="text-xs font-black text-primary hover:underline underline-offset-4 decoration-2"
            >
              View All
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col gap-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => {
                const StatusIcon =
                  STATUS_ICONS[order.orderStatus || "pending"] || Clock;
                return (
                  <Link
                    key={order._id}
                    href={`/dashboard/my-orders/${order._id}`}
                    className="group relative block p-4 rounded-2xl hover:bg-slate-50 transition-colors border-b border-dashed border-slate-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shadow-sm border",
                            STATUS_COLORS[order.orderStatus || "pending"],
                          )}
                        >
                          <StatusIcon className="size-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-slate-900">
                          {formatPrice(order.total)}
                        </p>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-12 px-4">
                <ListOrdered className="size-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-900">
                  No recent orders
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  When you place orders, they will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Payment History Teaser */}
          <Link
            href="/dashboard/payments"
            className="block mt-4 relative overflow-hidden bg-slate-900 text-white rounded-[2rem] p-6 hover:shadow-lg transition-all group"
          >
            <div className="absolute -right-8 -top-8 size-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <History className="size-6 text-amber-400" />
              </div>
              <div className="pr-8">
                <h3 className="font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Payment History
                </h3>
                <p className="text-slate-400 font-medium text-xs mt-0.5 max-w-[200px]">
                  Review past invoices and payment proofs.
                </p>
              </div>
              <ArrowRight className="size-5 text-white/30 absolute right-0 top-1/2 -translate-y-1/2 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
