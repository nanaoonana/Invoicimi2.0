<?php

namespace App\Http\Controllers;

use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class BusinessController extends Controller
{
    /**
     * Display the authenticated user's business profile.
     */
    public function show(Request $request): JsonResponse
    {
        $business = $request->user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found.'], 404);
        }

        return response()->json($business);
    }

    /**
     * Store a newly created business profile in storage for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->business) {
            return response()->json(['message' => 'User already has a business profile. Use PUT to update.'], 409); // 409 Conflict
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'logo_url' => 'nullable|string|url|max:255',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'default_currency' => 'nullable|string|max:3',
            'tax_id' => 'nullable|string|max:50',
            'bank_details' => 'nullable|array',
            'mobile_money_details' => 'nullable|array',
        ]);

        // Ensure default currency is set if not provided
        if (empty($validatedData['default_currency'])) {
            $validatedData['default_currency'] = 'GHS';
        }

        $business = $user->business()->create($validatedData);

        return response()->json($business, 201);
    }

    /**
     * Update the authenticated user's business profile in storage.
     */
    public function update(Request $request): JsonResponse
    {
        $business = $request->user()->business;

        if (!$business) {
            return response()->json(['message' => 'Business profile not found. Use POST to create.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255', // sometimes: only validate if present
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'logo_url' => 'nullable|string|url|max:255',
            'address_line1' => 'nullable|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'default_currency' => 'nullable|string|max:3',
            'tax_id' => 'nullable|string|max:50',
            'bank_details' => 'nullable|array',
            'mobile_money_details' => 'nullable|array',
        ]);

        $business->update($validatedData);

        return response()->json($business);
    }
}
