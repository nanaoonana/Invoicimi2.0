<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Invoice; // Will be used in later steps

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the authenticated user's business.
     */
    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $business = $user->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found for the user.'], 404);
        }

        // Total Revenue: Sum of total_amount for 'paid' invoices
        $totalRevenue = Invoice::where('business_id', $business->id)
            ->where('status', 'paid')
            ->sum('total_amount');

        // Pending Invoices: Count and Sum of outstanding for 'sent' or 'overdue' invoices
        $pendingInvoicesQuery = Invoice::where('business_id', $business->id)
            ->whereIn('status', ['sent', 'overdue']);

        $pendingInvoicesCount = $pendingInvoicesQuery->count();

        // Calculate pending amount: sum(total_amount - amount_paid)
        // Need to use DB::raw for this calculation if not easily doable via Eloquent aggregate
        // For simplicity, let's iterate if the DB driver doesn't support sum of differences directly
        // or if we want to be DB-agnostic without complex raw queries.
        // A more performant way for SQL would be SUM(total_amount - amount_paid)
        $pendingAmount = 0;
        Invoice::where('business_id', $business->id)
            ->whereIn('status', ['sent', 'overdue'])
            ->select('total_amount', 'amount_paid') // Select only necessary columns
            ->chunk(200, function ($invoices) use (&$pendingAmount) { // Process in chunks
                foreach ($invoices as $invoice) {
                    $pendingAmount += ($invoice->total_amount - $invoice->amount_paid);
                }
            });


        // Paid Invoices: Count of 'paid' invoices
        $paidInvoicesCount = Invoice::where('business_id', $business->id)
            ->where('status', 'paid')
            ->count();

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'pending_invoices_count' => $pendingInvoicesCount,
            'pending_amount' => (float) $pendingAmount,
            'paid_invoices_count' => $paidInvoicesCount,
            // 'outstanding_clients_count' => 0, // Placeholder for future
        ]);
    }

    // Method for getRecentInvoices will be added in the next step.

    /**
     * Get recent invoices for the authenticated user's business.
     */
    public function getRecentInvoices(Request $request): JsonResponse
    {
        $user = $request->user();
        $business = $user->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found for the user.'], 404);
        }

        $recentInvoices = Invoice::where('business_id', $business->id)
            ->orderBy('created_at', 'desc')
            ->limit(5) // Get 5 most recent invoices
            ->get([ // Select specific fields to return
                'id',
                'invoice_number',
                'client_id', // Will be just an ID for now, client_name needs Client model/relationship
                'status',
                'due_date',
                'total_amount',
                'created_at'
                // Later, we can eager load client name: ->with('client:id,name')
            ]);

        // Placeholder for client name - in a real scenario, you'd map this after fetching
        // or eager load if the Client model and relationship were fully set up.
        $invoicesWithClientPlaceholder = $recentInvoices->map(function ($invoice) {
            return [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'client_name' => $invoice->client_id ? 'Client ID ' . $invoice->client_id : 'N/A', // Placeholder
                'status' => $invoice->status,
                'due_date' => $invoice->due_date->format('Y-m-d'), // Format date
                'total_amount' => (float) $invoice->total_amount,
                'created_at' => $invoice->created_at->format('Y-m-d H:i:s'),
            ];
        });


        return response()->json($invoicesWithClientPlaceholder);
    }
}
