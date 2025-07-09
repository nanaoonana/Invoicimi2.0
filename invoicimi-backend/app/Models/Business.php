<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'logo_url',
        'email',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'country',
        'default_currency',
        'tax_id',
        'bank_details',
        'mobile_money_details',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'bank_details' => 'array',
        'mobile_money_details' => 'array',
    ];

    /**
     * Get the user that owns the business.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the invoices for the business.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
