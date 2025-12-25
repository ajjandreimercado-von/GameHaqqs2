<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Register - GameHaqqs</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .register-container {
            max-width: 500px;
            margin: 50px auto;
            padding: 30px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        .register-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .register-header h1 {
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
        .login-link {
            text-align: center;
            margin-top: 20px;
        }
        .alert {
            display: none;
            margin-bottom: 20px;
        }
        .invalid-feedback {
            display: none;
            color: #dc3545;
            font-size: 0.875em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <h1>GameHaqqs</h1>
                <p>Create a new account</p>
            </div>
            
                @if($errors->any())
                <div class="alert alert-danger" style="display: block;">
                    <ul class="mb-0">
                        @foreach($errors->all() as $err)
                            <li>{{ $err }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            @if(session('error'))
                <div class="alert alert-danger" style="display: block;">
                    {{ session('error') }}
                </div>
            @endif
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            <div class="alert alert-danger" id="error-message" style="display:none"></div>
            
            <form id="register-form" method="POST" action="/register">
                @csrf
                <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="name" name="name" required>
                    <div class="invalid-feedback" id="name-error"></div>
                </div>
                
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" name="email" required>
                    <div class="invalid-feedback" id="email-error"></div>
                </div>
                
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" name="username" required>
                    <div class="invalid-feedback" id="username-error"></div>
                </div>
                
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                    <div class="invalid-feedback" id="password-error"></div>
                </div>
                
                <div class="mb-3">
                    <label for="password_confirmation" class="form-label">Confirm Password</label>
                    <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" required>
                    <div class="invalid-feedback" id="password-confirmation-error"></div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Register as:</label>
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
                    <div class="invalid-feedback" id="role-error"></div>
                </div>
                
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
            
            <div class="login-link">
                <p>Already have an account? <a href="/login">Login here</a></p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
                document.getElementById('register-form').addEventListener('submit', async function(e) {
            // let the form submit normally to the server; client-side listener retained for UX
            
            
            // Reset error messages
            document.querySelectorAll('.invalid-feedback').forEach(el => el.style.display = 'none');
            document.getElementById('error-message').style.display = 'none';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                password_confirmation: document.getElementById('password_confirmation').value,
                role: document.querySelector('input[name="role"]:checked').value
            };
            
            // Basic validation
            if (formData.password !== formData.password_confirmation) {
                document.getElementById('password-confirmation-error').textContent = 'Passwords do not match';
                document.getElementById('password-confirmation-error').style.display = 'block';
                return;
            }
            
        // no-op: server will handle registration and redirect or return errors
        });
    </script>
</body>
</html>