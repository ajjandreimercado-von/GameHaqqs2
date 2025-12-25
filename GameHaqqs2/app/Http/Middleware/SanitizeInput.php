<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();
        
        // Sanitize string inputs
        $sanitized = $this->sanitizeArray($input);
        
        // Replace request input with sanitized data
        $request->replace($sanitized);
        
        return $next($request);
    }

    /**
     * Recursively sanitize array data
     */
    private function sanitizeArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = $this->sanitizeString($value);
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value);
            }
        }
        
        return $data;
    }

    /**
     * Sanitize string input
     */
    private function sanitizeString(string $input): string
    {
        // Remove null bytes
        $input = str_replace(chr(0), '', $input);
        
        // Trim whitespace
        $input = trim($input);
        
        // Remove potentially dangerous characters
        $input = preg_replace('/[<>"\']/', '', $input);
        
        // Limit length to prevent buffer overflow attacks
        if (strlen($input) > 10000) {
            $input = substr($input, 0, 10000);
        }
        
        return $input;
    }
}
