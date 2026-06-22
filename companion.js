/* Floating companion — a real rigged 3D cat model (glTF via Three.js) that
   idles, reacts when clicked, follows the cursor, and chats (Claude/CLIProxyAPI).
   Model: Quaternius "Cat" (CC0) from poly.pizza, served at /models/cat.glb.
   Include with: <script src="/companion.js" defer></script>
   Claude key / base URL / model are read from localStorage (set in Admin). */
(async function () {
  const CONFIG = {
    name: 'Companion',
    size: 220,                         // px, canvas size on screen
    model: '/models/cat.glb',
    fallbackImg: '/images/companion.png',
    three: 'https://esm.sh/three@0.160.0',
    gltf: 'https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js',
    baseYaw: -0.5,                     // resting facing angle (radians)
    tint: 0xE0A063,                    // ginger tint over the grey atlas; set to null to keep original grey
    persona: "You are a cute, playful pet cat companion living on Zhihao's personal website. " +
             "Keep replies short, warm and a little mischievous; you may add the occasional 'meow~' or 🐾. " +
             "Reply in the user's language (English or 简体中文).",
    greetings: ["meow~ 🐾", "Hi there! 😺", "Pet me?", "你来啦~", "今天也要加油哦！", "*purrs*"]
  };

  // ---------- styles ----------
  const css = `
  #cmp-cat{position:fixed;right:10px;bottom:4px;z-index:9999;width:${CONFIG.size}px;height:${CONFIG.size}px;
    font-family:'Inter',system-ui,sans-serif;cursor:pointer;}
  #cmp-cat canvas{display:block;width:100%;height:100%;}
  #cmp-cat img.fallback{width:55%;position:absolute;left:0;right:0;bottom:10px;margin:auto;
    filter:drop-shadow(0 6px 10px rgba(0,0,0,.2));animation:cmp-bob 4s ease-in-out infinite;}
  @keyframes cmp-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  #cmp-bubble{position:absolute;left:50%;top:0;transform:translateX(-50%) translateY(-6px);
    max-width:190px;background:#fff;color:#2c3e50;padding:8px 12px;border-radius:14px;font-size:.82em;line-height:1.4;
    box-shadow:0 6px 20px rgba(0,0,0,.14);border:1px solid #eee;opacity:0;transition:opacity .25s,transform .25s;
    pointer-events:none;text-align:center;}
  #cmp-bubble.show{opacity:1;transform:translateX(-50%) translateY(0);}
  #cmp-bubble:after{content:'';position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-top-color:#fff;}
  #cmp-chat{position:fixed;right:16px;bottom:${CONFIG.size}px;width:300px;max-width:78vw;background:#fff;z-index:10000;
    border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.22);border:1px solid #e6e6e6;display:none;flex-direction:column;overflow:hidden;}
  #cmp-chat.open{display:flex;}
  #cmp-head{background:#2c3e50;color:#fff;padding:10px 14px;font-weight:600;font-size:.9em;display:flex;justify-content:space-between;align-items:center;}
  #cmp-head span{cursor:pointer;opacity:.8;font-weight:400;}#cmp-head span:hover{opacity:1;}
  #cmp-msgs{padding:12px;height:300px;overflow-y:auto;background:#faf9f6;}
  .cmp-m{margin:5px 0;padding:8px 11px;border-radius:11px;font-size:.85em;line-height:1.5;white-space:pre-wrap;max-width:85%;}
  .cmp-u{background:#2c3e50;color:#fff;margin-left:auto;}.cmp-a{background:#eef1f4;color:#333;margin-right:auto;}
  #cmp-form{display:flex;border-top:1px solid #eee;}
  #cmp-in{flex:1;border:0;padding:11px;font-size:.85em;font-family:inherit;outline:none;}
  #cmp-send{border:0;background:#2c3e50;color:#fff;padding:0 16px;cursor:pointer;font-weight:600;}#cmp-send:hover{background:#c0392b;}
  @media(max-width:600px){#cmp-cat{width:150px;height:150px;}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- DOM ----------
  const cat = document.createElement('div'); cat.id = 'cmp-cat'; cat.innerHTML = `<div id="cmp-bubble"></div>`;
  const chat = document.createElement('div'); chat.id = 'cmp-chat';
  chat.innerHTML = `<div id="cmp-head">${CONFIG.name}<span id="cmp-x">✕</span></div>
    <div id="cmp-msgs"></div>
    <form id="cmp-form"><input id="cmp-in" placeholder="Say something…" autocomplete="off"><button id="cmp-send" type="submit">Send</button></form>`;
  document.body.appendChild(cat); document.body.appendChild(chat);
  const bubble = cat.querySelector('#cmp-bubble'), msgs = chat.querySelector('#cmp-msgs'),
        form = chat.querySelector('#cmp-form'), input = chat.querySelector('#cmp-in');

  // ---------- bubble / chat ----------
  let bubbleTimer;
  function say(t, ms = 3500) { bubble.textContent = t; bubble.classList.add('show'); clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms); }
  function greet() {
    const h = new Date().getHours();
    const tod = h < 5 ? "up late? 🌙" : h < 12 ? "morning ☀️" : h < 18 ? "afternoon 🐾" : "evening 🌙";
    say(Math.random() < 0.5 ? tod : CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)]);
  }
  chat.querySelector('#cmp-x').addEventListener('click', (e) => { e.stopPropagation(); chat.classList.remove('open'); });
  function openChat() { if (!chat.classList.contains('open')) { chat.classList.add('open'); input.focus(); bubble.classList.remove('show'); if (!msgs.children.length) greetInChat(); } }
  function bubbleMsg(role, text) { const el = document.createElement('div'); el.className = 'cmp-m ' + (role === 'user' ? 'cmp-u' : 'cmp-a'); el.textContent = text; msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight; return el; }
  function greetInChat() { bubbleMsg('assistant', localStorage.getItem('anthropic_key') ? "meow~ 😺 ask me anything!" : "Hi! Chat isn't set up on this device yet — add a Claude key in the Admin panel to talk to me. 🐾"); }
  const history = [];
  async function callClaude(userText) {
    const key = localStorage.getItem('anthropic_key'); if (!key) throw new Error('Chat is not configured on this device.');
    const base = (localStorage.getItem('anthropic_base') || 'https://api.anthropic.com').replace(/\/+$/, '');
    const model = localStorage.getItem('claude_model') || 'claude-opus-4-8';
    history.push({ role: 'user', content: userText });
    const res = await fetch(base + '/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model, max_tokens: 1024, system: [{ type: 'text', text: CONFIG.persona, cache_control: { type: 'ephemeral' } }], messages: history })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || ('HTTP ' + res.status));
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    history.push({ role: 'assistant', content: text }); return text;
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); const q = input.value.trim(); if (!q) return;
    bubbleMsg('user', q); input.value = '';
    const t = bubbleMsg('assistant', '…');
    try { t.textContent = await callClaude(q); } catch (err) { t.textContent = '⚠️ ' + err.message; history.pop(); }
  });
  function imageFallback() {
    const im = document.createElement('img'); im.className = 'fallback'; im.src = CONFIG.fallbackImg; im.alt = CONFIG.name;
    im.addEventListener('error', () => { cat.style.display = 'none'; chat.style.display = 'none'; });
    cat.appendChild(im); cat.addEventListener('click', openChat);
  }

  // ---------- 3D ----------
  let THREE, GLTFLoader;
  try {
    THREE = await import(CONFIG.three);
    ({ GLTFLoader } = await import(CONFIG.gltf));
  } catch (e) { console.warn('[companion] three.js failed, image fallback', e); imageFallback(); setTimeout(greet, 1200); return; }

  try {
  const S = CONFIG.size;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(2.6, 1.7, 3.4); camera.lookAt(0, 0.7, 0);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(S, S);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  cat.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 6, 4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { near: 1, far: 25, left: -3, right: 3, top: 3, bottom: -3 });
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe9d0, 0.4); fill.position.set(-3, 2, 1); scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  const C = new THREE.Group(); scene.add(C);
  let mixer = null, idleAction = null, clips = [];
  const clock = new THREE.Clock();

  function actionEndingWith(suffix) { const c = clips.find(x => x.name.endsWith(suffix)); return c ? mixer.clipAction(c) : null; }
  function playOnce(suffix) {
    if (!mixer) return;
    const a = actionEndingWith(suffix); if (!a) return;
    a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false;
    if (idleAction) idleAction.fadeOut(0.15);
    a.fadeIn(0.15).play();
  }

  new GLTFLoader().load(CONFIG.model, (gltf) => {
    const model = gltf.scene;
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true; o.receiveShadow = true;
        if (CONFIG.tint && o.material) { o.material = o.material.clone(); o.material.color = new THREE.Color(CONFIG.tint); }
      }
    });
    // Rigged model: do NOT scale (scaling the root breaks GPU skinning). Also the
    // geometry bounding box is unreliable for skinned meshes — use the skeleton's
    // real world bounds to size/center the cat, then fit the camera.
    C.add(model); C.rotation.y = 0; C.updateWorldMatrix(true, true);
    const box = new THREE.Box3(); let bones = 0; const v = new THREE.Vector3();
    model.traverse((o) => { if (o.isBone) { o.getWorldPosition(v); box.expandByPoint(v); bones++; } });
    if (bones === 0) box.setFromObject(model);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    model.position.x -= center.x; model.position.z -= center.z; model.position.y -= box.min.y;
    C.rotation.y = CONFIG.baseYaw;

    // fit camera to the real (skeleton) size
    const r = Math.max(size.x, size.y, size.z) * 0.5 * 1.4;   // margin for mesh beyond skeleton
    const cy = size.y * 0.55;
    const dist = (r / Math.sin((camera.fov * Math.PI / 180) / 2)) * 1.2;
    camera.position.set(dist * 0.45, cy + r * 0.25, dist * 0.9);
    camera.near = dist / 100; camera.far = dist * 100; camera.updateProjectionMatrix();
    camera.lookAt(0, cy, 0);

    // size ground + shadow frustum to the model
    ground.scale.setScalar(Math.max(size.x, size.z, 1) * 6);
    const ext = Math.max(size.x, size.z, 0.5) * 1.6;
    Object.assign(key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, near: 0.1, far: size.y * 8 });
    key.position.set(size.y, size.y * 2.2, size.y); key.shadow.camera.updateProjectionMatrix();

    console.log('[companion] model loaded, bones', bones, 'size', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2), 'anims', (gltf.animations || []).length);

    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      clips = gltf.animations;
      idleAction = actionEndingWith('Idle');
      if (idleAction) idleAction.play();
      mixer.addEventListener('finished', () => { if (idleAction) idleAction.reset().fadeIn(0.2).play(); });
      // occasional spontaneous action
      setInterval(() => { if (!document.hidden && Math.random() < 0.5) playOnce(Math.random() < 0.5 ? 'Headbutt' : 'Jump_Start'); }, 9000);
    }
  }, undefined, (err) => { console.warn('[companion] model load failed', err); renderer.domElement.remove(); imageFallback(); });

  // cursor follow / idle sway
  let targetTurn = 0, lastMove = 0;
  window.addEventListener('pointermove', (e) => { targetTurn = (0.5 - e.clientX / window.innerWidth) * 1.2; lastMove = performance.now(); });

  cat.addEventListener('click', () => { playOnce('Headbutt'); openChat(); });
  window.addEventListener('resize', () => renderer.setSize(S, S));

  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    const dt = clock.getDelta(), t = clock.elapsedTime;
    if (mixer) mixer.update(dt);
    const idle = performance.now() - lastMove > 2500;
    const aim = CONFIG.baseYaw + (idle ? Math.sin(t * 0.4) * 0.5 : targetTurn);
    C.rotation.y += (aim - C.rotation.y) * 0.05;
    renderer.render(scene, camera);
  }
  animate();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { clock.getDelta(); animate(); }
  });
  } catch (e) { console.warn('[companion] 3D init failed, using image fallback', e); imageFallback(); }

  setTimeout(greet, 1200);
})();
