
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<title>GameHaqqs</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style>
        :root {
            --bg-deep: #0d1117;
            --bg-main: #161b22;
            --bg-header: rgba(13, 17, 23, 0.8);
            --border-color: #30363d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --accent-color: #58a6ff;
            --btn-bg: #21262d;
            --btn-hover-bg: #30363d;
            --input-bg: #0d1117;
            --success-bg: rgba(56, 139, 253, 0.1);
            --success-border: rgba(56, 139, 253, 0.4);
            --error-bg: rgba(248, 81, 73, 0.1);
            --error-border: rgba(248, 81, 73, 0.4);
            --radius: 8px;
            --font-main: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            font-family: var(--font-main);
            margin: 0;
            background: var(--bg-deep);
            color: var(--text-primary);
            line-height: 1.6;
        }
        
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 24px;
        }

        a { color: var(--accent-color); text-decoration: none; }
        a:hover { text-decoration: underline; }

        .small { font-size: 0.875em; }
        .muted { color: var(--text-secondary); }

        .grid {
            display: grid;
            grid-template-columns: 2.5fr 1fr;
            gap: 24px;
        }
        
        .card {
            background: var(--bg-main);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 20px;
            margin-bottom: 24px;
        }

        .header {
            background: var(--bg-header);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            backdrop-filter: blur(8px);
            z-index: 10;
        }

        .header-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 14px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .btn {
            background: var(--btn-bg);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            padding: 8px 14px;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }
        .btn:hover { background: var(--btn-hover-bg); }
        .btn[disabled] { opacity: .6; cursor: not-allowed; }
        
        .btn-sm { padding: 4px 10px; font-size: 12px; }
        
        .btn-link {
            background: none;
            border: none;
            color: var(--accent-color);
            padding: 0;
            cursor: pointer;
            font-size: 12px;
        }
        .btn-link:hover { text-decoration: underline; }


        .input {
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 8px 12px;
            border-radius: var(--radius);
            width: 100%;
            box-sizing: border-box;
        }
        .input-sm { padding: 6px 8px; font-size: 12px; }
        .input:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.2);
        }

        .row { display: flex; gap: 12px; align-items: center; }
        .col { display: flex; flex-direction: column; gap: 12px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .mt-4 { margin-top: 16px; }

        .badge {
            display: inline-block;
            background: var(--btn-bg);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            padding: 2px 10px;
            font-size: 12px;
            margin-left: 8px;
            font-weight: 500;
        }

        .alert {
            padding: 12px 16px;
            border-radius: var(--radius);
            margin-bottom: 24px;
            font-size: 14px;
        }
        .alert-success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--text-primary); }
        .alert-error { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--text-primary); }
        
        /* New Game Card Styles */
        .game-list { display: flex; flex-direction: column; gap: 16px; }
        .game-card {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            background: var(--bg-main);
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 20px;
            transition: border-color 0.2s ease;
        }
        .game-card:hover { border-color: #484f58; }
        .game-card-main { flex: 3; min-width: 300px; }
        .game-card-actions { flex: 1; min-width: 180px; text-align: right; display: flex; flex-direction: column; gap: 10px; }
        
        .game-title { font-size: 1.25em; font-weight: 600; margin-bottom: 8px; }
        .game-meta { display: flex; gap: 16px; font-size: 0.9em; color: var(--text-secondary); margin-bottom: 16px; }
        
        .reviews-section { border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px; }
        .reviews-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
        .review-item .row { gap: 8px; }
        
        details {
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            padding: 12px;
            margin-top: 12px;
        }
        details[open] { background: var(--bg-deep); }
        details > summary { cursor: pointer; list-style: none; font-weight: 500; }
        details > summary::-webkit-details-marker { display: none; }
        
        #lb, #notifs { list-style-type: none; padding-left: 0; }
        #lb li, #notifs li { padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; }
        #lb li:last-child, #notifs li:last-child { border-bottom: none; }


        @media (max-width: 960px) {
            .grid { grid-template-columns: 1fr; }
            .game-card { flex-direction: column; }
            .game-card-actions { text-align: left; }
        }
	</style>
</head>

<body>
    <div class="header">
        <div class="header-inner">
            <div class="row" style="gap:16px;">
                <strong style="font-size:20px">GameHaqqs</strong>
                <span class="badge" id="ux-badges" style="display:none"></span>
            </div>
            <a class="small" href="/api-links">API Links</a>
        </div>
    </div>
    <div class="container">
	<div id="ux-alert" class="alert" style="display:none"></div>
	<div class="grid">
            <main>
			<div class="card">
				<div class="row">
                        <label class="muted">User ID</label>
					<input id="uid" class="input" value="1" style="max-width:80px" />
<script>window.__authUserId = {!! json_encode(auth()->check() ? auth()->id() : null) !!};</script>
					<button class="btn" onclick="loadUser()">Load User</button>
                        <button class="btn" onclick="togglePosts()">Posts</button>
                    </div>
                    <div id="userBox" class="mt-3 small muted"></div>
                </div>

                <div id="postsPanel" class="card" style="display:none">
                    <h3>Posts</h3>
                    <div class="row mt-3">
                        <input id="post-title" class="input" placeholder="Post title" />
                        <input id="post-content" class="input" placeholder="Post content" />
                        <button class="btn" onclick="createPost(this)">Create Post</button>
                    </div>
                    <div class="row mt-3">
                        <label class="muted">Filter</label>
                        <select id="post-status" class="input" style="max-width:180px">
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                        </select>
                        <button class="btn" onclick="loadPosts()">Refresh</button>
				</div>
                    <div id="posts-list" class="mt-3"></div>
			</div>

                <div class="game-list">
					@foreach($games as $game)
                        <div class="game-card">
                            <div class="game-card-main">
                                <h2 class="game-title">{{ $game->title }}</h2>
                                <div class="game-meta">
                                    <span><strong>Genre:</strong> {{ $game->genre }}</span>
                                    <span><strong>Developer:</strong> {{ $game->developer }}</span>
                                    <span><strong>Released:</strong> {{ $game->release_date }}</span>
                                </div>
                                <div class="game-meta">
                                    <span>{{ $game->reviews->count() }} Reviews</span>
                                    <span>{{ $game->wikis->count() }} Wikis</span>
                                    <span>{{ $game->tipsAndTricks->count() }} Tips</span>
                                </div>
                                
								@if($game->reviews->count() > 0)
                                <div class="reviews-section">
									<ul class="reviews-list">
										@foreach($game->reviews->take(2) as $r)
                                        <li>
                                            <p class="small"><strong>Rating {{ $r->rating }}/10:</strong> "{{ \Illuminate\Support\Str::limit($r->content, 80) }}"</p>
                                            <div class="row mt-2">
                                                <input class="input input-sm" id="cmt-{{ $r->id }}" placeholder="Add a comment..." />
                                                <button type="button" class="btn btn-sm" onclick="commentReview({{ $r->id }}, this)">Comment</button>
                                                <button type="button" class="btn-link" onclick="likeReview({{ $r->id }}, this)">Like</button>
												</div>
											</li>
										@endforeach
									</ul>
                                </div>
								@endif
                            </div>

                            <div class="game-card-actions">
                                <button class="btn" onclick="favorite({{ $game->id }}, this)" style="width:100%;">Favorite</button>
                                <details>
                                    <summary>Quick Review</summary>
                                    <div class="col mt-3">
                                        <input id="rat-{{ $game->id }}" class="input" placeholder="Rating 0-10" type="number" step="0.1" />
                                        <input id="rev-{{ $game->id }}" class="input" placeholder="Review content" />
                                        <button class="btn" onclick="createReview({{ $game->id }}, this)">Post Review</button>
                                    </div>
                                </details>
                                <details>
                                    <summary>Quick Tip</summary>
                                    <div class="col mt-3">
                                        <input id="ttitle-{{ $game->id }}" class="input" placeholder="Tip title" />
                                        <input id="tcontent-{{ $game->id }}" class="input" placeholder="Tip content" />
                                        <button class="btn" onclick="createTip({{ $game->id }}, this)">Post Tip</button>
                                    </div>
                                </details>
                            </div>
								</div>
                    @endforeach
								</div>
                <div class="mt-4">{{ $games->links() }}</div>
            </main>
            
            <aside>
                <div class="card">
                    <div class="row" style="justify-content: space-between;">
                        <h3>Leaderboard</h3>
                        <div class="row" style="gap: 8px;">
                            <select id="leaderboard-period" class="input" style="max-width: 120px; font-size: 12px;">
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="all-time">All Time</option>
                            </select>
                            <button class="btn btn-sm" onclick="loadLeaderboard()">Refresh</button>
                        </div>
                    </div>
                    <div class="table-wrap" style="max-height: 300px; overflow-y: auto;">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>User</th>
                                    <th>XP</th>
                                    <th>Level</th>
						</tr>
                            </thead>
                            <tbody id="lb">
				</tbody>
			</table>
		</div>
			</div>
			<div class="card">
                    <div class="row" style="justify-content: space-between;">
				<h3>Notifications</h3>
                        <button class="btn btn-sm" onclick="loadNotifications()">Refresh</button>
                    </div>
				<ul id="notifs"></ul>
			</div>
            </aside>
		</div>
	</div>

	<script>
	const api = async (p, opts={}) => {
		try{
            const res = await fetch(`/api/v1${p}`, Object.assign({ headers:{'Content-Type':'application/json','Accept':'application/json'} }, opts));
			const text = await res.text();
			let data; try{ data = text ? JSON.parse(text) : {}; } catch{ data = { message: text }; }
			if(!res.ok){ throw new Error(data.message || 'Request failed'); }
			return data;
		}catch(e){
			toast(e.message || 'Network error', true);
			throw e;
		}
	};
	const uid = () => window.__authUserId ? parseInt(window.__authUserId, 10) : parseInt(document.getElementById('uid') ? document.getElementById('uid').value : '1', 10);
	function toast(msg, isErr=false){
		const box = document.getElementById('ux-alert');
		box.className = `alert ${isErr?'alert-error':'alert-success'}`;
		box.style.display = 'block';
		box.innerText = msg;
		setTimeout(()=>{ box.style.display='none'; }, 3000);
	}

	async function loadUser(){
		const u = await api(`/users/${uid()}`);
        document.getElementById('userBox').innerText = `User #${u.id} ${u.username} | XP: ${u.xp} | Level: ${u.level}`;
		const b = document.getElementById('ux-badges');
        const badges = u.badges || [];
        b.style.display = badges.length ? 'inline-block' : 'none';
        b.innerText = badges.join(' • ');
	}

    async function loadLeaderboard(){
        const period = document.getElementById('leaderboard-period').value;
        const d = await api(`/leaderboard?period=${period}`);
        const el = document.getElementById('lb');
        el.innerHTML = '';
        (d.top||[]).forEach((x, idx)=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${x.rank || (idx + 1)}</td>
                <td><strong>${x.username}</strong></td>
                <td>${x.xp}</td>
                <td>${x.level}</td>
            `;
            el.appendChild(tr);
        });
    }

	async function loadNotifications(){
		        const d = await api(`/notifications`);

		const el = document.getElementById('notifs');
		el.innerHTML = '';
		(d.data||[]).forEach(n=>{
			const li = document.createElement('li');
            let content = `<strong>${n.type.charAt(0).toUpperCase() + n.type.slice(1)}:</strong> `;
            if (n.type === 'comment' || n.type === 'like') {
                content += `On review for entity ${n.payload.entity_type} ID ${n.payload.entity_id}. Comment ID: ${n.payload.comment_id || 'N/A'}`;
            } else {
                content += JSON.stringify(n.payload);
            }
            li.innerHTML = content;
			el.appendChild(li);
		});
	}

    function togglePosts(){
        const p = document.getElementById('postsPanel');
        p.style.display = p.style.display === 'none' ? '' : 'none';
        if(p.style.display !== 'none'){
            loadPosts();
        }
    }

    async function createPost(el){
        if(el){ el.disabled = true; el.dataset.t = el.textContent; el.textContent = 'Posting...'; }
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        if(!title || !content){ toast('Title and content required', true); if(el){ el.disabled=false; el.textContent = el.dataset.t; } return; }
        await api('/posts', { method:'POST', body: JSON.stringify({ user_id: uid(), title, content }) });
        toast('Post created (pending)');
        document.getElementById('post-title').value='';
        document.getElementById('post-content').value='';
        await loadPosts();
        if(el){ el.disabled = false; el.textContent = el.dataset.t; }
    }

    async function loadPosts(){
        const status = document.getElementById('post-status').value;
        const q = status ? `?status=${encodeURIComponent(status)}` : '';
        const res = await api(`/posts${q}`);
        const list = document.getElementById('posts-list');
        list.innerHTML = '';
        const items = res.data?.data || res.data || [];
        items.forEach(p=>{
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `<div class="row" style="justify-content:space-between"><strong>${p.title}</strong><span class="small muted">${p.status}</span></div>
                <div class="mt-2 muted">${p.content}</div>
                <div class="row mt-2">
                    <button class="btn btn-sm" onclick="viewPost(${p.id}, this)">View</button>
                    <button class="btn btn-sm" onclick="approvePost(${p.id}, this)">Approve</button>
                    <button class="btn btn-sm" onclick="declinePost(${p.id}, this)">Decline</button>
                    <button class="btn btn-sm" onclick="deletePost(${p.id}, this)">Delete</button>
                </div>`;
            list.appendChild(div);
        });
    }

    async function viewPost(id, el){
        const res = await api(`/posts/${id}`);
        toast(`Post #${id}: ${res.data?.title || ''}`);
    }

    async function approvePost(id, el){
        await api(`/posts/${id}/status`, { method:'PATCH', body: JSON.stringify({ moderator_id: 1, status: 'approved' }) });
        toast('Post approved');
        await loadPosts();
    }

    async function declinePost(id, el){
        await api(`/posts/${id}/status`, { method:'PATCH', body: JSON.stringify({ moderator_id: 1, status: 'declined' }) });
        toast('Post declined');
        await loadPosts();
    }

    async function deletePost(id, el){
        await api(`/posts/${id}`, { method:'DELETE', body: JSON.stringify({ user_id: uid() }) });
        toast('Post deleted');
        await loadPosts();
    }

    async function favorite(gameId, el){
        if(el){ el.disabled = true; el.dataset.t = el.textContent; el.textContent = 'Saving...'; }
		await api(`/games/${gameId}/favorite`, { method:'POST', body: JSON.stringify({ user_id: uid(), action:'add' }) });
		await loadUser();
        toast('Favorited!');
        if(el){ el.disabled = false; el.textContent = el.dataset.t || 'Favorite'; }
	}

	async function createReview(gameId, el){
        const parent = el.closest('details');
		if(el){ el.disabled = true; }
        const rating = parseFloat(document.getElementById(`rat-${gameId}`).value || '');
		const content = document.getElementById(`rev-${gameId}`).value || 'Great game!';
        if(Number.isNaN(rating) || rating < 0 || rating > 10){
            toast('Please enter a rating between 0 and 10', true);
            if(el){ el.disabled = false; }
            return;
        }
        if(el){ el.dataset.t = el.textContent; el.textContent = 'Posting...'; }
        const res = await api(`/games/${gameId}/reviews`, { method:'POST', body: JSON.stringify({ rating, content, author_id: uid() }) });
		await loadUser();
		toast(`Review created. +${res.xp_awarded} XP`);
        if (parent) parent.open = false;
        location.reload(); // Consider updating dynamically instead of reloading
        if(el){ el.disabled = false; el.textContent = el.dataset.t || 'Post Review'; }
	}

	async function createTip(gameId, el){
        const parent = el.closest('details');
		if(el){ el.disabled = true; }
		const title = document.getElementById(`ttitle-${gameId}`).value || 'Quick tip';
		const content = document.getElementById(`tcontent-${gameId}`).value || 'Try this route';
        if(el){ el.dataset.t = el.textContent; el.textContent = 'Posting...'; }
		const res = await api(`/games/${gameId}/tips`, { method:'POST', body: JSON.stringify({ title, content, author_id: uid() }) });
		await loadUser();
		toast(`Tip created. +${res.xp_awarded} XP`);
        if (parent) parent.open = false;
        location.reload(); // Consider updating dynamically instead of reloading
        if(el){ el.disabled = false; el.textContent = el.dataset.t || 'Post Tip'; }
	}

	async function likeReview(reviewId, el){
		if(el){ el.disabled = true; }
        if(el){ el.dataset.t = el.textContent; el.textContent = 'Liking...'; }
		const res = await api(`/reviews/${reviewId}/like`, { method:'POST', body: JSON.stringify({ user_id: uid(), action:'like' }) });
		await loadUser();
		await loadNotifications();
        toast(`Liked review! Author +${res.author_xp_awarded} XP`);
        if(el){ el.disabled = false; el.textContent = el.dataset.t || 'Like'; }
	}

	async function commentReview(reviewId, el){
		if(el){ el.disabled = true; }
        const content = document.getElementById(`cmt-${reviewId}`).value;
        if (!content) {
            toast('Comment cannot be empty.', true);
            el.disabled = false;
            return;
        }
        if(el){ el.dataset.t = el.textContent; el.textContent = '...'; }
		const res = await api(`/reviews/${reviewId}/comment`, { method:'POST', body: JSON.stringify({ author_id: uid(), content }) });
		await loadNotifications();
        toast(`Comment posted!`);
        document.getElementById(`cmt-${reviewId}`).value = '';
        if(el){ el.disabled = false; el.textContent = el.dataset.t || 'Comment'; }
    }

    async function init(){
        try{
            await loadUser();
            await loadLeaderboard();
            await loadNotifications();
        }catch(e){ /* handled in api() */ }
    }
    
    document.addEventListener('DOMContentLoaded', init);
	</script>
</body>
</html>
