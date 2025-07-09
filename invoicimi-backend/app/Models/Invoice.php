<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'client_id',
        'invoice_number',
        'status',
        'issue_date',
        'due_date',
        'subtotal',
        'tax_details', // JSON
        'total_tax_amount',
        'discount_type', // 'fixed' or 'percentage'
        'discount_value',
        'discount_amount',
        'total_amount',
        'amount_paid',
        'notes',
        'terms',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_details' => 'array',
        'total_tax_amount' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    /**
     * Get the business that owns the invoice.
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Get the client that the invoice belongs to.
     * Note: Client model needs to be created for this to be fully functional.
     */
    public function client(): BelongsTo
    {
        // Assuming App\Models\Client will be the model name
        return $this->belongsTo(Client::class);
    }
}
