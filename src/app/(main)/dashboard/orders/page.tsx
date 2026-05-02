// src/app/(main)/dashboard/orders/page.tsx
import { auth } from "@/auth";
import Order from "@/models/Order";
import { dbConnect } from "@/lib/db";
import { formatPrice } from "@/lib/priceUtils";
import { format } from "date-fns";
import { 
  Package, Truck, Clock, CheckCircle2, 
  ArrowRight, Search, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

const STATUS_STEPS = [
  { id: "pending", label: "Confirmed", icon: Clock },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export const metadata = {
  title: "My Orders | GadgetCollections",
  description: "Track your ongoing and past orders.",
};

interface OrderItemData {
  productImage: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
  items: OrderItemData[];
}

async function getUserOrders(userId: string): Promise<OrderData[]> {
  await dbConnect();
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(orders));
}

export default async function UserOrdersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/orders");
  }

  const orders = await getUserOrders(session.user.id!);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3 lowercase first-letter:uppercase">
             <ShoppingBag className="size-8 text-primary" />
             My Orders
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Review and track your recent purchases.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                 {orders.length}
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Orders</p>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const currentStatus = order.orderStatus || "pending";
          const currentStepIndex = STATUS_STEPS.findIndex(step => step.id === currentStatus);
          
          return (
            <div key={order._id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               {/* Order Info Header */}
               <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <Package className="size-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ORDER NUMBER</p>
                      <p className="text-lg font-black text-slate-900 tracking-tight">#{order.orderNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">PLACED ON</p>
                      <p className="text-xs font-bold text-slate-700">{format(new Date(order.createdAt), "dd MMM, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">TOTAL AMOUNT</p>
                      <p className="text-lg font-black text-primary tracking-tighter">{formatPrice(order.total)}</p>
                    </div>
                  </div>
               </div>

               {/* Tracking Progress */}
               {currentStatus !== 'cancelled' ? (
                 <div className="p-6 sm:p-8 border-b border-slate-100">
                    <div className="relative flex items-center justify-between">
                      {/* Background Line */}
                      <div className="absolute left-0 top-4 pt-0.5 w-full h-1 bg-slate-100 rounded-full" />
                      {/* Active Line */}
                      <div 
                        className="absolute left-0 top-4 pt-0.5 h-1 bg-primary rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                      />
                      
                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                             <div className={cn(
                               "size-9 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                               isCompleted 
                                 ? "bg-primary border-white text-white shadow-lg shadow-primary/20 scale-110" 
                                 : "bg-white border-slate-100 text-slate-300"
                             )}>
                               <step.icon className={cn("size-4", isCurrent && "animate-pulse")} />
                             </div>
                             <p className={cn(
                               "text-[10px] font-black uppercase tracking-widest text-center max-w-[80px]",
                               isCompleted ? "text-slate-900" : "text-slate-400"
                             )}>
                               {step.label}
                             </p>
                          </div>
                        );
                      })}
                    </div>
                 </div>
               ) : (
                 <div className="p-6 sm:p-8 border-b border-slate-100 bg-rose-50 flex items-center justify-center">
                    <p className="text-rose-600 font-bold uppercase tracking-widest text-sm">Order Cancelled</p>
                 </div>
               )}

               {/* Items Summary & Link */}
               <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex -space-x-3 overflow-hidden">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="relative size-12 rounded-xl border-2 border-white bg-slate-50 p-1 shadow-sm shrink-0">
                        <Image src={item.productImage || '/logo.png'} alt={item.productTitle} fill sizes="48px" className="object-contain p-1" />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="relative size-12 rounded-xl border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Link href={`/dashboard/orders/${order._id}`} className="w-full sm:w-auto">
                      <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black tracking-tight px-6 py-3 rounded-2xl border border-slate-200 transition-all group">
                         Order Details
                         <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
               </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
             <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="size-10 text-slate-300" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Orders Found</h3>
             <p className="text-slate-500 font-medium mb-8">You haven&apos;t placed any orders yet.</p>
             <Link href="/">
               <button className="bg-primary text-white font-black tracking-tight px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  Start Shopping
               </button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
