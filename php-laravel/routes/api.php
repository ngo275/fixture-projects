<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookController;

Route::get('/', function () {
    return response()->json([
        'message' => 'Laravel API',
        'version' => '10.0'
    ]);
});

Route::apiResource('books', BookController::class);