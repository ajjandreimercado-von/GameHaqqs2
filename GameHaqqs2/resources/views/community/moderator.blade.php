<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Moderator — Pending Posts</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Pending Community Posts</h1>
        <a class="btn btn-secondary" href="/moderator-dashboard">Back</a>
    </div>

    <div id="posts"></div>

    <div id="action-alert" style="position:fixed;right:20px;bottom:20px;z-index:9999"></div>
</div>

<script>window.__authUserId = {!! json_encode(auth()->check() ? auth()->id() : null) !!};</script>
<script>
async function loadPending(){
    try{
        const url = '/moderator/pending-posts';
        const res = await fetch(url);
        if(res.status === 403){ showAlert('danger','Forbidden — log in as moderator'); return; }
        const data = await res.json();
        const container = document.getElementById('posts');
        container.innerHTML = '';
        data.forEach(p=>{
            const el = document.createElement('div');
            el.className = 'card mb-2';
            el.innerHTML = `<div class="card-body"><h5>${escapeHtml(p.title)}</h5><p>${escapeHtml(p.content)}</p><p class="text-muted">By ${escapeHtml(p.author.email)}</p><div class="mt-2"><button class="btn btn-sm btn-success" onclick="action(${p.id}, 'approve', this)">Approve</button> <button class="btn btn-sm btn-danger" onclick="action(${p.id}, 'decline', this)">Decline</button></div></div>`;
            container.appendChild(el);
        });
    }catch(e){ console.error(e); showAlert('danger','Failed to load pending posts'); }
}

async function action(id, act, btn){
    const alertHolder = document.getElementById('action-alert');
    const csrf = document.querySelector('meta[name="csrf-token"]') ? document.querySelector('meta[name="csrf-token"]').getAttribute('content') : '';
    if(btn) btn.disabled = true;
    if(!confirm(`Are you sure you want to ${act} this post?`)){ if(btn) btn.disabled = false; return; }
    try{
        const headers = {'X-CSRF-TOKEN': csrf, 'Content-Type': 'application/json'};
        const body = JSON.stringify({});
        const res = await fetch(`/moderator/posts/${id}/${act==='approve'?'approve':'decline'}`, { method: 'POST', headers, body });
        if(res.ok){
            showAlert('success', `Post ${act}d`);
            loadPending();
        } else {
            const j = await res.json().catch(()=>null);
            showAlert('danger', `Error: ${(j&&j.message)||'Unknown'}`);
        }
    }catch(err){
        showAlert('danger','Network error');
    }finally{
        if(btn) btn.disabled = false;
    }
}

function showAlert(type, msg){
    const holder = document.getElementById('action-alert');
    const el = document.createElement('div');
    el.className = `alert alert-${type}`;
    el.style.minWidth = '220px';
    el.innerText = msg;
    holder.appendChild(el);
    setTimeout(()=>{ el.remove(); }, 4000);
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

loadPending();
</script>
</body>
</html>