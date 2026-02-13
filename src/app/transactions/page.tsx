// "use client";

// import React, { useState, useCallback } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter, useSearchParams } from "next/navigation";
// import { TransactionService } from "@/services/transactionService";
// import { Button } from "@/components/ui/button";
// import {
//   MagnifyingGlass as MagnifyingGlassIcon,
//   Funnel as FunnelIcon,
//   CaretLeft as CaretLeftIcon,
//   CaretRight as CaretRightIcon,
//   CheckCircle as CheckCircleIcon,
//   XCircle as XCircleIcon,
//   Eye as EyeIcon,
//   Shield as ShieldIcon,
//   User as UserIcon,
//   DotsThreeVertical as DotsThreeVerticalIcon,
//   CrownIcon,
//   UsersIcon,
//   Spinner,
//   UserCircleIcon,
// } from "@phosphor-icons/react";
// import { useTranslation } from "@/hooks/useTranslation";
// import { useLanguageStore } from "@/store/languageStore";

// type TransactionStatus = "Completed" | "Pending" | "Failed" | "Refunded";
// type TransactionType = "Credit" | "Debit" | "Transfer" | "Withdrawal";

// interface Transaction {
//   id: string;
//   event_title: string;
//   user_name: string;
//   ticket_count: number;
//   payment_gateway: string;
//   amount: number;
//   currency: string;
//   status: string;
//   commission_amount: number;
//   organizer_share: number;
//   created_at: string;
// }

// export interface TransactionListResponse {
//   limit: number;
//   page: number;
//   total: number;
//   transactions: Transaction[];
//   pagination: { total: number; limit: number; page: number; has_more: boolean };
// }

// export default function TransactionsPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { locale } = useLanguageStore();
//   const { t } = useTranslation(locale);

//   const currentPage = Number(searchParams.get("page")) || 1;
//   const itemsPerPage = 10;

//   const [filterType, setFilterType] = useState<TransactionType | "">("");
//   const [filterStatus, setFilterStatus] = useState<TransactionStatus | "">("");
//   const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

//   const filter =
//     filterStatus || filterType
//       ? `${filterType || ""},${filterStatus || ""}`
//       : undefined;

//   const sort =
//     sorting.length > 0
//       ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`
//       : undefined;

//   const { data: response, isLoading } = useQuery<TransactionListResponse>({
//     queryKey: ["transactions", currentPage, itemsPerPage, filter, sort],
//     queryFn: () =>
//       TransactionService.getTransactions({
//         page: currentPage,
//         limit: itemsPerPage,
//         filter,
//         sort,
//       }),
//     keepPreviousData: true,
//   });
//   const updateParams = useCallback(
//     (updates: Record<string, string | null>) => {
//       const params = new URLSearchParams(window.location.search);

//       Object.entries(updates).forEach(([key, value]) => {
//         if (!value) {
//           params.delete(key);
//         } else {
//           params.set(key, value);
//         }
//       });

//       router.push(`/transactions?${params.toString()}`, { scroll: false });
//     },
//     [router],
//   );

//   const handlePageChange = useCallback(
//     (page: number) => {
//       updateParams({ page: page.toString() });
//     },
//     [updateParams],
//   );

//   const totalItems = response?.pagination?.total || 0;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const hasNextPage = response?.has_more ?? currentPage < totalPages;

//   const transactions = response?.transactions ?? [];

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {/* Filters */}
//       <div className="flex gap-3 mb-6">
//         <select
//           value={filterType}
//           onChange={(e) => setFilterType(e.target.value as TransactionType)}
//           className="border p-2 rounded"
//         >
//           <option value="">All Types</option>
//           <option value="Credit">Credit</option>
//           <option value="Debit">Debit</option>
//           <option value="Transfer">Transfer</option>
//           <option value="Withdrawal">Withdrawal</option>
//         </select>

//         <select
//           value={filterStatus}
//           onChange={(e) => setFilterStatus(e.target.value as TransactionStatus)}
//           className="border p-2 rounded"
//         >
//           <option value="">All Status</option>
//           <option value="Completed">Completed</option>
//           <option value="Pending">Pending</option>
//           <option value="Failed">Failed</option>
//           <option value="Refunded">Refunded</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl border overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-3">Event</th>
//               <th className="p-3">User</th>
//               <th className="p-3">Tickets</th>
//               <th className="p-3">Amount</th>
//               <th className="p-3">Commission</th>
//               <th className="p-3">Organizer Share</th>
//               <th className="p-3">Gateway</th>
//               <th className="p-3">Status</th>
//               <th className="p-3">Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {isLoading && (
//               <tr>
//                 <td colSpan={10} className="p-6 text-center">
//                   Loading transactions...
//                 </td>
//               </tr>
//             )}

//             {!isLoading && transactions.length === 0 && (
//               <tr>
//                 <td colSpan={10} className="p-6 text-center text-gray-400">
//                   No transactions found.
//                 </td>
//               </tr>
//             )}

//             {transactions.map((txn) => (
//               <tr key={txn.id} className="border-t hover:bg-gray-50">
//                 <td className="p-3 font-medium">{txn.event_title}</td>

//                 <td className="p-3">{txn.user_name}</td>

//                 <td className="p-3 text-center">{txn.ticket_count}</td>

//                 <td className="p-3 font-semibold">
//                   {txn.currency} {txn.amount.toFixed(2)}
//                 </td>

//                 <td className="p-3 text-orange-600 font-medium">
//                   {txn.currency} {txn.commission_amount.toFixed(2)}
//                 </td>

//                 <td className="p-3 text-green-600 font-medium">
//                   {txn.currency} {txn.organizer_share.toFixed(2)}
//                 </td>

//                 <td className="p-3 capitalize">{txn.payment_gateway}</td>

//                 <td className="p-3">
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full ${
//                       txn.status === "completed"
//                         ? "bg-green-100 text-green-700"
//                         : txn.status === "pending"
//                           ? "bg-yellow-100 text-yellow-700"
//                           : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {txn.status}
//                   </span>
//                 </td>

//                 <td className="p-3 text-gray-500 text-xs">
//                   {new Date(txn.created_at).toLocaleDateString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 0 && !isLoading && (
//         <div className="flex items-center justify-center gap-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
//             disabled={currentPage === 1}
//             className="gap-2 bg-gray-50"
//           >
//             <CaretLeftIcon weight="bold" className="w-4 h-4" />
//             {t("pagination.previous")}
//           </Button>

//           <div className="flex gap-2 bg-gray-50">
//             {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
//               let pageNumber: number;

//               // Show pages around current page
//               if (totalPages <= 5) {
//                 pageNumber = i + 1;
//               } else if (currentPage <= 3) {
//                 pageNumber = i + 1;
//               } else if (currentPage >= totalPages - 2) {
//                 pageNumber = totalPages - 4 + i;
//               } else {
//                 pageNumber = currentPage - 2 + i;
//               }

//               return (
//                 <Button
//                   key={pageNumber}
//                   variant={currentPage === pageNumber ? "default" : "outline"}
//                   size="icon"
//                   onClick={() => handlePageChange(pageNumber)}
//                   className="w-10 h-10"
//                 >
//                   {pageNumber}
//                 </Button>
//               );
//             })}
//           </div>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={!hasNextPage || currentPage >= totalPages}
//             className="gap-2"
//           >
//             {t("pagination.next")}
//             <CaretRightIcon weight="bold" className="w-4 h-4" />
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page