<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Business;
// use App\Models\Client; // Will be needed when Client model is fully implemented
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 50, 1000);
        $taxRate = $this->faker->randomElement([0, 0.05, 0.1, 0.125]); // Example tax rates
        $totalTaxAmount = $subtotal * $taxRate;

        $discountType = $this->faker->randomElement([null, 'fixed', 'percentage']);
        $discountValue = 0;
        $discountAmount = 0;

        if ($discountType === 'fixed') {
            $discountValue = $this->faker->randomFloat(2, 5, $subtotal / 4);
            $discountAmount = $discountValue;
        } elseif ($discountType === 'percentage') {
            $discountValue = $this->faker->randomFloat(2, 1, 15); // Percentage value e.g. 10 for 10%
            $discountAmount = ($subtotal * $discountValue) / 100;
        }

        $totalAmount = $subtotal + $totalTaxAmount - $discountAmount;
        $status = $this->faker->randomElement(['draft', 'sent', 'paid', 'overdue', 'void']);
        $amountPaid = ($status === 'paid') ? $totalAmount : $this->faker->randomFloat(2, 0, $totalAmount / 2);


        return [
            'business_id' => Business::factory(),
            // 'client_id' => Client::factory(), // Add when Client model and factory exist
            'client_id' => null, // For now, until ClientFactory is available
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('######'),
            'status' => $status,
            'issue_date' => Carbon::instance($this->faker->dateTimeBetween('-1 year', 'now'))->format('Y-m-d'),
            'due_date' => Carbon::instance($this->faker->dateTimeBetween('now', '+1 year'))->format('Y-m-d'),
            'subtotal' => $subtotal,
            'tax_details' => $taxRate > 0 ? [['name' => 'VAT', 'rate' => $taxRate * 100, 'amount' => $totalTaxAmount]] : null,
            'total_tax_amount' => $totalTaxAmount,
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'amount_paid' => $amountPaid,
            'notes' => $this->faker->optional()->sentence,
            'terms' => $this->faker->optional()->paragraph,
        ];
    }

    public function forBusiness(Business $business): static
    {
        return $this->state(fn (array $attributes) => [
            'business_id' => $business->id,
        ]);
    }

    // public function forClient(Client $client): static
    // {
    //     return $this->state(fn (array $attributes) => [
    //         'client_id' => $client->id,
    //     ]);
    // }

    public function status(string $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }

    public function paid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'paid',
                'amount_paid' => $attributes['total_amount'],
            ];
        });
    }

    public function unpaid(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => $this->faker->randomElement(['sent', 'overdue']),
                'amount_paid' => 0,
            ];
        });
    }
}
