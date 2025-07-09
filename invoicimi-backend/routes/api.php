<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/register', [RegisteredUserController::class, 'store'])
                ->middleware('guest')
                ->name('register');

Route{::post('/login', [AuthenticatedSessionController::class, 'store'])
                ->middleware('guest')
                ->name('login');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
                ->middleware('auth:sanctum')
                ->name('logout');

use App\Http\Controllers\BusinessController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Business Profile Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/business', [BusinessController::class, 'show'])->name('business.show');
    Route::post('/business', [BusinessController::class, 'store'])->name('business.store');
    Route::put('/business', [BusinessController::class, 'update'])->name('business.update');
    // Note: DELETE /business could be added if needed
});
