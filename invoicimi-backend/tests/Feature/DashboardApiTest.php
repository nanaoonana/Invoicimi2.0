<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Business;
use App\Models\Invoice;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Business $business;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->business = Business::factory()->create(['user_id' => $this->user->id]);
        Sanctum::actingAs($this->user);
    }

    public function test_get_dashboard_stats_unauthenticated(): void
    {
        Sanctum::actingAs(User::factory()->create()); // Authenticate a different user
        Auth::logout(); // Ensure no user is globally authenticated for the test instance

        $response = $this->getJson('/api/dashboard/stats');
        $response->assertStatus(401);
    }

    public function test_get_dashboard_stats_no_business_profile(): void
    {
        $newUser = User::factory()->create(); // User without a business
        Sanctum::actingAs($newUser);

        $response = $this->getJson('/api/dashboard/stats');
        $response->assertStatus(404)
                 ->assertJson(['message' => 'Business profile not found for the user.']);
    }

    public function test_get_dashboard_stats_no_invoices(): void
    {
        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'total_revenue' => 0.0,
                'pending_invoices_count' => 0,
                'pending_amount' => 0.0,
                'paid_invoices_count' => 0,
            ]);
    }

    public function test_get_dashboard_stats_with_data(): void
    {
        // Paid invoices contributing to revenue
        Invoice::factory()->forBusiness($this->business)->paid()->create(['total_amount' => 1000, 'amount_paid' => 1000]);
        Invoice::factory()->forBusiness($this->business)->paid()->create(['total_amount' => 500, 'amount_paid' => 500]);

        // Pending invoices (sent/overdue)
        Invoice::factory()->forBusiness($this->business)->status('sent')->create(['total_amount' => 200, 'amount_paid' => 50]); // 150 pending
        Invoice::factory()->forBusiness($this->business)->status('overdue')->create(['total_amount' => 300, 'amount_paid' => 0]); // 300 pending

        // Draft invoice (should not be counted in these stats)
        Invoice::factory()->forBusiness($this->business)->status('draft')->create(['total_amount' => 100]);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'total_revenue' => 1500.0,
                'pending_invoices_count' => 2,
                'pending_amount' => 450.0, // 150 + 300
                'paid_invoices_count' => 2,
            ]);
    }

    public function test_get_recent_invoices_unauthenticated(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Auth::logout();

        $response = $this->getJson('/api/dashboard/recent-invoices');
        $response->assertStatus(401);
    }

    public function test_get_recent_invoices_no_business_profile(): void
    {
        $newUser = User::factory()->create();
        Sanctum::actingAs($newUser);

        $response = $this->getJson('/api/dashboard/recent-invoices');
        $response->assertStatus(404)
                 ->assertJson(['message' => 'Business profile not found for the user.']);
    }

    public function test_get_recent_invoices_no_invoices(): void
    {
        $response = $this->getJson('/api/dashboard/recent-invoices');
        $response->assertStatus(200)->assertJsonCount(0);
    }

    public function test_get_recent_invoices_returns_correct_data_and_order(): void
    {
        $invoice1 = Invoice::factory()->forBusiness($this->business)->create(['created_at' => Carbon::now()->subDays(2)]);
        $invoice2 = Invoice::factory()->forBusiness($this->business)->create(['created_at' => Carbon::now()->subDays(1)]); // More recent
        $invoice3 = Invoice::factory()->forBusiness($this->business)->create(['created_at' => Carbon::now()]); // Most recent
        Invoice::factory()->forBusiness($this->business)->count(3)->create(['created_at' => Carbon::now()->subDays(5)]); // Older ones

        $response = $this->getJson('/api/dashboard/recent-invoices');

        $response->assertStatus(200)
            ->assertJsonCount(3) // We created 3 specifically timed, limit is 5 but we only expect these 3 to be "most recent" in test
            ->assertJsonPath('0.invoice_number', $invoice3->invoice_number) // Most recent first
            ->assertJsonPath('1.invoice_number', $invoice2->invoice_number)
            ->assertJsonPath('2.invoice_number', $invoice1->invoice_number)
            ->assertJsonStructure([
                '*' => ['id', 'invoice_number', 'client_name', 'status', 'due_date', 'total_amount', 'created_at']
            ]);
    }

    public function test_get_recent_invoices_respects_limit(): void
    {
        Invoice::factory()->forBusiness($this->business)->count(7)->create();

        $response = $this->getJson('/api/dashboard/recent-invoices');
        $response->assertStatus(200)->assertJsonCount(5); // Limit is 5 in controller
    }
}
