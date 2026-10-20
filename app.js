(function () {
  "use strict";

  // ============================================================
  //  language
  //  The reader picks English or 한국어 under the story.
  //  Any text in data.js can be written in both languages:
  //    title: { en: "Missing", ko: "실종" }
  //  Text written only once is shown as-is in both languages.
  // ============================================================
  var RAW = window.PHONE_DATA || {};
  var LANGS = ["en", "ko"];
  var LANG = "en", D = {}, owner = {};

  // Phone labels in Korean ({n} is replaced by a number or name)
  var KO = {
    "Phone": "전화", "Search": "검색", "Messages": "메시지", "Chat": "채팅", "Notes": "메모",
    "Translate": "번역", "Photos": "사진", "Calendar": "캘린더", "Camera": "카메라", "Clock": "시계",
    "Weather": "날씨", "Settings": "설정", "Mail": "메일", "Music": "음악", "Maps": "지도", "Books": "도서",
    "Swipe up to open": "위로 쓸어올려 열기", "Missed Call": "부재중 전화",
    "{n} more message": "메시지 {n}개 더 보기", "{n} more messages": "메시지 {n}개 더 보기",
    "Recents": "최근 기록", "All": "전체", "Missed": "부재중", "Edit": "편집",
    "Favorites": "즐겨찾기", "Contacts": "연락처", "Keypad": "키패드", "Voicemail": "음성 사서함",
    "Incoming": "수신", "Outgoing": "발신", "No missed calls.": "부재중 전화 없음", "No recent calls.": "최근 통화 없음",
    "Search or enter website": "검색 또는 웹 사이트 입력", "Recent Searches": "최근 검색", "Clear": "지우기",
    "No recent searches.": "최근 검색 없음", "Results": "검색 결과", "The page didn't load.": "페이지를 열 수 없습니다.",
    "Text Message": "문자 메시지", "Delivered": "전송됨", "Chats": "채팅",
    "No additional text": "추가 텍스트 없음", "{n} Note": "메모 {n}개", "{n} Notes": "메모 {n}개", "Done": "완료",
    "English": "영어", "Korean": "한국어", "Enter text": "텍스트 입력", "Recent": "최근",
    "{n} Photo": "사진 {n}장", "{n} Photos": "사진 {n}장", "Photo": "사진",
    "No events.": "일정 없음", "No upcoming events": "예정된 일정 없음",
    "Now": "지금", "Today": "오늘", "Hourly Forecast": "시간별 일기예보", "{n}-Day Forecast": "{n}일간의 일기예보",
    "H:": "최고:", "L:": "최저:", "Seoul": "서울",
    "Sunny": "맑음", "Clear": "맑음", "Partly Cloudy": "구름 조금", "Cloudy": "흐림", "Rain": "비", "Snow": "눈", "Thunderstorms": "뇌우",
    "Can't Open {n}": "'{n}' 앱을 열 수 없음", "This app isn't part of the story.": "이 앱은 이야기에 포함되어 있지 않습니다.",
    "OK": "확인", "Back": "뒤로", "Nothing here.": "내용 없음", "Language": "언어"
  };

  function T(s, n) {
    var t = LANG === "ko" && KO[s] != null ? KO[s] : s;
    return n == null ? t : t.replace("{n}", n);
  }

  // { en: "...", ko: "..." } -> the text for the chosen language (or whichever one exists)
  function isLangObj(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    var keys = Object.keys(v);
    return keys.length > 0 && keys.every(function (k) { return LANGS.indexOf(k) >= 0; });
  }
  function resolve(v) {
    if (Array.isArray(v)) return v.map(resolve);
    if (isLangObj(v)) return resolve(v[LANG] != null ? v[LANG] : v[LANGS.filter(function (l) { return v[l] != null; })[0]]);
    if (v && typeof v === "object") {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = resolve(v[k]); });
      return o;
    }
    return v;
  }

  function setLang(l) {
    LANG = LANGS.indexOf(l) >= 0 ? l : "en";
    D = resolve(RAW);
    owner = D.owner || {};
    document.documentElement.lang = LANG;
  }

  // Which language to start in: ?lang=ko in the address, the reader's last choice,
  // `language` in data.js, Korean if the story is written in Korean, otherwise the browser's language
  function startLang() {
    var q = /[?&]lang=(en|ko)\b/.exec(location.search);
    if (q) return q[1];
    var saved = null;
    try { saved = localStorage.getItem("phonePeekLang"); } catch (err) { /* storage blocked */ }
    if (LANGS.indexOf(saved) >= 0) return saved;
    var set = RAW.language || (RAW.owner && RAW.owner.language);
    if (LANGS.indexOf(set) >= 0) return set;
    if (/[가-힣]/.test(plainText(RAW.story))) return "ko";
    return /^ko/i.test(navigator.language || "") ? "ko" : "en";
  }

  // Text written in only one language (skips { en, ko } pairs)
  function plainText(v) {
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map(plainText).join(" ");
    if (isLangObj(v)) return "";
    if (v && typeof v === "object") return Object.keys(v).map(function (k) { return plainText(v[k]); }).join(" ");
    return "";
  }
  setLang(startLang());

  // ============================================================
  //  helpers
  // ============================================================
  function $(sel) { return document.querySelector(sel); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initial(name) { return Array.from(String(name || "?").trim())[0] || "?"; }

  function avatar(name, src, cls) {
    var c = "avatar" + (cls ? " " + cls : "");
    if (src) return '<img class="' + c + '" src="' + esc(src) + '" alt="">';
    return '<span class="' + c + '">' + esc(initial(name)) + "</span>";
  }

  function clock() {
    if (owner.time) return owner.time;
    var d = new Date();
    return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  // "23:05" -> minutes since midnight, or null if it isn't a time
  function minutes(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(t || "").trim());
    return m ? +m[1] * 60 + +m[2] : null;
  }

  // ---------- the phone's date ----------
  // Reads owner.date, in English ("Friday, October 16") or Korean ("10월 16일 금요일").
  // If no year is given, it picks the nearest year where that date falls on that weekday.
  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  function storyDate() {
    var s = String(owner.date || ""), now = new Date();
    var m, mon = -1, day = 0, year = 0, wd = -1;
    if ((m = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/.exec(s))) { mon = +m[1] - 1; day = +m[2]; }
    else if ((m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/i.exec(s))) {
      mon = MONTHS.indexOf(m[1].toLowerCase()); day = +m[2];
    }
    if ((m = /\b(\d{4})\b/.exec(s))) year = +m[1];
    if ((m = /([일월화수목금토])요일/.exec(s))) wd = "일월화수목금토".indexOf(m[1]);
    else if ((m = /\b(sun|mon|tue|wed|thu|fri|sat)/i.exec(s))) wd = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(m[1].toLowerCase());
    if (mon < 0 || !day) return now;
    if (!year) {
      year = now.getFullYear();
      if (wd >= 0) {
        for (var k = 0; k < 12; k++) {
          if (new Date(year - k, mon, day).getDay() === wd) { year -= k; break; }
          if (new Date(year + k, mon, day).getDay() === wd) { year += k; break; }
        }
      }
    }
    return new Date(year, mon, day);
  }

  function fmt(d, opts) { return d.toLocaleDateString(LANG === "ko" ? "ko-KR" : "en-US", opts); }

  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }

  // Month calendar: weekday letters, then the days, with today circled
  function monthGrid(d) {
    var first = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    var count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    var html = "";
    for (var i = 0; i < 7; i++) html += "<b>" + esc(fmt(new Date(2023, 0, 1 + i), { weekday: "narrow" })) + "</b>";
    for (i = 0; i < first; i++) html += "<i></i>";
    for (i = 1; i <= count; i++) html += "<i" + (i === d.getDate() ? ' class="today"' : "") + ">" + i + "</i>";
    return '<span class="mgrid">' + html + "</span>";
  }

  // ---------- weather (from data.js, with sensible defaults) ----------
  var CONDITION = { sun: "Sunny", moon: "Clear", partly: "Partly Cloudy", cloud: "Cloudy", rain: "Rain", snow: "Snow", storm: "Thunderstorms" };

  function weather() {
    var w = D.weather || {};
    var mins = minutes(clock());
    var night = mins !== null && (mins < 6 * 60 || mins >= 19 * 60);
    var icon = CONDITION[w.icon] ? w.icon : (night ? "moon" : "sun");
    var temp = w.temp != null ? +w.temp : 14;
    var hour = mins === null ? 12 : Math.floor(mins / 60);
    var hourly = w.hourly || [0, 1, 2, 3, 4, 5].map(function (i) {
      return { time: i === 0 ? T("Now") : (hour + i) % 24 + (LANG === "ko" ? "시" : ""), icon: icon, temp: Math.round(temp + (night ? -0.6 : 0.4) * i) };
    });
    var dayIcon = icon === "moon" ? "sun" : icon;
    var base = storyDate();
    var daily = w.daily || ["sun", "partly", "cloud", "rain", "sun"].map(function (ic, i) {
      return {
        day: i === 0 ? T("Today") : fmt(addDays(base, i), { weekday: "short" }),
        icon: i === 0 ? dayIcon : ic,
        low: (w.low != null ? +w.low : temp - 5) + [0, 1, -1, 0, 2][i],
        high: (w.high != null ? +w.high : temp + 4) + [0, -1, -2, 1, 0][i]
      };
    });
    return {
      city: w.city || T("Seoul"), temp: temp, icon: icon,
      condition: w.condition || T(CONDITION[icon]),
      high: w.high != null ? w.high : temp + 4,
      low: w.low != null ? w.low : temp - 5,
      hourly: hourly, daily: daily
    };
  }

  // Weather symbols: sun, moon, partly, cloud, rain, snow, storm
  function wIcon(name) {
    var cloud = '<path fill="#fff" d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.9 9.1a4.7 4.7 0 0 1-.4 9.4z"/>';
    var up = function (s) { return '<g transform="translate(0 -3)">' + s + "</g>"; };
    var rays = "";
    for (var a = 0; a < 8; a++) {
      var r = a * Math.PI / 4;
      rays += '<path d="M' + (12 + 6.8 * Math.cos(r)).toFixed(1) + " " + (12 + 6.8 * Math.sin(r)).toFixed(1) + "L" +
        (12 + 9 * Math.cos(r)).toFixed(1) + " " + (12 + 9 * Math.sin(r)).toFixed(1) + '"/>';
    }
    var sun = '<circle cx="12" cy="12" r="4.6" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="1.8" stroke-linecap="round">' + rays + "</g>";
    var art = {
      sun: sun,
      moon: '<path fill="#fff" d="M15.5 3.5a8.5 8.5 0 1 0 5 15.3A7 7 0 0 1 15.5 3.5z"/>',
      partly: '<g transform="translate(4 -4) scale(.75)">' + sun + '</g><g transform="translate(-1 2)">' + cloud + "</g>",
      cloud: cloud,
      rain: up(cloud) + '<path d="M8 18.5l-1 3M12 18.5l-1 3M16 18.5l-1 3" stroke="#64d2ff" stroke-width="1.8" stroke-linecap="round"/>',
      snow: up(cloud) + '<g fill="#fff"><circle cx="8" cy="19.5" r="1.2"/><circle cx="12" cy="21" r="1.2"/><circle cx="16" cy="19.5" r="1.2"/></g>',
      storm: up(cloud) + '<path fill="#ffd60a" d="M12.5 15 9 20h2.5l-1 4 4-5.5H12l1.5-3.5z"/>'
    };
    return svg(art[name] || art.sun, null, "wi");
  }

  // ---------- unread messages ----------
  // Conversations the reader has opened count as read: their unread dot/count,
  // the app icon badge and the lock-screen notification disappear.
  // (Remembered until the page is reloaded.)
  var READ = {};

  function unread(kind, i) {
    var t = (D[kind] || [])[i];
    return t && !READ[kind + ":" + i] ? (+t.unread || 0) : 0;
  }

  function unreadTotal(kind) {
    return (D[kind] || []).reduce(function (n, t, i) { return n + unread(kind, i); }, 0);
  }

  function empty(text) { return '<p class="empty">' + esc(text || T("Nothing here.")) + "</p>"; }

  function svg(inner, vb, cls) {
    return '<svg viewBox="' + (vb || "0 0 24 24") + '"' + (cls ? ' class="' + cls + '"' : "") +
      ' aria-hidden="true">' + inner + "</svg>";
  }

  // ============================================================
  //  icons (all drawn here, no image files needed)
  // ============================================================
  var PHONE_PATH = "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z";

  var I = {
    chev: svg('<path d="M10.5 1.5 1.5 10.5l9 9" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>', "0 0 12 21", "chev"),
    chevR: svg('<path d="m1.5 1.5 5 5.5-5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', "0 0 8 14", "chev-r"),
    info: svg('<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor"/>'),
    mag: svg('<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>', null, "mag"),
    plus: svg('<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    compose: svg('<path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="m17.5 3.5 3 3L12 15l-4 1 1-4z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
    phone: svg('<path d="' + PHONE_PATH + '" fill="currentColor"/>'),
    hist: svg('<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 1.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/>'),
    clock: svg('<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M12 7v5.5l3.5 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'),
    person: svg('<circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="12" cy="9.8" r="3.4" fill="#fff"/><path d="M5.6 18.6a7.6 7.6 0 0 1 12.8 0A9.9 9.9 0 0 1 12 22a9.9 9.9 0 0 1-6.4-3.4z" fill="#fff"/>'),
    keypad: svg([5, 12, 19].map(function (y) {
      return [5, 12, 19].map(function (x) { return '<circle cx="' + x + '" cy="' + y + '" r="2.4" fill="currentColor"/>'; }).join("");
    }).join("")),
    vm: svg('<circle cx="6.5" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.5" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M6.5 16h11" stroke="currentColor" stroke-width="2.2"/>'),
    globe: svg('<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z" fill="none" stroke="currentColor" stroke-width="1.6"/>', null, "globe"),
    lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/>'),
    flash: svg('<path d="M6.5 2h11v2.5l-2.5 4.5H9L6.5 4.5z" fill="currentColor"/><path d="M9 10h6v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" fill="currentColor"/><circle cx="12" cy="14" r="1.3" fill="rgba(0,0,0,.45)"/>'),
    cam: svg('<path d="M8.5 5 7 7H4.5A1.5 1.5 0 0 0 3 8.5v9A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 19.5 7H17l-1.5-2z" fill="currentColor"/><circle cx="12" cy="13" r="3.3" fill="rgba(0,0,0,.45)"/>'),
    signal: svg('<rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/>', "0 0 18 12", "sig"),
    wifi: svg('<path d="M8 11.6 5.7 9.2a3.3 3.3 0 0 1 4.6 0z"/><path d="M3.4 6.9a6.5 6.5 0 0 1 9.2 0l-1.5 1.5a4.4 4.4 0 0 0-6.2 0z"/><path d="M1.1 4.6a9.7 9.7 0 0 1 13.8 0l-1.5 1.5a7.6 7.6 0 0 0-10.8 0z"/>', "0 0 16 12", "wifi")
  };

  function battery(level) {
    var lvl = Math.max(0, Math.min(100, level == null ? 80 : +level));
    return svg(
      '<rect x=".5" y=".5" width="24" height="12" rx="3.6" fill="none" stroke="currentColor" opacity=".4"/>' +
      '<rect x="2" y="2" width="' + (21 * lvl / 100).toFixed(1) + '" height="9" rx="2" fill="' + (lvl <= 20 ? "#ff3b30" : "currentColor") + '"/>' +
      '<path d="M26 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="currentColor" opacity=".4"/>', "0 0 28 13", "batt");
  }

  // App icon artwork
  var G = {
    phone: svg('<path d="' + PHONE_PATH + '" fill="#fff"/>'),
    bubble: svg('<path fill="#fff" d="M12 3.5c-5.25 0-9.5 3.4-9.5 7.6 0 2.35 1.33 4.45 3.42 5.85-.2 1.2-.85 2.4-1.9 3.3 2.05.05 3.75-.75 4.85-1.75.99.23 2.04.35 3.13.35 5.25 0 9.5-3.4 9.5-7.75S17.25 3.5 12 3.5z"/>'),
    chat: svg('<path fill="#fff" d="M9.5 4C5.4 4 2 6.7 2 10c0 1.8 1 3.4 2.6 4.5L4 17.5l3.3-1.8c.7.2 1.4.3 2.2.3 4.1 0 7.5-2.7 7.5-6S13.6 4 9.5 4z"/><path fill="#fff" opacity=".75" d="M18.6 9.2c.3.6.4 1.2.4 1.8 0 3.9-3.8 7-8.6 7.3 1.2 1.1 3 1.7 4.9 1.7.6 0 1.1-.1 1.7-.2L20 21l-.5-2.6c1.5-.9 2.5-2.3 2.5-3.9 0-2.3-1.4-4.3-3.4-5.3z"/>'),
    search: svg('<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M15.2 15.2 20 20" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>'),
    notes: svg('<rect width="60" height="17" fill="#ffd43b"/><rect y="17" width="60" height="1.2" fill="#d9ad00"/><path d="M9 30h42M9 39h42M9 48h28" stroke="#d6d6dc" stroke-width="1.8"/>', "0 0 60 60"),
    translate: svg('<text x="2.5" y="13" font-size="11.5" font-weight="700" fill="#fff" font-family="Arial,sans-serif">A</text><text x="10.5" y="21.5" font-size="10.5" font-weight="700" fill="#fff" opacity=".88" font-family="sans-serif">가</text>'),
    photos: svg('<circle cx="16.5" cy="7.5" r="2.5" fill="#fff"/><path d="M2.5 19.5 9 11l4.5 5.5 3-3.5 5 6.5z" fill="#fff"/>'),
    camera: svg('<path fill="#2c2c2e" d="M8.5 5 7 7H4.5A1.5 1.5 0 0 0 3 8.5v9A1.5 1.5 0 0 0 4.5 19h15a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 19.5 7H17l-1.5-2z"/><circle cx="12" cy="13" r="3.6" fill="#d9d9de"/><circle cx="12" cy="13" r="2.2" fill="#2c2c2e"/>'),
    clock: svg('<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M12 7.5V12l3 2" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'),
    moon: svg('<path fill="#ffe08a" d="M14 3a9 9 0 1 0 7 14.5A7.5 7.5 0 0 1 14 3z"/><circle cx="18.5" cy="6" r=".9" fill="#fff"/><circle cx="20.5" cy="10" r=".6" fill="#fff"/>'),
    gear: svg('<circle cx="12" cy="12" r="6.2" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'),
    mail: svg('<rect x="3" y="6" width="18" height="12.5" rx="2.2" fill="#fff"/><path d="M3.8 7.2 12 13.2l8.2-6" fill="none" stroke="#2a8cff" stroke-width="1.6" stroke-linejoin="round"/>'),
    music: svg('<path fill="#fff" d="M17 3.5v11.3a3 3 0 1 1-1.8-2.75V7.3L9.8 8.6v8.2a3 3 0 1 1-1.8-2.75V6.6z"/>'),
    maps: svg('<path fill="#fff" d="M12 3a6 6 0 0 0-6 6c0 4.5 6 11 6 11s6-6.5 6-11a6 6 0 0 0-6-6z"/><circle cx="12" cy="9" r="2.3" fill="#2fb34f"/>'),
    books: svg('<path fill="#fff" d="M3 6.5c2.8-1.3 5.8-1.3 8.2.4v12c-2.4-1.6-5.4-1.6-8.2-.4zM21 6.5c-2.8-1.3-5.8-1.3-8.2.4v12c2.4-1.6 5.4-1.6 8.2-.4z"/>'),
    calendar: function () {
      var d = storyDate();
      var top = LANG === "ko" ? fmt(d, { weekday: "long" }) : fmt(d, { weekday: "short" }).toUpperCase();
      var font = "-apple-system,Inter,'Apple SD Gothic Neo','Noto Sans KR',Arial,sans-serif";
      return svg('<rect width="60" height="19" fill="#ff3b30"/>' +
        '<text x="30" y="13.5" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="' + font + '">' + esc(top) + "</text>" +
        '<text x="30" y="47" text-anchor="middle" font-size="27" font-weight="400" fill="#1c1c1e" font-family="' + font + '">' + d.getDate() + "</text>", "0 0 60 60");
    }
  };

  // ============================================================
  //  apps on the home screen
  // ============================================================
  var APPS = {
    calls: { label: "Phone", view: "calls", bg: "linear-gradient(#5ef07c,#1db73c)", glyph: G.phone,
      badge: function () { return (D.calls || []).filter(function (c) { return c.type === "missed"; }).length; } },
    search: { label: "Search", view: "search", bg: "linear-gradient(#6cb7ff,#1867f2)", glyph: G.search },
    messages: { label: "Messages", view: "messages", bg: "linear-gradient(#7ad7ff,#1d95ee)", glyph: G.bubble,
      badge: function () { return unreadTotal("messages"); } },
    chat: { label: "Chat", view: "chat", bg: "linear-gradient(#ffd75e,#ff9f1c)", glyph: G.chat,
      badge: function () { return unreadTotal("chats"); } },
    notes: { label: "Notes", view: "notes", bg: "#fff", glyph: G.notes, full: true },
    translate: { label: "Translate", view: "translate", bg: "linear-gradient(#6a78ff,#2b30c4)", glyph: G.translate },
    photos: { label: "Photos", view: "photos", bg: "linear-gradient(#ffb36b,#ff5f6d)", glyph: G.photos },
    // decorative apps (tapping shows an alert)
    calendar: { label: "Calendar", view: "calendar", bg: "#fff", glyph: G.calendar, full: true },
    camera: { label: "Camera", deco: true, bg: "linear-gradient(#f0f0f3,#a7a7b0)", glyph: G.camera },
    clock: { label: "Clock", deco: true, bg: "linear-gradient(#ff9a3c,#ff5b3a)", glyph: G.clock },
    weather: { label: "Weather", view: "weather", bg: "linear-gradient(#4aa3ff,#1a6fe0)", glyph: wIcon("partly") },
    settings: { label: "Settings", deco: true, bg: "linear-gradient(#8e9bb3,#566279)", glyph: G.gear },
    mail: { label: "Mail", deco: true, bg: "linear-gradient(#5fc2ff,#1a7cf5)", glyph: G.mail },
    music: { label: "Music", deco: true, bg: "linear-gradient(#ff6b8a,#fa2d48)", glyph: G.music },
    maps: { label: "Maps", deco: true, bg: "linear-gradient(#7be08f,#2fb34f)", glyph: G.maps },
    books: { label: "Books", deco: true, bg: "linear-gradient(#ffb13b,#ff8a00)", glyph: G.books }
  };
  // Home screen: page 1 has the widgets, page 2 has these apps. The dock is on both.
  var GRID = ["calendar", "photos", "camera", "notes", "translate", "clock", "weather", "settings", "mail", "music", "maps", "books"];
  var homePage = 0;
  var DOCK = ["calls", "search", "messages", "chat"];

  function appIcon(id, inDock) {
    var a = APPS[id];
    var glyph = typeof a.glyph === "function" ? a.glyph() : a.glyph;
    var b = a.badge ? a.badge() : 0;
    return '<button class="app" type="button" ' +
      (a.deco ? 'data-deco="' + esc(T(a.label)) + '"' : 'data-open="' + a.view + '"') + ' aria-label="' + esc(T(a.label)) + '">' +
      '<span class="icon" style="background:' + a.bg + '">' +
      (a.full ? '<span class="clip">' + glyph + "</span>" : glyph) +
      (b ? '<span class="badge">' + b + "</span>" : "") + "</span>" +
      (inDock ? "" : '<span class="app-label">' + esc(T(a.label)) + "</span>") + "</button>";
  }

  // ---------- home screen page 1: Weather and Calendar widgets ----------
  function widgetsPage() {
    var w = weather();
    var d = storyDate();
    var events = (D.events || []).slice(0, 3);

    var weatherW = '<button class="widget w-weather wbg-' + w.icon + '" type="button" data-open="weather">' +
      '<span class="ww-top"><span><span class="ww-city">' + esc(w.city) + '</span><span class="ww-temp">' + esc(w.temp) + "°</span></span>" +
      '<span class="ww-right">' + wIcon(w.icon) + '<span>' + esc(w.condition) + "</span><span>" + T("H:") + esc(w.high) + "° " + T("L:") + esc(w.low) + "°</span></span></span>" +
      '<span class="ww-hours">' + w.hourly.slice(0, 6).map(function (h) {
        return '<span class="ww-h"><span>' + esc(h.time) + "</span>" + wIcon(h.icon) + "<b>" + esc(h.temp) + "°</b></span>";
      }).join("") + "</span></button>";

    var calendarW = '<button class="widget w-cal" type="button" data-open="calendar">' +
      '<span class="wc-top"><span class="wc-date"><span class="wc-wd">' + esc(fmt(d, { weekday: "long" })) + '</span><span class="wc-day">' +
      d.getDate() + '</span></span><span class="wc-month"><span class="wc-mname">' + esc(fmt(d, { month: "long" })) + "</span>" + monthGrid(d) + "</span></span>" +
      '<span class="wc-events">' + (events.length ? events.map(function (e) {
        return '<span class="wc-ev" style="--c:' + esc(e.color || "#ff3b30") + '"><b>' + esc(e.title) + "</b><span>" +
          esc([e.date, e.time].filter(Boolean).join(" · ")) + "</span></span>";
      }).join("") : '<span class="wc-none">' + T("No upcoming events") + '</span>') + "</span></button>";

    return '<div class="widgets"><div class="wgt">' + weatherW + '<span class="app-label">' + T("Weather") + '</span></div>' +
      '<div class="wgt grow">' + calendarW + '<span class="app-label">' + T("Calendar") + '</span></div></div>';
  }

  function miniIcon(id) {
    var a = APPS[id];
    return '<span class="n-icon" style="background:' + a.bg + '">' + (a.full ? '<span class="clip">' + a.glyph + "</span>" : a.glyph) + "</span>";
  }

  // ============================================================
  //  lock screen notifications (built from unread messages + missed calls)
  // ============================================================
  var lastNotifs = [];

  function notifications() {
    var out = [];
    [["messages", "messages"], ["chats", "chat"]].forEach(function (pair) {
      (D[pair[0]] || []).forEach(function (t, i) {
        var u = unread(pair[0], i);
        if (!u) return;
        var thread = t.thread || [];
        var them = thread.filter(function (m) { return m.from !== "me"; });
        var last = them[them.length - 1] || thread[thread.length - 1] || {};
        out.push({
          app: pair[1], title: t.name, time: last.time,
          body: (t.group ? last.from + ": " : "") + last.text,
          more: u > 1 ? u - 1 : 0,
          stack: [["home"], [pair[1]], ["thread", pair[0] + ":" + i]]
        });
      });
    });
    (D.calls || []).forEach(function (c) {
      if (c.type !== "missed") return;
      out.push({
        app: "calls", title: T("Missed Call"), time: c.time,
        body: c.name + (c.count > 1 ? " (" + c.count + ")" : ""),
        stack: [["home"], ["calls", "missed"]]
      });
    });
    return out;
  }

  // ============================================================
  //  message bubbles
  // ============================================================
  function bubbles(t, kt) {
    var msgs = t.thread || [];
    // show a centered time when a conversation starts or after a 30+ minute gap
    var stamp = msgs.map(function (m, i) {
      if (i === 0) return true;
      var a = minutes(msgs[i - 1].time), b = minutes(m.time);
      return a !== null && b !== null ? (b - a >= 30 || b < a) : false;
    });
    var html = "";
    msgs.forEach(function (m, i) {
      var me = m.from === "me";
      var next = msgs[i + 1];
      var first = i === 0 || stamp[i] || msgs[i - 1].from !== m.from;
      var last = !next || stamp[i + 1] || next.from !== m.from;
      var name = !me && first && (t.group || kt) ? '<div class="sender">' + esc(m.from) + "</div>" : "";

      if (kt) {
        html += '<div class="kt-row' + (me ? " me" : "") + (first ? " first" : "") + '">' +
          (me ? "" : first ? avatar(m.from, t.group ? null : t.avatar, "sq") : '<span class="avatar-gap"></span>') +
          '<div class="kt-col">' + name + '<div class="kt-line"><div class="bubble">' + esc(m.text) + "</div>" +
          (last ? '<span class="kt-time">' + esc(m.time) + "</span>" : "") + "</div></div></div>";
      } else {
        if (stamp[i]) html += '<div class="t-stamp">' + esc(m.time) + "</div>";
        html += name + '<div class="msg-row' + (me ? " me" : "") + (first ? " first" : "") + (last ? " tail" : "") +
          '"><div class="bubble">' + esc(m.text) + "</div></div>";
      }
    });
    var end = msgs[msgs.length - 1];
    if (!kt && end && end.from === "me") html += '<div class="receipt">' + T("Delivered") + '</div>';
    return '<div class="bubbles">' + html + "</div>";
  }

  function threadRows(list, kind) {
    var kt = kind === "chats";
    if (!list || !list.length) return empty();
    return '<ul class="tlist' + (kt ? " kt" : "") + '">' + list.map(function (t, i) {
      var last = (t.thread && t.thread[t.thread.length - 1]) || {};
      var u = unread(kind, i);
      return '<li><button class="trow' + (u ? " is-unread" : "") + '" type="button" data-go="thread" data-arg="' + kind + ":" + i + '">' +
        (kt ? "" : '<span class="udot' + (u ? " on" : "") + '"></span>') +
        avatar(t.name, t.avatar, kt ? "sq" : "") +
        '<span class="t-main"><span class="t-top"><b>' + esc(t.name) + '</b><span class="t-time">' +
        esc(last.time) + (kt ? "" : I.chevR) + "</span></span>" +
        '<span class="t-prev"><span class="t-prev-txt">' + esc(last.text) + "</span>" +
        (kt && u ? '<span class="kt-badge">' + (u > 300 ? "300+" : u) + "</span>" : "") + "</span></span></button></li>";
    }).join("") + "</ul>";
  }

  function searchField(text, filled) {
    return '<div class="sfield' + (filled ? " filled" : "") + '">' + I.mag + "<span>" + esc(text) + "</span></div>";
  }

  function photoEl(p) {
    if (p.src) return '<img src="' + esc(p.src) + '" alt="' + esc(p.caption) + '">';
    return '<span class="ph" style="background:' + esc(p.color || "#9ca3af") + '"></span>';
  }

  // ============================================================
  //  screens
  //  Each returns: title, html, and optional settings:
  //  large (big title), dark (white status bar), cls, nav:false,
  //  navLeft / navCenter / navRight, foot, short (label for the back button)
  // ============================================================
  var CALL_LABEL = { missed: "Missed", incoming: "Incoming", outgoing: "Outgoing" };

  var VIEWS = {
    lock: function () {
      lastNotifs = notifications();
      return {
        nav: false, dark: true, cls: "lock",
        html: '<div class="lock-top"><span class="lock-ic">' + I.lock + "</span>" +
          '<div class="lock-date">' + esc(owner.date || "") + "</div>" +
          '<div class="lock-clock">' + esc(clock()) + "</div></div>" +
          '<div class="notifs">' + lastNotifs.map(function (n, i) {
            return '<button class="notif' + (n.more ? " stacked" : "") + '" type="button" data-notif="' + i + '">' +
              miniIcon(n.app) + '<span class="n-main"><span class="n-head"><b>' + esc(n.title) + "</b><span>" + esc(n.time) +
              '</span></span><span class="n-body">' + esc(n.body) + "</span>" +
              (n.more ? '<span class="n-more">' + T(n.more === 1 ? "{n} more message" : "{n} more messages", n.more) + "</span>" : "") +
              "</span></button>";
          }).join("") + "</div>" +
          '<div class="lock-bottom"><span class="lock-btn">' + I.flash + '</span><span class="lock-hint">' + T("Swipe up to open") + '</span><span class="lock-btn">' + I.cam + "</span></div>"
      };
    },

    home: function () {
      var pages = [
        widgetsPage(),
        '<div class="home-grid">' + GRID.map(function (id) { return appIcon(id); }).join("") + "</div>"
      ];
      return {
        nav: false, dark: true, cls: "home",
        html: '<div class="hpages hscroll">' + pages.map(function (p) {
            return '<div class="hpage">' + p + "</div>";
          }).join("") + "</div>" +
          '<div class="page-dots">' + pages.map(function (p, i) {
            return '<button type="button" data-page="' + i + '"' + (i === homePage ? ' class="on"' : "") + ' aria-label="Page ' + (i + 1) + '"></button>';
          }).join("") + "</div>" +
          '<div class="dock">' + DOCK.map(function (id) { return appIcon(id, true); }).join("") + "</div>",
        after: function (body, page) {
          var h = page.querySelector(".hpages");
          var dots = page.querySelectorAll(".page-dots button");
          // on small screens, hide calendar events that don't fully fit (instead of cutting them in half)
          var box = page.querySelector(".wc-events");
          if (box) {
            var limit = box.getBoundingClientRect().bottom;
            Array.prototype.forEach.call(box.querySelectorAll(".wc-ev"), function (ev) {
              if (ev.getBoundingClientRect().bottom > limit + 1) ev.style.visibility = "hidden";
            });
          }
          h.scrollLeft = homePage * h.clientWidth;
          h.addEventListener("scroll", function () {
            homePage = Math.round(h.scrollLeft / (h.clientWidth || 1));
            Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle("on", i === homePage); });
          });
        }
      };
    },

    calendar: function () {
      var d = storyDate();
      var groups = [];
      (D.events || []).forEach(function (e) {
        var key = e.date || "";
        var g = groups.filter(function (x) { return x.date === key; })[0];
        if (!g) groups.push(g = { date: key, list: [] });
        g.list.push(e);
      });
      return {
        title: fmt(d, { year: "numeric", month: "long" }), large: true, cls: "cal-app",
        html: '<div class="cal-month">' + monthGrid(d) + "</div>" +
          (groups.length ? groups.map(function (g) {
            return '<div class="section-h">' + esc(g.date) + '</div><ul class="cal-list">' + g.list.map(function (e) {
              return '<li style="--c:' + esc(e.color || "#ff3b30") + '"><span class="cal-bar"></span><span class="cal-main"><b>' +
                esc(e.title) + "</b>" + (e.place ? "<span>" + esc(e.place) + "</span>" : "") + '</span><span class="cal-time">' +
                esc(e.time || "") + "</span></li>";
            }).join("") + "</ul>";
          }).join("") : empty(T("No events.")))
      };
    },

    weather: function () {
      var w = weather();
      var lo = Math.min.apply(null, w.daily.map(function (x) { return x.low; }));
      var hi = Math.max.apply(null, w.daily.map(function (x) { return x.high; }));
      var span = Math.max(1, hi - lo);
      return {
        nav: false, dark: true, cls: "weather-app wbg-" + w.icon,
        html: '<div class="wa-head"><div class="wa-city">' + esc(w.city) + '</div><div class="wa-temp">' + esc(w.temp) + "°</div>" +
          '<div class="wa-cond">' + esc(w.condition) + '</div><div class="wa-hl">' + T("H:") + esc(w.high) + "°  " + T("L:") + esc(w.low) + "°</div></div>" +
          '<div class="wa-card"><h3>' + T("Hourly Forecast") + '</h3><div class="wa-hours">' + w.hourly.map(function (h) {
            return "<div><span>" + esc(h.time) + "</span>" + wIcon(h.icon) + "<b>" + esc(h.temp) + "°</b></div>";
          }).join("") + "</div></div>" +
          '<div class="wa-card"><h3>' + T("{n}-Day Forecast", w.daily.length) + "</h3>" + w.daily.map(function (x) {
            var left = ((x.low - lo) / span * 100).toFixed(0), right = ((hi - x.high) / span * 100).toFixed(0);
            return '<div class="wa-day"><b>' + esc(x.day) + "</b>" + wIcon(x.icon) + '<span class="wa-lo">' + esc(x.low) +
              '°</span><span class="wa-bar"><i style="left:' + left + "%;right:" + right + '%"></i></span><b>' + esc(x.high) + "°</b></div>";
          }).join("") + "</div>"
      };
    },

    calls: function (arg) {
      var missedOnly = arg === "missed";
      var list = (D.calls || []).filter(function (c) { return !missedOnly || c.type === "missed"; });
      var tabs = [["Favorites", I.star], ["Recents", I.clock, 1], ["Contacts", I.person], ["Keypad", I.keypad], ["Voicemail", I.vm]];
      return {
        title: T("Recents"), large: true,
        navCenter: '<div class="seg"><button type="button" data-swap="calls" data-arg=""' + (missedOnly ? "" : ' class="on"') + '>' + T("All") + '</button>' +
          '<button type="button" data-swap="calls" data-arg="missed"' + (missedOnly ? ' class="on"' : "") + ">" + T("Missed") + "</button></div>",
        navRight: '<span class="nav-btn">' + T("Edit") + '</span>',
        html: list.length ? '<ul class="clist">' + list.map(function (c) {
          return '<li class="crow ' + esc(c.type) + '"><span class="call-dir">' + (c.type === "outgoing" ? I.phone : "") + "</span>" +
            '<span class="c-wrap"><span class="c-text"><span class="c-name">' + esc(c.name) + (c.count > 1 ? " (" + c.count + ")" : "") + "</span>" +
            '<span class="c-sub">' + esc(T(CALL_LABEL[c.type] || c.type)) + (c.duration ? " · " + esc(c.duration) : "") + "</span></span>" +
            '<span class="c-time">' + esc(c.time) + '</span><span class="info">' + I.info + "</span></span></li>";
        }).join("") + "</ul>" : empty(T(missedOnly ? "No missed calls." : "No recent calls.")),
        foot: '<nav class="tabbar">' + tabs.map(function (t) {
          return '<span class="tab' + (t[2] ? " on" : "") + '">' + t[1] + "<small>" + T(t[0]) + "</small></span>";
        }).join("") + "</nav>"
      };
    },

    search: function () {
      var list = D.searches || [];
      return {
        title: T("Search"), large: true,
        html: searchField(T("Search or enter website")) +
          (list.length ? '<div class="sec-row"><b>' + T("Recent Searches") + '</b><span>' + T("Clear") + '</span></div><ul class="slist">' + list.map(function (s, i) {
            var q = typeof s === "string" ? s : s.q;
            return '<li><button class="srow" type="button" data-go="results" data-arg="' + i + '"><span class="hist">' + I.hist +
              '</span><span class="q">' + esc(q) + "</span></button></li>";
          }).join("") + "</ul>" : empty(T("No recent searches.")))
      };
    },

    results: function (i) {
      var s = (D.searches || [])[i] || "";
      var q = typeof s === "string" ? s : s.q;
      var res = (typeof s === "object" && s.results) || [];
      return {
        title: "", short: T("Results"),
        html: searchField(q, true) + (res.length ? res.map(function (r) {
          return '<div class="result">' + (r.site ? '<div class="r-site">' + esc(r.site) + "</div>" : "") +
            '<div class="r-title">' + esc(r.title) + '</div><div class="r-snip">' + esc(r.snippet) + "</div></div>";
        }).join("") : empty(T("The page didn't load.")))
      };
    },

    messages: function () {
      return {
        title: T("Messages"), large: true,
        navLeft: '<span class="nav-btn">' + T("Edit") + '</span>',
        navRight: '<span class="nav-btn">' + I.compose + "</span>",
        html: searchField(T("Search")) + threadRows(D.messages, "messages")
      };
    },

    chat: function () {
      return {
        title: "", short: T("Chats"), cls: "kt-list",
        navLeft: '<span class="kt-title">' + T("Chats") + '</span>',
        navRight: '<span class="nav-btn dark">' + I.mag + "</span>",
        html: threadRows(D.chats, "chats")
      };
    },

    thread: function (arg) {
      READ[arg] = true; // opening a conversation marks it as read
      var parts = String(arg).split(":");
      var kind = parts[0];
      var t = (D[kind] || [])[+parts[1]] || { name: "", thread: [] };
      var kt = kind === "chats";
      return {
        title: t.name,
        cls: kt ? "kt-thread" : "imsg",
        navCenter: kt ? null : '<div class="nav-contact">' + avatar(t.name, t.avatar) + '<span class="nc-name">' + esc(t.name) + " " + I.chevR + "</span></div>",
        html: bubbles(t, kt),
        foot: kt
          ? '<div class="composer kt"><span class="c-plus">' + I.plus + '</span><span class="c-field"></span><span class="c-send">#</span></div>'
          : '<div class="composer"><span class="c-plus">' + I.plus + '</span><span class="c-field">' + T("Text Message") + '</span></div>',
        after: function (body) { body.scrollTop = body.scrollHeight; }
      };
    },

    notes: function () {
      var list = D.notes || [];
      return {
        title: T("Notes"), large: true, cls: "grouped notes-app",
        html: searchField(T("Search")) + (list.length ? '<ul class="card">' + list.map(function (n, i) {
          var first = String(n.body || "").split("\n").filter(Boolean)[0] || T("No additional text");
          return '<li><button class="nrow" type="button" data-go="note" data-arg="' + i + '"><b>' + esc(n.title) +
            "</b><span><em>" + esc(n.date) + "</em>" + esc(first) + "</span></button></li>";
        }).join("") + "</ul>" : empty()),
        foot: '<div class="toolbar"><span></span><span class="tb-count">' + T(list.length === 1 ? "{n} Note" : "{n} Notes", list.length) +
          '</span><span class="tb-icon">' + I.compose + "</span></div>"
      };
    },

    note: function (i) {
      var n = (D.notes || [])[i] || {};
      return {
        title: "", cls: "notes-app",
        navRight: '<span class="nav-btn">' + T("Done") + '</span>',
        html: '<div class="note"><div class="note-date">' + esc(n.date) + "</div><h2>" + esc(n.title) +
          '</h2><div class="note-body">' + esc(n.body) + "</div></div>"
      };
    },

    translate: function () {
      var list = D.translations || [];
      var f = list[0] || { from: T("English"), to: T("Korean") };
      return {
        title: T("Translate"), large: true, cls: "grouped",
        html: '<div class="tr-langs"><span class="pill">' + esc(f.from) + '</span><span class="swap">⇄</span><span class="pill">' + esc(f.to) + "</span></div>" +
          '<div class="tr-input">' + T("Enter text") + '</div>' +
          (list.length ? '<div class="section-h">' + T("Recent") + '</div>' + list.map(function (t) {
            return '<div class="card tr-card"><div class="tr-meta">' + esc(t.from) + " → " + esc(t.to) + '</div><div class="tr-in">' +
              esc(t.input) + '</div><div class="tr-out">' + esc(t.output) + "</div></div>";
          }).join("") : "")
      };
    },

    photos: function () {
      var list = D.photos || [];
      return {
        title: T("Photos"), large: true,
        html: list.length ? '<div class="pgrid">' + list.map(function (p, i) {
          return '<button class="tile" type="button" data-go="photo" data-arg="' + i + '">' + photoEl(p) + "</button>";
        }).join("") + '</div><div class="p-count">' + T(list.length === 1 ? "{n} Photo" : "{n} Photos", list.length) + "</div>" : empty()
      };
    },

    // One photo at a time; swipe left/right for the next/previous one, swipe down to close
    photo: function (i) {
      var list = D.photos || [];
      var cur = +i || 0;
      var p = list[cur] || {};
      return {
        title: p.date || T("Photo"), dark: true, cls: "photo-view",
        navCenter: '<div class="nav-2l"><b class="pv-date">' + esc(p.date || "") + '</b><span class="pv-cap">' + esc(p.caption || "") + "</span></div>",
        html: '<div class="pstrip hscroll">' + list.map(function (q) {
          return '<div class="pslide"><div class="pfull">' + photoEl(q) + "</div></div>";
        }).join("") + "</div>",
        after: function (body, page) {
          var s = page.querySelector(".pstrip");
          s.scrollLeft = cur * s.clientWidth;
          s.addEventListener("scroll", function () {
            var k = Math.round(s.scrollLeft / (s.clientWidth || 1));
            if (k === cur || !list[k]) return;
            cur = k;
            page.querySelector(".pv-date").textContent = list[k].date || "";
            page.querySelector(".pv-cap").textContent = list[k].caption || "";
            var top = stack[stack.length - 1];
            if (top && top[0] === "photo") top[1] = k;
          });
        }
      };
    }
  };

  // ============================================================
  //  navigation
  // ============================================================
  var stack = [];
  var screen = $("#screen");
  var display = $("#display");
  var overlay = $("#overlay");
  var justSwiped = false;
  var busy = false;

  function topName() { return stack.length ? stack[stack.length - 1][0] : ""; }

  // The back button shows the previous screen's name.
  // The first screen of an app has no back button, like on iPhone.
  function backLabel(index) {
    if (index < 2) return null;
    var p = stack[index - 1];
    var v = VIEWS[p[0]](p[1]);
    return v.short || v.title || T("Back");
  }

  function currentPage() {
    var pages = screen.querySelectorAll(".page:not(.leaving)");
    return pages[pages.length - 1] || null;
  }

  // Status bar color, and whether the close button shows on phones
  function chrome(page) {
    display.classList.toggle("dark-ui", !!page._v.dark);
    overlay.classList.toggle("at-home", page._name === "home" || page._name === "lock");
  }

  function draw(anim) {
    Array.prototype.forEach.call(screen.querySelectorAll(".page.leaving, .page.under"), function (p) { p.remove(); });
    var old = currentPage();
    var page = build(stack.length - 1, anim);
    chrome(page);

    if (old) {
      if (anim === "push" || anim === "pop") {
        old.classList.add("leaving", "out-" + anim);
        setTimeout(function () { old.remove(); }, 450);
      } else {
        old.remove();
      }
    }
  }

  // Builds the screen for stack[index] and puts it on the phone
  // (underneath `before` if given, otherwise on top)
  function build(index, anim, before) {
    var entry = stack[index];
    var v = VIEWS[entry[0]](entry[1]);

    var nav = "";
    if (v.nav !== false) {
      var back = backLabel(index);
      var left = back !== null
        ? '<button class="nav-back" type="button" data-back>' + I.chev + "<span>" + esc(back) + "</span></button>"
        : (v.navLeft || "");
      nav = '<header class="nav"><div class="nav-left">' + left + '</div><div class="nav-center">' +
        (v.navCenter || '<span class="nav-title">' + esc(v.title || "") + "</span>") +
        '</div><div class="nav-right">' + (v.navRight || "") + "</div></header>";
    }

    var page = document.createElement("div");
    page.className = "page view-" + entry[0] + (v.cls ? " " + v.cls : "") + (v.large ? " has-large" : "") +
      (v.foot ? " has-foot" : "") + (anim ? " in-" + anim : "");
    page.innerHTML = nav + '<div class="app-body">' +
      (v.large ? '<h1 class="large-title">' + esc(v.title) + "</h1>" : "") + v.html + "</div>" + (v.foot || "");
    page._v = v;
    page._name = entry[0];
    screen.insertBefore(page, before || null);

    var body = page.querySelector(".app-body");
    if (v.large) {
      body.addEventListener("scroll", function () { page.classList.toggle("scrolled", body.scrollTop > 30); });
    }
    if (v.after) v.after(body, page);
    return page;
  }

  function go(view, arg) { stack.push([view, arg]); draw("push"); }

  function back() {
    stack.pop();
    if (!stack.length) return closePhone();
    draw(topName() === "home" ? "home" : "pop");
  }

  function goHome() {
    if (topName() === "lock") return unlock();
    if (topName() === "home") return;
    stack = [["home"]];
    draw("home");
  }

  function unlock(notifIndex) {
    var n = notifIndex != null ? lastNotifs[notifIndex] : null;
    stack = n ? n.stack.slice() : [["home"]];
    draw(n ? "open" : "unlock");
  }

  function alertBox(title, msg) {
    var w = document.createElement("div");
    w.className = "alert-wrap";
    w.innerHTML = '<div class="alert" role="alertdialog"><b>' + esc(title) + "</b><p>" + esc(msg) + '</p><button type="button">' + T("OK") + '</button></div>';
    w.querySelector("button").addEventListener("click", function () { w.remove(); });
    display.appendChild(w);
  }

  function openPhone() {
    homePage = 0;
    stack = owner.lockScreen === false ? [["home"]] : [["lock"]];
    draw("");
    overlay.hidden = false;
    document.body.classList.add("locked");
    if (location.hash !== "#phone") history.replaceState(null, "", "#phone");
  }

  function closePhone() {
    overlay.hidden = true;
    document.body.classList.remove("locked");
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ============================================================
  //  story page
  // ============================================================
  function renderStory() {
    var s = D.story || {};
    $("#story-title").textContent = s.title || "";
    document.title = s.title || document.title;
    $("#story-body").innerHTML = (s.paragraphs || []).map(function (p) {
      return "<p>" + esc(p).replace(/\[\[(.+?)\]\]/g, '<button class="phone-link" type="button">$1</button>') + "</p>";
    }).join("");
    renderLangPicker();
  }

  // Language picker under the story (hide it with  languagePicker: false  in data.js)
  var langBox = document.createElement("div");
  langBox.className = "lang";
  $("#story-body").parentNode.insertBefore(langBox, $("#story-body").nextSibling);

  function renderLangPicker() {
    if (RAW.languagePicker === false) { langBox.hidden = true; return; }
    langBox.innerHTML = '<span class="lang-label">' + I.globe + esc(T("Language")) + "</span>" +
      '<span class="lang-seg" role="group" aria-label="' + esc(T("Language")) + '">' +
      [["en", "English"], ["ko", "한국어"]].map(function (l) {
        return '<button type="button" data-lang="' + l[0] + '" lang="' + l[0] + '" aria-pressed="' + (LANG === l[0]) + '"' +
          (LANG === l[0] ? ' class="on"' : "") + ">" + l[1] + "</button>";
      }).join("") + "</span>";
  }

  langBox.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]");
    if (!b || b.getAttribute("data-lang") === LANG) return;
    setLang(b.getAttribute("data-lang"));
    try { localStorage.setItem("phonePeekLang", LANG); } catch (err) { /* storage blocked */ }
    renderStory();
    if (!overlay.hidden) draw("");
  });

  // ============================================================
  //  events
  // ============================================================
  $("#story-body").addEventListener("click", function (e) {
    if (e.target.closest(".phone-link")) openPhone();
  });

  screen.addEventListener("click", function (e) {
    if (justSwiped || busy) { justSwiped = false; return; }
    var t = e.target, el;

    if (topName() === "lock") {
      el = t.closest("[data-notif]");
      return unlock(el ? +el.getAttribute("data-notif") : null);
    }
    if (t.closest("[data-back]")) return back();
    if ((el = t.closest("[data-page]"))) {
      var h = currentPage().querySelector(".hpages");
      if (h) h.scrollTo({ left: +el.getAttribute("data-page") * h.clientWidth, behavior: "smooth" });
      return;
    }
    if ((el = t.closest("[data-open]"))) {
      stack = [["home"], [el.getAttribute("data-open")]];
      return draw("open");
    }
    if ((el = t.closest("[data-deco]"))) {
      return alertBox(T("Can't Open {n}", el.getAttribute("data-deco")), T("This app isn't part of the story."));
    }
    if ((el = t.closest("[data-swap]"))) {
      stack[stack.length - 1] = [el.getAttribute("data-swap"), el.getAttribute("data-arg")];
      return draw("");
    }
    if ((el = t.closest("[data-go]"))) go(el.getAttribute("data-go"), el.getAttribute("data-arg"));
  });

  // ============================================================
  //  swipe gestures (finger or mouse)
  //  - swipe right inside an app ........ go back (the screen follows your finger)
  //  - swipe left/right on home screen .. next / previous page
  //  - swipe left/right on a photo ...... next / previous photo
  //  - swipe down on a photo ............ close it
  //  - swipe up on the lock screen ...... unlock
  //  - swipe up on the bar at the bottom  go home
  // ============================================================
  var g = null;

  function suppressClick() {
    justSwiped = true;
    setTimeout(function () { justSwiped = false; }, 350);
  }

  function capture(id) {
    try { screen.setPointerCapture(id); } catch (err) { /* ignore */ }
  }

  screen.addEventListener("pointerdown", function (e) {
    if (busy || e.button > 0 || display.querySelector(".alert-wrap")) return;
    var n = e.target.closest(".notifs");
    g = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), mode: null,
      mouse: e.pointerType === "mouse", h: e.target.closest(".hscroll"),
      // a long list of lock-screen notifications scrolls instead of unlocking
      notifs: n && n.scrollHeight > n.clientHeight + 2 ? n : null,
      lx: e.clientX, lt: Date.now(), vx: 0 };
  });

  screen.addEventListener("pointermove", function (e) {
    if (!g || e.pointerId !== g.id) return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;

    // how fast the finger is moving right now (pixels per millisecond)
    var now = Date.now();
    if (now > g.lt) g.vx = 0.6 * (e.clientX - g.lx) / (now - g.lt) + 0.4 * g.vx;
    g.lx = e.clientX;
    g.lt = now;

    if (g.mode === "hdrag") { g.h.scrollLeft = g.left - dx; return; }
    if (g.mode === "back") { moveBack(dx); return; }
    if (g.mode === "nscroll") { g.notifs.scrollTop = g.top - dy; return; }
    if (g.mode) return;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;

    var horizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (!horizontal && g.notifs && topName() === "lock") {
      g.mode = "nscroll";
      g.top = g.notifs.scrollTop + dy;
      capture(e.pointerId);
    } else if (horizontal && g.h && g.mouse) {
      // Mouse drag on the home pages or photos (on touch screens these scroll by themselves)
      g.mode = "hdrag";
      g.from = Math.round(g.h.scrollLeft / (g.h.clientWidth || 1));
      g.left = g.h.scrollLeft + dx;
      g.h.classList.add("dragging");
      capture(e.pointerId);
    } else if (horizontal && dx > 0 && !g.h && stack.length >= 3) {
      startBack(e);
      moveBack(dx);
    } else {
      g.mode = "other";
    }
  });

  function endGesture(e, cancelled) {
    if (!g || e.pointerId !== g.id) return;
    var s = g;
    g = null;
    var dx = e.clientX - s.x, dy = e.clientY - s.y;
    var speed = Date.now() - s.lt > 80 ? 0 : s.vx; // finger paused before lifting = no flick
    if (s.mode === "nscroll") { suppressClick(); return; }
    if (s.mode === "hdrag") { suppressClick(); return endHDrag(s, dx, speed); }
    if (s.mode === "back") { suppressClick(); return endBack(s, dx, speed, cancelled); }
    if (cancelled) return;
    if (topName() === "lock" && dy < -50) { suppressClick(); return unlock(); }
    if (topName() === "photo" && dy > 90 && dy > Math.abs(dx) * 1.5) { suppressClick(); return back(); }
  }
  screen.addEventListener("pointerup", function (e) { endGesture(e, false); });
  screen.addEventListener("pointercancel", function (e) { endGesture(e, true); });

  // Snap a mouse-dragged row to the nearest page
  function endHDrag(s, dx, speed) {
    var h = s.h, w = h.clientWidth || 1;
    var n = Math.max(1, Math.round(h.scrollWidth / w));
    var k = s.from;
    if (dx < -w * 0.2 || speed < -0.35) k++;
    else if (dx > w * 0.2 || speed > 0.35) k--;
    k = Math.max(0, Math.min(n - 1, k));
    h.scrollTo({ left: k * w, behavior: "smooth" });
    setTimeout(function () { h.classList.remove("dragging"); }, 450);
  }

  // Swipe back: the previous screen is built underneath and slides in as you drag
  function startBack(e) {
    var cur = currentPage();
    if (!cur) { g.mode = "other"; return; }
    g.mode = "back";
    g.cur = cur;
    g.w = screen.clientWidth;
    g.under = build(stack.length - 2, "", cur);
    g.under.classList.add("under");
    cur.classList.add("swiping");
    capture(e.pointerId);
  }

  function moveBack(dx) {
    var d = Math.max(0, Math.min(g.w, dx));
    g.cur.style.transform = "translateX(" + d + "px)";
    g.under.style.transform = "translateX(" + (-0.3 * (g.w - d)) + "px)";
  }

  function endBack(s, dx, speed, cancelled) {
    var cur = s.cur, under = s.under, w = s.w;
    // go back if dragged past the middle, or flicked quickly to the right
    var commit = !cancelled && (dx > w * 0.45 || (speed > 0.35 && dx > 30));
    busy = true;
    cur.style.transition = under.style.transition = "transform .3s cubic-bezier(.2,.85,.25,1)";
    cur.style.transform = "translateX(" + (commit ? w : 0) + "px)";
    under.style.transform = "translateX(" + (commit ? 0 : -0.3 * w) + "px)";
    setTimeout(function () {
      busy = false;
      if (commit) {
        cur.remove();
        under.classList.remove("under");
        under.style.transition = under.style.transform = "";
        stack.pop();
        chrome(under);
      } else {
        under.remove();
        cur.classList.remove("swiping");
        cur.style.transition = cur.style.transform = "";
      }
    }, 310);
  }

  // Swipe up on the bar at the bottom to go home (tapping it works too)
  var barY = null;
  $("#homebar").addEventListener("pointerdown", function (e) { barY = e.clientY; });
  window.addEventListener("pointerup", function (e) {
    if (barY !== null && e.clientY - barY < -25 && !overlay.hidden && !busy) goHome();
    barY = null;
  });
  $("#homebar").addEventListener("click", function () { if (!busy) goHome(); });

  // Stop the browser from dragging images around instead of swiping
  display.addEventListener("dragstart", function (e) { e.preventDefault(); });

  $("#close").addEventListener("click", closePhone);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closePhone(); });
  document.addEventListener("keydown", function (e) {
    if (overlay.hidden || busy) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      var page = currentPage();
      var h = page && page.querySelector(".hscroll");
      if (h) h.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * h.clientWidth, behavior: "smooth" });
      return;
    }
    if (e.key !== "Escape") return;
    if (document.querySelector(".alert-wrap")) return document.querySelector(".alert-wrap").remove();
    if (topName() === "lock") return closePhone();
    back();
  });

  // ============================================================
  //  start
  // ============================================================
  $("#status").innerHTML = '<span class="sb-time">' + esc(clock()) + '</span><span class="island"></span>' +
    '<span class="sb-right">' + I.signal + I.wifi + battery(owner.battery) + "</span>";
  if (owner.wallpaper) display.style.backgroundImage = 'url("' + String(owner.wallpaper).replace(/"/g, "%22") + '")';
  renderStory();
  if (location.hash === "#phone") openPhone();
})();
