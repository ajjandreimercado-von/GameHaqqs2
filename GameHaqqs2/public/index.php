<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Load Composer's autoloader
require __DIR__.'/../vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once __DIR__.'/../bootstrap/app.php';

/** @var Kernel $kernel */
$kernel = $app->make(Kernel::class);

// Capture the HTTP request and send the response
$request = Request::capture();
$response = $kernel->handle($request);
$response->send();

// Terminate the kernel (for middleware, etc.)
$kernel->terminate($request, $response);
