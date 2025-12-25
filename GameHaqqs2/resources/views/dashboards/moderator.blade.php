<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Moderator Dashboard - GameHaqqs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar {
            background-color: #198754;
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
        .mod-badge {
            background-color: #198754;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="#">GameHaqqs <span class="mod-badge">MOD</span></a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="#">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Content Review</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">User Reports</a>
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
                <h2>Moderator Dashboard</h2>
                <p>Welcome to the GameHaqqs moderator panel!</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        Content Awaiting Review
                    </div>
                    <div class="card-body">
                        <p>No content awaiting review.</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        Recent Reports
                    </div>
                    <div class="card-body">
                        <p>No reports to display.</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        Moderation Stats
                    </div>
                    <div class="card-body">
                        <p><strong>Reviews Approved:</strong> 0</p>
                        <p><strong>Content Rejected:</strong> 0</p>
                        <p><strong>Comments Moderated:</strong> 0</p>
                        <p><strong>Reports Resolved:</strong> 0</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        Quick Actions
                    </div>
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-success">Review Content</button>
                            <button class="btn btn-outline-success">Check Reports</button>
                            <button class="btn btn-outline-success">Moderate Comments</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        @if(session('success'))
            alert({!! json_encode(session('success')) !!});
        @endif
    </script>
</body>
</html>