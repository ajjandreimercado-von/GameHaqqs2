<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - GameHaqqs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-container {
            max-width: 450px;
            margin: 100px auto;
            padding: 30px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .login-header h1 {
            color: #333;
            font-weight: 600;
        }
        .form-control {
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        .btn-primary {
            background-color: #4a6cf7;
            border: none;
            padding: 12px;
            width: 100%;
            font-weight: 600;
            border-radius: 5px;
        }
        .btn-primary:hover {
            background-color: #3a5bd9;
        }
        .register-link {
            text-align: center;
            margin-top: 20px;
        }
        .alert {
            display: none;
            margin-bottom: 20px;
        }
        .role-selector {
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-container">
            <div class="login-header">
                <h1>GameHaqqs</h1>
                <p>Sign in to your account</p>
            </div>
            
            @if(
                $errors->any()
            )
                <div class="alert alert-danger">
                    <ul class="mb-0">
                        @foreach($errors->all() as $err)
                            <li>{{ $err }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            <div class="alert alert-danger" id="error-message" style="display:none"></div>
            
            <form id="login-form" method="POST" action="/login">
                @csrf
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                </div>
                
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>
                
                <div class="mb-3 role-selector">
                    <label class="form-label">Login as:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="role" id="role-user" value="user" checked>
                        <label class="form-check-label" for="role-user">
                            User
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="role" id="role-admin" value="admin">
                        <label class="form-check-label" for="role-admin">
                            Admin
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="role" id="role-moderator" value="moderator">
                        <label class="form-check-label" for="role-moderator">
                            Moderator
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary">Sign In</button>
            </form>
            
            <div class="register-link">
                <p>Don't have an account? <a href="/register">Register here</a></p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Client-side auto-redirect removed; server handles authenticated redirects

                document.getElementById('login-form').addEventListener('submit', function(e) {
            // let the form submit normally to the server; this listener keeps UX messaging
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'none';
        });
    </script>
</body>
</html>