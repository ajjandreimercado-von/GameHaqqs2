<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>GameHaqqs — API Links</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:20px;background:#0b1220;color:#e6edf3}
        a{color:#7aa2ff}
        .small{opacity:.8;font-size:12px}
        .card{background:#111a2b;border:1px solid #223;border-radius:10px;padding:16px;margin-bottom:20px}
        .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
        .tab{background:#1a2332;border:1px solid #283247;border-radius:8px;padding:8px 12px;cursor:pointer}
        .tab.active{background:#2b3a55;border-color:#334}
        .panel{display:none}
        .panel.active{display:block}
        table{width:100%;border-collapse:collapse;background:#111a2b;border:1px solid #223;border-radius:10px;overflow:hidden}
        th{background:#1a2332;color:#e6edf3;padding:12px;text-align:left;font-weight:600;border-bottom:1px solid #223}
        td{padding:12px;border-bottom:1px solid #223;vertical-align:top}
        tr:hover{background:#1a2332}
        tr:last-child td{border-bottom:none}
        .method{font-weight:700;padding:2px 8px;border-radius:999px;font-size:12px}
        .GET{background:#0f2a1e;color:#c6f6d5;border:1px solid #1f4a35}
        .POST{background:#2a0f14;color:#fecaca;border:1px solid #5a1f28}
        .route{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
        .controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
        .input{background:#0c1526;border:1px solid #223;color:#e6edf3;padding:6px 8px;border-radius:6px}
        .btn{background:#2b3a55;color:#e6edf3;border:1px solid #334;padding:6px 10px;border-radius:6px;cursor:pointer}
        .btn:hover{background:#364865}
        .btn[disabled]{opacity:.6;cursor:not-allowed}
        pre{margin:0;white-space:pre-wrap;word-break:break-word}
        .result-row td{background:#0c1526}
    </style>
    @php
    $base = request()->query('base', '/api/v1');
    $routes = [
        'Authentication' => [
            ['POST', '/api/register', 'Register a new user'],
            ['POST', '/api/login', 'Login user'],
            ['POST', '/api/logout', 'Logout user'],
            ['GET', '/api/user', 'Get authenticated user'],
        ],
        'Users' => [
            ['GET', "$base/users", 'List all users (Admin only)'],
            ['GET', "$base/users/{user}", 'Show a user by ID'],
            ['GET', "$base/users/{user}/activity", 'Get user activity summary'],
            ['GET', "$base/users/{user}/favorites", 'Get user favorites'],
            ['PATCH', "$base/users/{user}/role", 'Update user role (Admin only)'],
            ['PATCH', "$base/users/{user}/gamification", 'Update XP/level (Admin only)'],
            ['PATCH', "$base/users/{user}/ban", 'Ban/unban user (Admin only)'],
            ['DELETE', "$base/users/{user}", 'Delete user (Admin only)'],
        ],
        'Games' => [
            ['GET', "$base/games", 'List games'],
            ['POST', "$base/games", 'Create game (Admin only)'],
            ['GET', "$base/games/{game}", 'Show a game'],
            ['PATCH', "$base/games/{game}", 'Update game (Admin only)'],
            ['DELETE', "$base/games/{game}", 'Delete game (Admin only)'],
            ['POST', "$base/games/{game}/favorite", 'Favorite/unfavorite a game'],
        ],
        'Reviews' => [
            ['GET', "$base/reviews", 'List reviews'],
            ['POST', "$base/games/{game}/reviews", 'Create a review'],
            ['GET', "$base/reviews/{review}", 'Show a review'],
            ['PATCH', "$base/reviews/{review}", 'Update review (Author only)'],
            ['DELETE', "$base/reviews/{review}", 'Delete review (Author/Admin only)'],
            ['POST', "$base/reviews/{review}/like", 'Like/unlike a review'],
            ['POST', "$base/reviews/{review}/comment", 'Comment on a review'],
        ],
        'Tips' => [
            ['GET', "$base/tips", 'List tips'],
            ['POST', "$base/games/{game}/tips", 'Create a tip'],
            ['GET', "$base/tips/{tip}", 'Show a tip'],
            ['PATCH', "$base/tips/{tip}", 'Update tip (Author only)'],
            ['DELETE', "$base/tips/{tip}", 'Delete tip (Author/Admin only)'],
            ['POST', "$base/tips/{tip}/like", 'Like/unlike a tip'],
            ['POST', "$base/tips/{tip}/comment", 'Comment on a tip'],
        ],
        'Wikis' => [
            ['GET', "$base/wikis", 'List wikis'],
            ['POST', "$base/games/{game}/wikis", 'Create wiki entry'],
            ['GET', "$base/wikis/{wiki}", 'Show a wiki'],
            ['PATCH', "$base/wikis/{wiki}", 'Update wiki (Author only)'],
            ['DELETE', "$base/wikis/{wiki}", 'Delete wiki (Author/Admin only)'],
            ['POST', "$base/wikis/{wiki}/like", 'Like/unlike a wiki'],
            ['POST', "$base/wikis/{wiki}/comment", 'Comment on a wiki'],
        ],
        'Comments' => [
            ['GET', "$base/comments", 'List comments'],
            ['GET', "$base/comments/{comment}", 'Show a comment'],
            ['PATCH', "$base/comments/{comment}", 'Update comment (Author only)'],
            ['DELETE', "$base/comments/{comment}", 'Delete comment (Author/Admin only)'],
            ['POST', "$base/comments/{comment}/like", 'Like/unlike a comment'],
        ],
        'Tags' => [
            ['GET', "$base/tags", 'List tags'],
            ['POST', "$base/tags", 'Create tag (Admin only)'],
            ['GET', "$base/tags/{tag}", 'Show a tag'],
            ['PATCH', "$base/tags/{tag}", 'Update tag (Admin only)'],
            ['DELETE', "$base/tags/{tag}", 'Delete tag (Admin only)'],
            ['GET', "$base/tags/{tag}/games", 'Get games by tag'],
            ['POST', "$base/tags/{tag}/games/{game}/attach", 'Attach tag to game (Admin only)'],
            ['DELETE', "$base/tags/{tag}/games/{game}/detach", 'Detach tag from game (Admin only)'],
        ],
        'Leaderboard' => [
            ['GET', "$base/leaderboard", 'Get leaderboard'],
            ['POST', "$base/leaderboard/update", 'Update leaderboard'],
        ],
        'Notifications' => [
            ['GET', "$base/notifications", 'Get user notifications'],
        ],
        'Posts' => [
            ['GET', "$base/posts", 'List posts'],
            ['POST', "$base/posts", 'Create post'],
            ['GET', "$base/posts/{post}", 'Show a post'],
            ['PATCH', "$base/posts/{post}/status", 'Update post status (Moderator only)'],
            ['DELETE', "$base/posts/{post}", 'Delete post (Author/Admin only)'],
        ],
        'Roles' => [
            ['GET', "$base/moderators", 'List moderators'],
            ['GET', "$base/admins", 'List admins'],
        ],
    ];
    @endphp
</head>
<body>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
        <div>
            <h1 style="margin:0">API Links</h1>
            <div class="small">Base: {{ request('base', '/api/v1') }}</div>
        </div>
        <div class="small"><a href="/">← Back to Home</a></div>
    </div>

    <!-- New: compact section listing all API links -->
    <div class="card">
        <h2 style="margin:0 0 8px 0">Listed API Links</h2>
        <div class="small" style="margin-bottom:12px">A compact list of all endpoints grouped by resource.</div>
        <table>
            <thead>
                <tr>
                    <th style="width:90px">Method</th>
                    <th>Endpoint</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
            @foreach($routes as $group => $items)
                <tr style="background:transparent"><td colspan="3" class="small" style="padding:8px 12px"><strong>{{ $group }}</strong></td></tr>
                @foreach($items as $r)
                    <tr>
                        <td><span class="method {{ $r[0] }}">{{ $r[0] }}</span></td>
                        <td class="route">{{ $r[1] }}</td>
                        <td>{{ $r[2] ?? '' }}</td>
                    </tr>
                @endforeach
            @endforeach
            </tbody>
        </table>
    </div>

    <div class="card">
        <div class="tabs" id="tabs"></div>
        <div id="panels"></div>
    </div>


    <script>
    const data = @json($routes);
    const tabsEl = document.getElementById('tabs');
    const panelsEl = document.getElementById('panels');

    function render(){
        const keys = Object.keys(data);
        tabsEl.innerHTML = '';
        panelsEl.innerHTML = '';
        keys.forEach((key, idx)=>{
            const t = document.createElement('button');
            t.className = 'tab' + (idx===0 ? ' active' : '');
            t.textContent = key;
            t.onclick = ()=> activate(key);
            tabsEl.appendChild(t);

            const panel = document.createElement('div');
            panel.className = 'panel' + (idx===0 ? ' active' : '');
            panel.dataset.tab = key;
            panel.innerHTML = tableHtml(data[key]);
            panelsEl.appendChild(panel);
        });
    }

    function tableHtml(rows){
        const head = '<table><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th><th style="width:40%">Try</th></tr></thead><tbody>';
        const body = rows.map((r, idx)=> rowHtml(r, idx)).join('');
        return head + body + '</tbody></table>';
    }

    const bodySchemas = {
        'POST /users/register': { username:'user1', email:'user1@example.com', password:'password' },
        'POST /games/{game}/favorite': { action:'add' },
        'POST /games/{game}/reviews': { rating:8, pros:null, cons:null, content:'Great game!', author_id:1 },
        'POST /reviews/{review}/like': { action:'like' },
        'POST /reviews/{review}/comment': { author_id:1, content:'Nice!' },
        'POST /games/{game}/tips': { title:'Quick tip', content:'Tip content', author_id:1 },
        'POST /tips/{tip}/like': { action:'like' },
        'POST /tips/{tip}/comment': { author_id:1, content:'Nice!' }
    };

    function rowHtml(r){
        const method = r[0];
        const route = r[1];
        const desc = r[2] || '';
        const placeholders = Array.from(route.matchAll(/\{(.*?)\}/g)).map(m=>m[1]);
        const hasQueryId = route.includes('{id}');
        const key = `${method} ${route.replace(/\?.*/, '')}`; // for body schema map
        const bodySchema = bodySchemas[key];
        const inputBits = [];
        placeholders.forEach(name=>{
            inputBits.push(`<label class="small">${name}</label><input class="input" data-k="${name}" style="max-width:120px">`);
        });
        if(hasQueryId && !placeholders.includes('id')){
            inputBits.push(`<label class="small">id</label><input class="input" data-k="id" style="max-width:120px">`);
        }
        let bodyBit = '';
        if(bodySchema){
            const fields = Object.keys(bodySchema).map(k=>{
                const val = bodySchema[k];
                const v = typeof val === 'string' ? val : (val === null ? '' : String(val));
                return `<div><label class="small">${k}</label><input class="input" data-b="${k}" value="${v}" style="max-width:160px"></div>`;
            }).join('');
            bodyBit = `<div class="small" style="width:100%">Body</div><div class="controls">${fields}</div>`;
        }
        const ctrl = `<div class="controls">${inputBits.join(' ')}<button class="btn" onclick="runEndpoint('${method}','${route}', this)">Run</button></div>${bodyBit}`;
        return `<tr><td><span class="method ${method}">${method}</span></td><td class="route">${route}</td><td>${desc}</td><td>${ctrl}</td></tr><tr class="result-row" style="display:none"><td colspan="4"><div class="small meta"></div><pre class="out" style="margin-top:8px;background:#0c1526;border:1px solid #223;padding:12px;border-radius:8px;min-height:60px"></pre></td></tr>`;
    }

    async function runEndpoint(method, route, btn){
        const row = btn.closest('tr');
        const resultRow = row.nextElementSibling;
        const paramInputs = row.querySelectorAll('input[data-k]');
        let finalUrl = route;
        paramInputs.forEach(input=>{
            const k = input.getAttribute('data-k');
            finalUrl = finalUrl.replace(`{${k}}`, encodeURIComponent(input.value || '1'));
            finalUrl = finalUrl.replace(`{${k}}`, encodeURIComponent(input.value || '1'));
        });
        // handle query id placeholder
        const qInputs = Array.from(paramInputs).filter(i=>i.getAttribute('data-k')==='id');
        if(qInputs.length){
            finalUrl = finalUrl.replace('{id}', encodeURIComponent(qInputs[0].value || '1'));
        }
        // Build body if needed
        let body = undefined;
        const key = `${method} ${route.replace(/\?.*/, '')}`;
        const schema = bodySchemas[key];
        if(schema){
            body = {};
            Object.keys(schema).forEach(k=>{
                const el = row.querySelector(`input[data-b="${k}"]`);
                body[k] = el ? parseMaybeNumber(el.value) : schema[k];
            });
        }
        await callApi(method, finalUrl, body, btn, resultRow);
    }

    function parseMaybeNumber(v){
        if(v === '' || v === null || v === undefined) return v;
        if(!isNaN(v)) return Number(v);
        try{ return JSON.parse(v); }catch{ return v; }
    }

    async function callApi(method, url, body, btn, resultRow){
        const meta = resultRow.querySelector('.meta');
        const out = resultRow.querySelector('.out');
        try{
            btn.disabled = true; const old = btn.textContent; btn.textContent = 'Loading...';
            
            // Get CSRF token for stateful requests
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                             document.querySelector('input[name="_token"]')?.value;
            
            const headers = { 
                'Content-Type':'application/json', 
                'Accept':'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
            
            // Add CSRF token if available (for stateful API calls)
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            
            const res = await fetch(url, {
                method,
                headers,
                credentials: 'same-origin', // Include cookies for session-based auth
                body: method === 'POST' ? JSON.stringify(body||{}) : undefined
            });
            const text = await res.text();
            let json; try{ json = text ? JSON.parse(text) : {}; } catch{ json = { message: text }; }
            meta.textContent = `${res.status} ${res.statusText} • ${method} ${url}`;
            const ct = res.headers.get('content-type') || '';
            if(ct.includes('text/html')){
                out.textContent = (text||'').slice(0, 600) + (text && text.length>600 ? '\n... (HTML truncated)' : '');
            }else{
                out.textContent = JSON.stringify(json, null, 2);
            }
            resultRow.style.display = '';
            btn.textContent = old; btn.disabled = false;
        }catch(e){
            meta.textContent = `Error • ${method} ${url}`;
            out.textContent = String(e.message||e);
            resultRow.style.display = '';
            btn.disabled = false;
        }
    }

    function activate(key){
        document.querySelectorAll('.tab').forEach(el=>{
            el.classList.toggle('active', el.textContent === key);
        });
        document.querySelectorAll('.panel').forEach(el=>{
            el.classList.toggle('active', el.dataset.tab === key);
        });
    }

    render();
    </script>
</body>
</html>


