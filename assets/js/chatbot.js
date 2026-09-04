(function () {
  const WHATSAPP_BASE = "https://wa.me/971567578646?text=";

  // Knowledge base: each entry has trigger keywords and a reply. Order matters —
  // first match wins, so more specific topics are listed before general ones.
  const KB = [
    {
      keywords: ["hour", "open", "close", "time", "when"],
      reply: "We're open every day, 09:00 to midnight — no closed days.",
    },
    {
      keywords: ["book a court", "book court", "reserve", "availability", "playtomic", "book a padel"],
      reply: "Courts are booked live through Playtomic, our official booking partner.",
      link: { href: "https://playtomic.com/clubs/the-padel-project", label: "Book a court on Playtomic" },
    },
    {
      keywords: ["lesson", "coach", "coaching", "academy", "training", "class"],
      reply: "We run private and group coaching — men's, ladies' and kids' academies — with 5 professional coaches including Bernardo, Marc, Iris and Cris. The fastest way to set up a lesson is WhatsApp.",
      link: { href: WHATSAPP_BASE + encodeURIComponent("Hi! I'd like to book a lesson at The Padel Project"), label: "Book a lesson on WhatsApp", whatsapp: true },
    },
    {
      keywords: ["price", "pricing", "cost", "how much", "fee", "rate"],
      reply: "Court and lesson pricing is shown live when you check availability — it can vary by time slot, so I don't want to quote you a wrong number. Check current rates on Playtomic, or ask our team directly on WhatsApp.",
      link: { href: "https://playtomic.com/clubs/the-padel-project", label: "See live pricing on Playtomic" },
    },
    {
      keywords: ["court", "how many court", "indoor", "outdoor", "superpanoramic"],
      reply: "We have 6 indoor superpanoramic courts — Courts 1–4 are standard, Court 5 is configurable, and Court 6 is fully private.",
    },
    {
      keywords: ["location", "address", "where", "direction", "musaffah", "find you"],
      reply: "We're at The Padel Project, Musaffah M-45, Abu Dhabi, UAE — free and private parking on site.",
      link: { href: "https://maps.app.goo.gl/4qeAhD4eZgzNvr9m8", label: "Get directions" },
    },
    {
      keywords: ["gym", "fitness", "ice bath", "coffee", "cafe", "amenit", "facilit", "shop", "parking", "locker", "shower"],
      reply: "On site: a padel-specific gym with a dedicated fitness coach, ice bath recovery, the Among the Stars coffee shop, a rooftop lounge, a pro shop managed by Padel Outlet, changing rooms, lockers, WiFi and free parking.",
    },
    {
      keywords: ["review", "rating", "google"],
      reply: "We're rated 4.9★ from 120 Google reviews.",
      link: { href: "https://maps.app.goo.gl/4qeAhD4eZgzNvr9m8", label: "Read our Google reviews" },
    },
    {
      keywords: ["contact", "phone", "call", "email", "whatsapp", "instagram", "reach"],
      reply: "Fastest way to reach us is WhatsApp. We're also on Instagram @thepadelproject.ae, or email thepadelbeast@gmail.com.",
      link: { href: "https://wa.me/971567578646", label: "Message us on WhatsApp", whatsapp: true },
    },
    {
      keywords: ["team", "staff", "manager", "who runs", "front of house", "reception"],
      reply: "Miras is our General Manager, with Fahad and Mohaifa on reception, Hassan on matchmaking, and Rose & Ana keeping the place spotless — plus our 5 coaches.",
    },
  ];

  const FALLBACK_REPLY = "I don't have an answer for that one — our team on WhatsApp can help directly.";

  function matchKB(text) {
    const q = text.toLowerCase();
    for (const entry of KB) {
      if (entry.keywords.some((k) => q.includes(k))) return entry;
    }
    return null;
  }

  const SUGGESTIONS = [
    "What are your opening hours?",
    "How do I book a court?",
    "How much does it cost?",
    "Where are you located?",
  ];

  // --- Build widget DOM ---
  const root = document.createElement("div");
  root.id = "chatWidget";
  root.innerHTML = `
    <button id="chatToggle" aria-expanded="false" aria-controls="chatPanel" aria-label="Open chat">
      <svg id="chatIconOpen" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.9-.94L3 20l1.06-3.7A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3h.5a8.5 8.5 0 0 1 9 8.5Z"/></svg>
      <svg id="chatIconClose" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="display:none;"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
    </button>
    <div id="chatPanel" role="dialog" aria-label="Chat with The Padel Project" aria-hidden="true">
      <div id="chatHeader">
        <img src="assets/img/tpp-logo-gold.png" alt="" />
        <div>
          <p id="chatHeaderTitle">The Padel Project</p>
          <p id="chatHeaderSubtitle">Ask us anything</p>
        </div>
      </div>
      <div id="chatMessages"></div>
      <div id="chatSuggestions"></div>
      <form id="chatForm">
        <input id="chatInput" type="text" autocomplete="off" placeholder="Type a question…" aria-label="Type a question" />
        <button type="submit" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = document.getElementById("chatToggle");
  const panel = document.getElementById("chatPanel");
  const iconOpen = document.getElementById("chatIconOpen");
  const iconClose = document.getElementById("chatIconClose");
  const messages = document.getElementById("chatMessages");
  const suggestionsEl = document.getElementById("chatSuggestions");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  function addMessage(text, from, linkInfo) {
    const row = document.createElement("div");
    row.className = "chatRow chatRow-" + from;
    const bubble = document.createElement("div");
    bubble.className = "chatBubble chatBubble-" + from;
    bubble.textContent = text;
    row.appendChild(bubble);
    messages.appendChild(row);

    if (linkInfo) {
      const linkRow = document.createElement("div");
      linkRow.className = "chatRow chatRow-bot";
      const a = document.createElement("a");
      a.href = linkInfo.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "chatLinkBtn" + (linkInfo.whatsapp ? " chatLinkBtn-whatsapp" : "");
      a.textContent = linkInfo.label;
      linkRow.appendChild(a);
      messages.appendChild(linkRow);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  function renderSuggestions(list) {
    suggestionsEl.innerHTML = "";
    list.forEach((q) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chatChip";
      chip.textContent = q;
      chip.addEventListener("click", () => handleUserMessage(q));
      suggestionsEl.appendChild(chip);
    });
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, "user");
    input.value = "";
    suggestionsEl.innerHTML = "";

    setTimeout(() => {
      const match = matchKB(text);
      if (match) {
        addMessage(match.reply, "bot", match.link);
      } else {
        addMessage(FALLBACK_REPLY, "bot", {
          href: WHATSAPP_BASE + encodeURIComponent("Hi! " + text),
          label: "Ask on WhatsApp",
          whatsapp: true,
        });
      }
    }, 350);
  }

  let started = false;
  function openChat() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    iconOpen.style.display = "none";
    iconClose.style.display = "block";
    if (!started) {
      started = true;
      addMessage("Hey! I'm the front-desk bot for The Padel Project. Ask me about hours, booking, coaching, pricing or location — or message our team directly on WhatsApp any time.", "bot");
      renderSuggestions(SUGGESTIONS);
    }
    input.focus();
  }
  function closeChat() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    iconOpen.style.display = "block";
    iconClose.style.display = "none";
  }

  toggle.addEventListener("click", () => {
    panel.classList.contains("open") ? closeChat() : openChat();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUserMessage(input.value);
  });
})();
