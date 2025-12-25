<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Community — GameHaqqs</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Community</h1>
        <a class="btn btn-secondary" href="/user-dashboard">Back</a>
    </div>

    <div class="card mb-3">
        <div class="card-body">
            <h5 class="card-title">Create a post</h5>
            <div id="submit-alert"></div>
            <form id="post-form">
                <input type="hidden" id="csrf_token" value="{{ csrf_token() }}">
                <div class="mb-2">
                    <input class="form-control" name="title" placeholder="Title" required>
                </div>
                <div class="mb-2">
                    <textarea class="form-control" name="content" rows="4" placeholder="Write your post..." required></textarea>
                </div>
                <div class="mb-2">
                    <button class="btn btn-primary">Submit (will be Pending)</button>
                </div>
            </form>
        </div>
    </div>

    <div id="posts"></div>

    <script>
    async function loadPosts(){
        try{
            const res = await fetch('/community');
            if(!res.ok) return;
            const data = await res.json();
            const container = document.getElementById('posts');
            container.innerHTML = '';
            data.data.forEach(p=>{
                const el = document.createElement('div');
                el.className = 'card mb-2';
                el.innerHTML = `<div class="card-body"><h5>${escapeHtml(p.title)}</h5><p>${escapeHtml(p.content)}</p><p class="text-muted">By ${escapeHtml(p.author.email||p.author_id)}</p></div>`;
                container.appendChild(el);
            });
        }catch(e){ console.error(e); }
    }

    document.getElementById('post-form').addEventListener('submit', async (e)=>{
        e.preventDefault();
        const alertHolder = document.getElementById('submit-alert');
        alertHolder.innerHTML = '';
        const fd = new FormData(e.target);
        const body = { title: fd.get('title'), content: fd.get('content') };
        const csrf = document.getElementById('csrf_token').value;
        const submitBtn = e.target.querySelector('button');
        submitBtn.disabled = true;
        try{
            // Attach server-provided authenticated user id (if any). Local URL param fallback removed.
            const bodyWithUser = Object.assign({}, body, window.__authUserId ? { user_id: window.__authUserId } : {});
            const res = await fetch('/community/posts', { method: 'POST', headers: {'Content-Type':'application/json','X-CSRF-TOKEN': csrf}, body: JSON.stringify(bodyWithUser) });
            if(res.status === 201){
                alertHolder.innerHTML = `<div class="alert alert-success">Post submitted and will appear after moderator approval.</div>`;
                e.target.reset();
            } else if(res.status === 422){
                const j = await res.json();
                alertHolder.innerHTML = `<div class="alert alert-danger">Validation error: ${escapeHtml(j.message||JSON.stringify(j))}</div>`;
            } else {
                const j = await res.json().catch(()=>null);
                alertHolder.innerHTML = `<div class="alert alert-danger">Failed to submit: ${escapeHtml((j&&j.message)||'Unknown error')}</div>`;
            }
        }catch(err){
            alertHolder.innerHTML = `<div class="alert alert-danger">Network error while submitting.</div>`;
        }finally{
            submitBtn.disabled = false;
        }
    });

    // Poll approved posts every 15s
    loadPosts();
    setInterval(loadPosts, 15000);

    function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    </script>
</div>

<script>window.__authUserId = {!! json_encode(auth()->check() ? auth()->id() : null) !!};</script>
<script>
async function loadPosts(){
    const res = await fetch('/community');
    const data = await res.json();
    const container = document.getElementById('posts');
    container.innerHTML = '';
    data.data.forEach(p=>{
        const el = document.createElement('div');
        el.className = 'card mb-2';
        el.innerHTML = `<div class="card-body"><h5>${p.title}</h5><p>${p.content}</p><p class="text-muted">By ${p.author.email}</p></div>`;
        container.appendChild(el);
    });
}

document.getElementById('post-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { title: fd.get('title'), content: fd.get('content') };
    const res = await fetch('/community/posts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(res.status === 201){
        alert('Post submitted (Pending approval)');
        e.target.reset();
    } else {
        const err = await res.json();
        alert('Error: '+(err.message||JSON.stringify(err)));
    }
});

loadPosts();
</script>
</body>
</html>