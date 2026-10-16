(function () {
  "use strict";

  var D = window.PHONE_DATA || {};
  var owner = D.owner || {};

  // ---------- helpers ----------
  function $(sel) { return document.querySelector(sel); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function avatar(name, src) {
    if (src) return '<img class="avatar" src="' + esc(src) + '" alt="">';
    var first = Array.from(String(name || "?").trim())[0] || "?";
    return '<span class="avatar">' + esc(first) + "</span>";
  }

  function clock() {
    if (owner.time) return owner.time;
    var d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  function empty() { return '<p class="empty">Nothing here.</p>'; }

  function sum(list, key) {
    return (list || []).reduce(function (n, x) { return n + (x[key] || 0); }, 0);
  }

  // ---------- apps on the home screen ----------
  var APPS = [
    { id: "calls", label: "Phone", icon: "📞", color: "#34c759",
      badge: function () { return (D.calls || []).filter(function (c) { return c.type === "missed"; }).length; } },
    { id: "search", label: "Search", icon: "🔍", color: "#ffffff" },
    { id: "messages", label: "Messages", icon: "💬", color: "#30d158",
      badge: function () { return sum(D.messages, "unread"); } },
    { id: "chat", label: "Chat", icon: "🗨️", color: "#fee500",
      badge: function () { return sum(D.chats, "unread"); } },
    { id: "notes", label: "Notes", icon: "📝", color: "#ffd60a" },
    { id: "translate", label: "Translate", icon: "🌐", color: "#1a73e8" },
    { id: "photos", label: "Photos", icon: "🌼", color: "#ffffff" }
  ];

  // ---------- views ----------
  function threadList(list, kind) {
    if (!list || !list.length) return empty();
    return '<ul class="list">' + list.map(function (t, i) {
      var last = t.thread && t.thread[t.thread.length - 1] || {};
      return '<li><button class="row" data-go="thread" data-arg="' + kind + ":" + i + '">' +
        avatar(t.name, t.avatar) +
        '<span class="row-main"><span class="row-title">' + esc(t.name) + "</span>" +
        '<span class="row-sub">' + esc(last.text) + "</span></span>" +
        '<span class="row-meta">' + esc(last.time) +
        (t.unread ? '<span class="dot">' + t.unread + "</span>" : "") +
        "</span></button></li>";
    }).join("") + "</ul>";
  }

  var CALL_LABEL = { missed: "Missed call", incoming: "↙ Incoming", outgoing: "↗ Outgoing" };

  var VIEWS = {
    home: function () {
      return {
        html: '<div class="home">' +
          '<div class="home-clock">' + esc(clock()) + "</div>" +
          '<div class="home-date">' + esc(owner.date) + "</div>" +
          '<div class="grid">' + APPS.map(function (a) {
            var b = a.badge ? a.badge() : 0;
            return '<button class="app" data-go="' + a.id + '">' +
              '<span class="app-icon" style="background:' + a.color + '">' + a.icon +
              (b ? '<span class="badge">' + b + "</span>" : "") + "</span>" +
              '<span class="app-label">' + esc(a.label) + "</span></button>";
          }).join("") + "</div></div>"
      };
    },

    calls: function () {
      var list = D.calls || [];
      return {
        title: "Recents",
        html: list.length ? '<ul class="list">' + list.map(function (c) {
          return '<li class="row call ' + esc(c.type) + '">' + avatar(c.name, c.avatar) +
            '<span class="row-main"><span class="row-title">' + esc(c.name) +
            (c.count > 1 ? " (" + c.count + ")" : "") + "</span>" +
            '<span class="row-sub">' + esc(CALL_LABEL[c.type] || c.type) +
            (c.duration ? " · " + esc(c.duration) : "") + "</span></span>" +
            '<span class="row-meta">' + esc(c.time) + "</span></li>";
        }).join("") + "</ul>" : empty()
      };
    },

    search: function () {
      var list = D.searches || [];
      return {
        title: "Search",
        html: '<div class="searchbar">🔍 <span>Search the web</span></div>' +
          '<h3 class="section">Recent</h3>' +
          (list.length ? '<ul class="list">' + list.map(function (s, i) {
            var q = typeof s === "string" ? s : s.q;
            return '<li><button class="row slim" data-go="results" data-arg="' + i + '">' +
              '<span class="row-icon">🕘</span><span class="row-main"><span class="row-title">' +
              esc(q) + "</span></span></button></li>";
          }).join("") + "</ul>" : empty())
      };
    },

    results: function (i) {
      var s = (D.searches || [])[i];
      var q = typeof s === "string" ? s : s.q;
      var res = (typeof s === "object" && s.results) || [];
      return {
        title: "Results",
        html: '<div class="searchbar filled">🔍 <span>' + esc(q) + "</span></div>" +
          (res.length ? res.map(function (r) {
            return '<div class="result"><div class="result-title">' + esc(r.title) +
              '</div><div class="result-snippet">' + esc(r.snippet) + "</div></div>";
          }).join("") : '<p class="empty">The page didn\'t load.</p>')
      };
    },

    messages: function () {
      return { title: "Messages", html: threadList(D.messages, "messages") };
    },

    chat: function () {
      return { title: "Chats", html: threadList(D.chats, "chats") };
    },

    thread: function (arg) {
      var parts = String(arg).split(":");
      var kind = parts[0];
      var t = (D[kind] || [])[+parts[1]] || { thread: [] };
      var prev = null;
      var html = '<div class="bubbles">' + t.thread.map(function (m) {
        var me = m.from === "me";
        var name = t.group && !me && m.from !== prev ? '<div class="sender">' + esc(m.from) + "</div>" : "";
        prev = m.from;
        return name + '<div class="msg-row' + (me ? " me" : "") + '"><div class="msg">' +
          esc(m.text) + '</div><span class="msg-time">' + esc(m.time) + "</span></div>";
      }).join("") + "</div>";
      return {
        title: t.name,
        cls: kind === "chats" ? "chat-style" : "sms-style",
        html: html,
        foot: '<div class="composer"><span>Message</span></div>',
        after: function (body) { body.scrollTop = body.scrollHeight; }
      };
    },

    notes: function () {
      var list = D.notes || [];
      return {
        title: "Notes",
        html: list.length ? '<ul class="list">' + list.map(function (n, i) {
          return '<li><button class="row slim" data-go="note" data-arg="' + i + '">' +
            '<span class="row-main"><span class="row-title">' + esc(n.title) + "</span>" +
            '<span class="row-sub">' + esc(n.date) + " · " + esc((n.body || "").split("\n")[0]) +
            "</span></span></button></li>";
        }).join("") + "</ul>" : empty()
      };
    },

    note: function (i) {
      var n = (D.notes || [])[i] || {};
      return {
        title: "Notes",
        cls: "note-style",
        html: '<div class="note"><div class="note-date">' + esc(n.date) + "</div>" +
          "<h3>" + esc(n.title) + '</h3><div class="note-body">' + esc(n.body) + "</div></div>"
      };
    },

    translate: function () {
      var list = D.translations || [];
      return {
        title: "Translate",
        html: list.length ? list.map(function (t) {
          return '<div class="tr-card"><div class="tr-langs">' + esc(t.from) + " → " + esc(t.to) +
            '</div><div class="tr-in">' + esc(t.input) + '</div><div class="tr-out">' +
            esc(t.output) + "</div></div>";
        }).join("") : empty()
      };
    },

    photos: function () {
      var list = D.photos || [];
      return {
        title: "Photos",
        html: list.length ? '<div class="photo-grid">' + list.map(function (p, i) {
          return '<button class="tile" data-go="photo" data-arg="' + i + '">' + photo(p) + "</button>";
        }).join("") + "</div>" : empty()
      };
    },

    photo: function (i) {
      var p = (D.photos || [])[i] || {};
      return {
        title: p.date || "Photo",
        cls: "photo-style",
        html: '<div class="photo-full">' + photo(p) + "</div>" +
          '<p class="photo-caption">' + esc(p.caption) + "</p>"
      };
    }
  };

  function photo(p) {
    if (p.src) return '<img src="' + esc(p.src) + '" alt="' + esc(p.caption) + '">';
    return '<span class="ph" style="background:' + esc(p.color || "#9ca3af") + '"></span>';
  }

  // ---------- navigation ----------
  var stack = [];
  var screen = $("#screen");
  var display = $("#display");
  var overlay = $("#overlay");

  function go(view, arg) { stack.push([view, arg]); draw(); }

  function back() {
    stack.pop();
    if (!stack.length) return closePhone();
    draw();
  }

  function draw() {
    var top = stack[stack.length - 1];
    var name = top[0];
    var v = VIEWS[name](top[1]);
    var isHome = name === "home";

    display.classList.toggle("on-home", isHome);
    if (isHome && owner.wallpaper) display.style.backgroundImage = "url('" + owner.wallpaper + "')";
    else display.style.backgroundImage = "";

    screen.className = "screen view-" + name + (v.cls ? " " + v.cls : "");
    screen.innerHTML =
      (isHome ? "" : '<header class="app-bar"><button class="back" data-back type="button" aria-label="Back">‹</button><h2>' + esc(v.title) + "</h2></header>") +
      '<div class="app-body">' + v.html + "</div>" + (v.foot || "");

    var body = screen.querySelector(".app-body");
    body.scrollTop = 0;
    if (v.after) v.after(body);
  }

  function openPhone() {
    stack = [["home"]];
    draw();
    overlay.hidden = false;
    document.body.classList.add("locked");
    if (location.hash !== "#phone") history.replaceState(null, "", "#phone");
  }

  function closePhone() {
    overlay.hidden = true;
    document.body.classList.remove("locked");
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---------- story ----------
  function renderStory() {
    var s = D.story || {};
    $("#story-title").textContent = s.title || "";
    document.title = s.title || document.title;
    $("#story-body").innerHTML = (s.paragraphs || []).map(function (p) {
      return "<p>" + esc(p).replace(/\[\[(.+?)\]\]/g,
        '<button class="phone-link" type="button">$1</button>') + "</p>";
    }).join("");
  }

  // ---------- events ----------
  $("#story-body").addEventListener("click", function (e) {
    if (e.target.closest(".phone-link")) openPhone();
  });

  screen.addEventListener("click", function (e) {
    if (e.target.closest("[data-back]")) return back();
    var g = e.target.closest("[data-go]");
    if (g) go(g.getAttribute("data-go"), g.getAttribute("data-arg"));
  });

  $("#homebar").addEventListener("click", function () { stack = [["home"]]; draw(); });
  $("#close").addEventListener("click", closePhone);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closePhone(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) back();
  });

  // ---------- start ----------
  $("#status-time").textContent = clock();
  $("#status-battery").textContent = owner.battery != null ? owner.battery + "% ▮" : "";
  renderStory();
  if (location.hash === "#phone") openPhone();
})();
