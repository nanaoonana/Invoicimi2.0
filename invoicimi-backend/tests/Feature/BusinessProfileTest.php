<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Business;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class BusinessProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a user and authenticate them for most tests
        $this->user = User::factory()->create();
        Sanctum::actingAs($this->user, ['*']); // Authenticate user for subsequent requests
    }

    public function test_authenticated_user_can_create_business_profile(): void
    {
        $businessData = [
            'name' => 'My Awesome Business',
            'email' => 'contact@awesome.biz',
            'phone' => '1234567890',
            'address_line1' => '123 Main St',
            'city' => 'Business City',
            'country' => 'GH',
            'default_currency' => 'GHS',
            'tax_id' => 'TAX12345',
            'bank_details' => ['bank_name' => 'Global Bank', 'account_number' => '0011223344'],
            'mobile_money_details' => ['provider' => 'MTN', 'number' => '0244000000'],
        ];

        $response = $this->postJson('/api/business', $businessData);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'My Awesome Business'])
                 ->assertJsonFragment(['email' => 'contact@awesome.biz']);

        $this->assertDatabaseHas('businesses', [
            'user_id' => $this->user->id,
            'name' => 'My Awesome Business',
            'email' => 'contact@awesome.biz',
        ]);
    }

    public function test_user_cannot_create_business_profile_if_one_exists(): void
    {
        Business::factory()->create(['user_id' => $this->user->id]); // Existing profile

        $businessData = ['name' => 'Another Business'];
        $response = $this->postJson('/api/business', $businessData);

        $response->assertStatus(409) // Conflict
                 ->assertJson(['message' => 'User already has a business profile. Use PUT to update.']);
    }

    public function test_create_business_profile_validation_works(): void
    {
        $response = $this->postJson('/api/business', ['name' => '']); // Missing required name
        $response->assertStatus(422)->assertJsonValidationErrors(['name']);

        $response = $this->postJson('/api/business', ['name' => 'Valid Name', 'email' => 'not-an-email']);
        $response->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_view_their_business_profile(): void
    {
        $business = Business::factory()->create(['user_id' => $this->user->id, 'name' => 'View Test Inc.']);

        $response = $this->getJson('/api/business');

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'View Test Inc.'])
                 ->assertJsonPath('id', $business->id);
    }

    public function test_user_without_profile_gets_404_on_view(): void
    {
        // User exists but has no business profile
        $response = $this->getJson('/api/business');
        $response->assertStatus(404);
    }

    public function test_authenticated_user_can_update_their_business_profile(): void
    {
        $business = Business::factory()->create(['user_id' => $this->user->id, 'name' => 'Old Name']);
        $updateData = [
            'name' => 'New Updated Name',
            'phone' => '0987654321',
            'default_currency' => 'USD',
        ];

        $response = $this->putJson('/api/business', $updateData);

        $response->assertStatus(200)
                 ->assertJsonFragment(['name' => 'New Updated Name'])
                 ->assertJsonFragment(['phone' => '0987654321']);

        $this->assertDatabaseHas('businesses', [
            'id' => $business->id,
            'name' => 'New Updated Name',
            'phone' => '0987654321',
        ]);
    }

    public function test_user_cannot_update_non_existent_profile(): void
    {
        $updateData = ['name' => 'Trying to update nothing'];
        $response = $this->putJson('/api/business', $updateData);
        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_business_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->create()); // Authenticate a different user
        $this->user = User::factory()->create(); // Our target user is now different
        Sanctum::actingAs($this->user); // Remove our target user's auth

        // Re-run with no authentication for the current $this->user
        Auth::logout(); // Ensure no user is globally authenticated for the test instance

        $responseGet = $this->getJson('/api/business');
        $responseGet->assertStatus(401); // Unauthorized

        $responsePost = $this->postJson('/api/business', ['name' => 'Test']);
        $responsePost->assertStatus(401);

        $responsePut = $this->putJson('/api/business', ['name' => 'Test']);
        $responsePut->assertStatus(401);
    }
}
