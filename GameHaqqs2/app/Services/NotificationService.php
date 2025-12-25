<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    public function notify(int $userId, string $type, array $payload = []): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'payload' => $payload,
        ]);
    }
}


