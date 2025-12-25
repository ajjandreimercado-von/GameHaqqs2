<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Games — GameHaqqs</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">
<div class="container">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1>Games</h1>
        <a class="btn btn-secondary" href="/">Back</a>
    </div>

    <meta name="csrf-token" content="{{ csrf_token() }}">
    <div id="gamesList">
        @if(isset($games))
            @foreach($games as $game)
                <div class="card mb-2">
                    <div class="row" style="gap:12px;align-items:center">
                        <div style="flex:0 0 120px">
                            @if($game->image_url)
                                <img src="{{ $game->image_url }}" alt="{{ $game->title }}" style="width:120px;height:80px;object-fit:cover;border-radius:6px" />
                            @else
                                <div style="width:120px;height:80px;background:#222;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#aaa">No image</div>
                            @endif
                        </div>
                        <div style="flex:1">
                            <h5>{{ $game->title }} <small class="muted">— {{ $game->platform }}</small></h5>
                            <div class="text-muted small" style="margin-bottom:6px">{{ $game->genre }} • {{ $game->developer }} • Released: {{ $game->release_date }}</div>
                            <div style="margin-bottom:8px">{{ \Illuminate\Support\Str::limit($game->description ?? 'No description', 400) }}</div>
                            <div class="small muted">Rating: {{ $game->rating ?? 'N/A' }} • Reviews: {{ $game->reviews->count() }} • Wikis: {{ $game->wikis->count() }} • Tips: {{ $game->tipsAndTricks->count() }}</div>
                            <div class="mt-2">
                                @foreach($game->tags as $t)
                                    <span style="display:inline-block;background:#1f2937;padding:4px 8px;border-radius:999px;margin-right:6px;font-size:12px">{{ $t->name }}</span>
                                @endforeach
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="likeGame({{ $game->id }}, this)">Like</button>
                                <span id="likes-count-{{ $game->id }}">{{ $game->likes->count() }}</span> likes
                            </div>
                            <div class="mt-3">
                                <div id="comments-{{ $game->id }}">
                                    @foreach($game->comments->take(5) as $c)
                                        <div class="card mt-1"><div class="card-body small">{{ $c->author->username ?? $c->author->email }}: {{ \Illuminate\Support\Str::limit($c->content, 120) }}</div></div>
                                    @endforeach
                                </div>
                                <div class="row mt-2">
                                    <input id="comment-input-{{ $game->id }}" class="input" placeholder="Add a comment" />
                                    <button class="btn btn-sm" onclick="postComment({{ $game->id }}, this)">Comment</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
            <div class="mt-3">{{ $games->links() }}</div>
        @else
            <div id="gamesClient"></div>
        @endif
    </div>
</div>

<script>window.__authUserId = {!! json_encode(auth()->check() ? auth()->id() : null) !!};</script>
<script>
async function loadGames(){}}]}
    try{
        const res = await fetch('/api/v1/public/games');
        if(!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        const list = document.getElementById('gamesList');
        list.innerHTML = '';
        (json.data || []).forEach(g=>{
            const el = document.createElement('div');
            el.className = 'card mb-2';
            el.innerHTML = `<div class="card-body"><h5>${escapeHtml(g.title)}</h5><p class="text-muted">${escapeHtml(g.genre||'')} — ${escapeHtml(g.developer||'')}</p><p>${escapeHtml(g.description||'')}</p></div>`;
            list.appendChild(el);
        });
    }catch(err){
        console.error(err);
        document.getElementById('gamesList').innerHTML = '<div class="alert alert-danger">Failed to load games</div>';
    }
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

loadGames();
</script>

<script>
async function likeGame(gameId, btn){
    const csrfEl = document.querySelector('meta[name="csrf-token"]');
    const csrf = csrfEl ? csrfEl.getAttribute('content') : '';
    try{
        if(btn) btn.disabled = true;
                const body = window.__authUserId ? JSON.stringify({ user_id: window.__authUserId, action:'add' }) : JSON.stringify({ action:'add' });
        const res = await fetch(`/games/${gameId}/favorite`, { method: 'POST', headers: {'Content-Type':'application/json','X-CSRF-TOKEN': csrf}, body });
        const res = await fetch(`/games/${gameId}/like`, { method: 'POST', headers: {'Content-Type':'application/json','X-CSRF-TOKEN': csrf}, body });
        const j = await res.json().catch(()=>null);
        if(res.ok){
            const countEl = document.getElementById('likes-count-'+gameId);
            if(countEl) countEl.innerText = parseInt(countEl.innerText||'0',10) + (j.liked?1:0);
        } else {
            alert('Like failed: '+(j && j.message ? j.message : 'unknown'));
        }
    }catch(e){ console.error(e); alert('Network error'); }
    finally{ if(btn) btn.disabled = false; }
}

async function postComment(gameId, btn){
    const csrfEl = document.querySelector('meta[name="csrf-token"]');
    const csrf = csrfEl ? csrfEl.getAttribute('content') : '';
    const input = document.getElementById('comment-input-'+gameId);
    if(!input || !input.value.trim()) return alert('Comment required');
    try{
        if(btn) btn.disabled = true;
        const body = window.__authUserId ? { user_id: window.__authUserId, content: input.value.trim() } : { content: input.value.trim() };
        const res = await fetch(`/games/${gameId}/comments`, { method: 'POST', headers: {'Content-Type':'application/json','X-CSRF-TOKEN': csrf}, body: JSON.stringify(body) });
        if(res.status === 201){
            const c = await res.json();
            const holder = document.getElementById('comments-'+gameId);
            const el = document.createElement('div'); el.className='card mt-1'; el.innerHTML = `<div class="card-body small">${escapeHtml((c.author && c.author.username) || c.author_id || 'User')}: ${escapeHtml(c.content)}</div>`;
            if(holder) holder.prepend(el);
            input.value = '';
        } else {
            const j = await res.json().catch(()=>null);
            alert('Comment failed: '+(j && j.message ? j.message : 'unknown'));
        }
    }catch(e){ console.error(e); alert('Network error'); }
    finally{ if(btn) btn.disabled = false; }
}
</script>
</body>
</html>