<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;

trait CreatesApplication
{
    /**
     * Creates the application.
     */
    public function createApplication(): Application
    {
        // The path to the bootstrap/app.php file will depend on where this backend code
        // is ultimately placed relative to a full Laravel application structure.
        // Assuming 'invoicimi-backend' is the root of the Laravel app for now.
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
