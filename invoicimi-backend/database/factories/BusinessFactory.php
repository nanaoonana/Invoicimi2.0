<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Business;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Business>
 */
class BusinessFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Business::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // Associates with a new or existing user
            'name' => fake()->company(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address_line1' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => fake()->countryCode(), // e.g., 'GH', 'US'
            'default_currency' => fake()->randomElement(['GHS', 'USD', 'EUR']),
            'tax_id' => fake()->bothify('??######'),
            'bank_details' => [
                'bank_name' => fake()->company().' Bank',
                'account_number' => fake()->bankAccountNumber(),
            ],
            'mobile_money_details' => [
                'provider' => fake()->randomElement(['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money']),
                'number' => fake()->e164PhoneNumber(), // Generates international format phone number
            ],
        ];
    }
}
