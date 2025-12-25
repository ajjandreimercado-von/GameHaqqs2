<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>User Dashboard - GameHaqqs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar {
            background-color: #4a6cf7;
        }
        .navbar-brand {
            font-weight: 600;
            color: white;
        }
        .dashboard-container {
            padding: 30px;
        }
        .card {
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
        }
        .card-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid #eee;
            font-weight: 600;
        }
        .btn-logout {
            background-color: #dc3545;
            color: white;
            border: none;
        }
        .btn-logout:hover {
            background-color: #c82333;
            color: white;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="#">GameHaqqs</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/games">Games</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Reviews</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/community-page">Community</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/api-links">API Links</a>
                    </li>
                </ul>
                <form method="POST" action="/logout" style="display:inline">
                    @csrf
                    <button type="submit" class="btn btn-logout">Logout</button>
                </form>
            </div>
        </div>
    </nav>

    <div class="container dashboard-container">
        <div class="row">
            <div class="col-md-12 mb-4">
                <h2>User Dashboard</h2>
                <p>Welcome to your GameHaqqs dashboard!</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Your Activity
                    </div>
                    <div class="card-body">
                        <p>Your recent activity will appear here.</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        Your Reviews
                    </div>
                    <div class="card-body">
                        <p>You haven't written any reviews yet.</p>
                        <a href="#" class="btn btn-primary">Write a Review</a>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        Your Profile
                    </div>
                    <div class="card-body">
                        <div id="user-info">
                            <p><strong>Username:</strong> <span id="username"></span></p>
                            <p><strong>Level:</strong> <span id="level"></span></p>
                            <p><strong>XP:</strong> <span id="xp"></span></p>
                        </div>
                        <a href="#" class="btn btn-outline-primary btn-sm">Edit Profile</a>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        Badges
                    </div>
                    <div class="card-body">
                        <p>You haven't earned any badges yet.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Render server-provided user info
        const USER_EMAIL = {!! json_encode(auth()->user()->email ?? 'User') !!};
        const USER_LEVEL = {!! json_encode(auth()->user()->level ?? 1) !!};
        const USER_XP = {!! json_encode(auth()->user()->xp ?? 0) !!};
        document.getElementById('username').textContent = USER_EMAIL;
        document.getElementById('level').textContent = USER_LEVEL;
        document.getElementById('xp').textContent = USER_XP;
    </script>
</body>
</html>