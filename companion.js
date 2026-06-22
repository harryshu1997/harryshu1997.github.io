/* Floating companion widget — idle animation + click-to-chat (Claude / CLIProxyAPI).
   Include on any page with:  <script src="/companion.js" defer></script>
   The Claude API key / base URL / model are read from localStorage (set in the
   Admin panel), so chat only works in a browser that has them — visitors just
   see the figure and greetings. */
(function () {
  const CONFIG = {
    name: 'Companion',
    img: '/images/companion.png',
    width: 132,                       // px, on-screen width of the figure
    // Persona for the chat. Edit freely.
    persona: "You are a warm, playful, supportive companion living on Zhihao's personal website. " +
             "Keep replies short, friendly and encouraging. Reply in the user's language " +
             "(English or 简体中文). You are not a generic assistant — you're his cheerful companion.",
    greetings: [
      "Hi there! 👋",
      "Welcome back 😊",
      "Working hard or hardly working?",
      "Need a little break?",
      "你来啦~",
      "今天也要加油哦！"
    ]
  };

  // ---- styles ----
  const css = `
  #cmp-root{position:fixed;right:18px;bottom:18px;z-index:9999;font-family:'Inter',system-ui,sans-serif;}
  #cmp-fig{width:${CONFIG.width}px;cursor:pointer;display:block;filter:drop-shadow(0 8px 16px rgba(0,0,0,.25));
    animation:cmp-float 4.5s ease-in-out infinite;transform-origin:bottom center;transition:transform .2s;-webkit-user-select:none;user-select:none;}
  #cmp-fig:hover{transform:scale(1.04);}
  #cmp-fig:active{transform:scale(.97);}
  @keyframes cmp-float{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-9px) rotate(1deg);}}
  #cmp-bubble{position:absolute;right:${CONFIG.width - 6}px;bottom:${Math.round(CONFIG.width*0.55)}px;
    max-width:200px;background:#fff;color:#2c3e50;padding:9px 13px;border-radius:14px;font-size:.85em;line-height:1.45;
    box-shadow:0 6px 20px rgba(0,0,0,.12);border:1px solid #eee;opacity:0;transform:translateY(6px);
    transition:opacity .25s,transform .25s;pointer-events:none;white-space:normal;}
  #cmp-bubble.show{opacity:1;transform:translateY(0);}
  #cmp-bubble:after{content:'';position:absolute;right:-7px;bottom:14px;border:7px solid transparent;border-left-color:#fff;}
  #cmp-chat{position:absolute;right:0;bottom:${CONFIG.width + 14}px;width:300px;max-width:78vw;background:#fff;
    border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.22);border:1px solid #e6e6e6;display:none;flex-direction:column;overflow:hidden;}
  #cmp-chat.open{display:flex;}
  #cmp-head{background:#2c3e50;color:#fff;padding:10px 14px;font-weight:600;font-size:.9em;display:flex;justify-content:space-between;align-items:center;}
  #cmp-head span{cursor:pointer;opacity:.8;font-weight:400;}#cmp-head span:hover{opacity:1;}
  #cmp-msgs{padding:12px;height:300px;overflow-y:auto;background:#faf9f6;}
  .cmp-m{margin:5px 0;padding:8px 11px;border-radius:11px;font-size:.85em;line-height:1.5;white-space:pre-wrap;max-width:85%;}
  .cmp-u{background:#2c3e50;color:#fff;margin-left:auto;}
  .cmp-a{background:#eef1f4;color:#333;margin-right:auto;}
  #cmp-form{display:flex;border-top:1px solid #eee;}
  #cmp-in{flex:1;border:0;padding:11px;font-size:.85em;font-family:inherit;outline:none;}
  #cmp-send{border:0;background:#2c3e50;color:#fff;padding:0 16px;cursor:pointer;font-weight:600;}
  #cmp-send:hover{background:#c0392b;}
  @media(max-width:600px){#cmp-fig{width:96px;}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---- DOM ----
  const root = document.createElement('div');
  root.id = 'cmp-root';
  root.innerHTML = `
    <div id="cmp-chat">
      <div id="cmp-head">${CONFIG.name}<span id="cmp-x">✕</span></div>
      <div id="cmp-msgs"></div>
      <form id="cmp-form"><input id="cmp-in" placeholder="Say something…" autocomplete="off"><button id="cmp-send" type="submit">Send</button></form>
    </div>
    <div id="cmp-bubble"></div>
    <img id="cmp-fig" src="${CONFIG.img}" alt="${CONFIG.name}" draggable="false">
  `;
  document.body.appendChild(root);

  const fig = root.querySelector('#cmp-fig');
  const bubble = root.querySelector('#cmp-bubble');
  const chat = root.querySelector('#cmp-chat');
  const msgs = root.querySelector('#cmp-msgs');
  const form = root.querySelector('#cmp-form');
  const input = root.querySelector('#cmp-in');

  let bubbleTimer;
  function say(text, ms = 4000) {
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function greet() {
    const h = new Date().getHours();
    const tod = h < 5 ? "Up late? 🌙" : h < 12 ? "Good morning ☀️" : h < 18 ? "Good afternoon 🌤️" : "Good evening 🌆";
    say(Math.random() < 0.5 ? tod : CONFIG.greetings[Math.floor(Math.random() * CONFIG.greetings.length)]);
  }

  // hide a broken image gracefully (e.g. before companion.png exists)
  fig.addEventListener('error', () => { root.style.display = 'none'; });

  fig.addEventListener('mouseenter', () => { if (!chat.classList.contains('open')) greet(); });
  fig.addEventListener('click', () => {
    const open = chat.classList.toggle('open');
    if (open) { bubble.classList.remove('show'); input.focus(); if (!msgs.children.length) greetInChat(); }
  });
  root.querySelector('#cmp-x').addEventListener('click', (e) => { e.stopPropagation(); chat.classList.remove('open'); });

  function bubbleMsg(role, text) {
    const el = document.createElement('div');
    el.className = 'cmp-m ' + (role === 'user' ? 'cmp-u' : 'cmp-a');
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function greetInChat() {
    bubbleMsg('assistant', localStorage.getItem('anthropic_key')
      ? "Hey! 💬 Ask me anything."
      : "Hi! Chat isn't set up on this device yet — add a Claude key in the Admin panel to talk to me. 🙂");
  }

  const history = [];
  async function callClaude(userText) {
    const key = localStorage.getItem('anthropic_key');
    if (!key) throw new Error('Chat is not configured on this device.');
    const base = (localStorage.getItem('anthropic_base') || 'https://api.anthropic.com').replace(/\/+$/, '');
    const model = localStorage.getItem('claude_model') || 'claude-opus-4-8';
    history.push({ role: 'user', content: userText });
    const res = await fetch(base + '/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model, max_tokens: 1024,
        system: [{ type: 'text', text: CONFIG.persona, cache_control: { type: 'ephemeral' } }],
        messages: history
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || ('HTTP ' + res.status));
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    history.push({ role: 'assistant', content: text });
    return text;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    bubbleMsg('user', q);
    input.value = '';
    const thinking = bubbleMsg('assistant', '…');
    try {
      thinking.textContent = await callClaude(q);
    } catch (err) {
      thinking.textContent = '⚠️ ' + err.message;
      history.pop(); // drop the failed user turn so it can be retried
    }
  });

  // initial greeting shortly after load
  setTimeout(greet, 1200);
})();
