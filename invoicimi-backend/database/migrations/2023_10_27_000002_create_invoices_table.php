<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->onDelete('cascade');
            // Assuming 'clients' table will be created later.
            // Nullable for now, or remove if client is always required from the start.
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('set null');

            $table->string('invoice_number');
            $table->string('status')->default('draft'); // e.g., draft, sent, paid, overdue, void
            $table->date('issue_date');
            $table->date('due_date');

            $table->decimal('subtotal', 10, 2);
            $table->json('tax_details')->nullable(); // Store array of tax objects: {name, rate, amount}
            $table->decimal('total_tax_amount', 10, 2)->nullable()->default(0);

            $table->string('discount_type')->nullable(); // 'fixed' or 'percentage'
            $table->decimal('discount_value', 10, 2)->nullable(); // The rate or fixed amount
            $table->decimal('discount_amount', 10, 2)->nullable()->default(0);

            $table->decimal('total_amount', 10, 2);
            $table->decimal('amount_paid', 10, 2)->default(0);

            $table->text('notes')->nullable();
            $table->text('terms')->nullable();

            $table->timestamps();

            // Optional: Add unique constraint for invoice_number per business
            // $table->unique(['business_id', 'invoice_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
