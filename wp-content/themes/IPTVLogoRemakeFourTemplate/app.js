    <h1>IPTV Latino &amp; English</h1>
    <div class="hello">Hello IPTV, Latino and English.</div>
    <p class="notice">Live TV, music and radio channels from <code>iptv/index.m3u</code>. Availability, language and playback depend on each public stream provider.</p>
  </header>
  <main>
    <section class="card" aria-labelledby="player-title">
      <h2 id="player-title">Live player</h2>
      <video id="player" controls playsinline preload="metadata"></video>
      <div class="now" id="now" role="status">Loading playlist…</div>
      <div class="toolbar">
        <input id="search" type="search" placeholder="Search channels" aria-label="Search channels">
        <select id="group" aria-label="Filter by category"><option value="">All categories</option></select>
        <button class="secondary" id="reload">Reload playlist</button>
      </div>
      <div id="channels" class="channels" aria-live="polite"></div>
    </section>
    <aside class="card">
      <h2>Browser support</h2>
      <p class="notice">HLS is native in Safari. Chrome and Firefox use HLS.js when the stream permits cross-origin playback.</p>
      <ul class="browser-list">
        <li>Chrome: supported where CORS is enabled</li>
        <li>Firefox: supported where CORS is enabled</li>
        <li>Safari / Apple Chile: <a href="https://www.apple.com/cl/safari" target="_blank" rel="noopener">Safari</a></li>
      </ul>
      <p id="support" class="notice"></p>
      <p class="notice">Some channels may be geo-blocked, offline, HTTPS-incompatible, or require a provider-specific referrer/user agent. A web page cannot spoof a custom User-Agent for a cross-origin media request.</p>
    </aside>
  </main>
  <footer>
    Copyright and playlist rights remain with their respective owners. This player is released under <a href="https://creativecommons.org/public-domain/cc0/" target="_blank" rel="noopener">Creative Commons Zero (CC0)</a>. Mature 17+ / ESRB notice: viewer discretion is advised; this page does not curate or guarantee third-party content.
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
  <script>
    const playlistUrl = 'index.m3u';
    const player = document.querySelector('#player'), list = document.querySelector('#channels');
    const search = document.querySelector('#search'), group = document.querySelector('#group');
    const now = document.querySelector('#now'), support = document.querySelector('#support');
    let channels = [], hls;
    function parseM3U(text) {
      const lines = text.split(/\r?\n/), result=[]; let info=null;
      for (const raw of lines) { const line=raw.trim(); if (!line) continue;
        if (line.startsWith('#EXTINF:')) { const comma=line.indexOf(','); const attrs=line.slice(0,comma); const title=(comma<0?'Channel':line.slice(comma+1)).trim();
          const get=(key)=>{const m=attrs.match(new RegExp(key+'="([^"]*)"','i'));return m?m[1]:''};
          info={title, logo:get('tvg-logo'), group:get('group-title')||'Other'};
        } else if (!line.startsWith('#') && info) { result.push({...info,url:line}); info=null; }
      } return result;
    }
    function render() {
      const q=search.value.toLowerCase(), g=group.value;
      list.replaceChildren(); const filtered=channels.filter(c=>(!g||c.group===g)&&(!q||(c.title+' '+c.group).toLowerCase().includes(q)));
      if (!filtered.length) { list.innerHTML='<div class="empty">No channels found.</div>'; return; }
      for (const c of filtered) { const b=document.createElement('button'); b.className='channel'; b.title=c.url;
        if(c.logo){const img=document.createElement('img');img.src=c.logo;img.alt='';img.loading='lazy';b.append(img)}
        const text=document.createElement('span'); text.textContent=c.title; const small=document.createElement('small');small.textContent=c.group;text.append(small);b.append(text);b.onclick=()=>play(c);list.append(b);
      }
    }
    function play(c) { if(hls){hls.destroy();hls=null} now.textContent='Loading: '+c.title;
      if (player.canPlayType('application/vnd.apple.mpegurl')) { player.src=c.url; player.play().catch(()=>{}); }
      else if (window.Hls && Hls.isSupported()) { hls=new Hls({enableWorker:true}); hls.loadSource(c.url); hls.attachMedia(player); hls.on(Hls.Events.MANIFEST_PARSED,()=>player.play().catch(()=>{})); hls.on(Hls.Events.ERROR,(_,d)=>{if(d.fatal) now.textContent='Playback unavailable: '+c.title;}); }
      else { now.textContent='This browser does not support HLS.'; return; } now.textContent='Now playing: '+c.title;
    }
    async function load() { now.textContent='Loading playlist…'; try { const r=await fetch(playlistUrl,{cache:'no-store'}); if(!r.ok) throw Error(r.status); channels=parseM3U(await r.text());
        const groups=[...new Set(channels.map(c=>c.group))].sort(); group.replaceChildren(new Option('All categories','')); groups.forEach(g=>group.add(new Option(g,g))); render(); now.textContent=channels.length+' channels loaded';
      } catch(e) { list.innerHTML='<div class="empty">Could not load index.m3u. Check that the page is served over HTTP(S).</div>'; now.textContent='Playlist error: '+e.message; }
    }
    search.oninput=render; group.onchange=render; document.querySelector('#reload').onclick=load;
    const ua=navigator.userAgent; support.textContent=/Chrome/.test(ua)?'Detected browser: Chrome':/Firefox/.test(ua)?'Detected browser: Firefox':/Safari/.test(ua)&&!/Chrome/.test(ua)?'Detected browser: Safari':'Detected browser: other';
    load();
      
