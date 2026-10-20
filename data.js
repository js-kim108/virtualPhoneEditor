// ============================================================
//  Edit this file to change everything on the page.
//  Put any [[text]] inside a story paragraph to make a link
//  that opens the phone. Images go in the img/ folder and are
//  written as "img/filename.jpg". Leave src empty for a
//  colored placeholder.
//
//  LANGUAGES: readers can switch between English and 한국어
//  under the story. Any text can be written in both languages:
//      title: { en: "The Last Train", ko: "막차" }
//  Text written only once shows the same in both languages.
//  (The phone's own buttons and labels switch automatically.)
// ============================================================

window.PHONE_DATA = {
  // language: "ko",         // which language to start in (optional)
  // languagePicker: false,  // hide the language picker under the story

  story: {
    title: { en: "Missing", ko: "실종" },
    paragraphs: {
      en: [
        "This must be [[Yoo Sung Woon's Phone]]."
      ],
      ko: [
        "이건 [[유성운씨의 폰]]이다."
      ]
    }
  },

  owner: {
    name: "Seo-yeon",
    time: "23:47",            // leave "" to show the real time
    date: { en: "Friday, October 16", ko: "10월 16일 금요일" },
    battery: 23,
    wallpaper: "",            // e.g. "img/wallpaper.jpg"
    lockScreen: true          // false = skip the lock screen and open on the home screen
  },

  // Weather widget. Everything is optional; leave out what you don't need.
  // icon: "sun", "moon", "partly", "cloud", "rain", "snow" or "storm"
  weather: {
    city: { en: "Seoul", ko: "서울" },
    temp: 11,
    icon: "moon",
    // condition: "Clear",   // leave this out to use the automatic name for the icon (in both languages)
    high: 17,
    low: 8
    // hourly: [ { time: "Now", icon: "moon", temp: 11 }, { time: "0", icon: "cloud", temp: 10 } ],
    // daily:  [ { day: "Today", icon: "sun", low: 8, high: 17 } ]
  },

  // Calendar widget and Calendar app (the first 3 show on the home screen)
  // color is optional, e.g. "#ff3b30" red, "#34c759" green, "#007aff" blue
  events: [
    { date: "Today", time: "23:55", title: "Last train to Busan", place: "Seoul Station", color: "#ff3b30" },
    { date: "Sun, Oct 18", time: "All day", title: "Sign the lease", color: "#007aff" },
    { date: "Mon, Oct 19", time: "09:00", title: "Movers arrive", place: "Busan", color: "#34c759" }
  ],

  // type: "missed" | "incoming" | "outgoing"
  calls: [
    { name: "Mom", type: "missed", time: "23:02", count: 2 },
    { name: "Jun", type: "outgoing", time: "21:15", duration: "0:04" },
    { name: "Unknown", type: "incoming", time: "18:40", duration: "12:31" },
    { name: "Hana", type: "incoming", time: "Yesterday", duration: "3:02" },
    { name: "Jun", type: "missed", time: "Yesterday" }
  ],

  // A search can be plain text, or { q, results: [{ title, snippet }] }
  searches: [
    {
      q: "how to tell someone you're moving away",
      results: [
        { title: "Saying goodbye without burning bridges", snippet: "Tell them in person if you can, and early…" },
        { title: "Is it better to just leave?", snippet: "Forum thread · 214 replies" }
      ]
    },
    "last train to Busan time",
    "Busan studio apartment rent",
    "does he like me quiz",
    "1-way ticket Seoul to Busan"
  ],

  // unread: number shown on the app icon badge
  messages: [
    {
      name: "Mom", unread: 2,
      thread: [
        { from: "them", text: "Did you tell him yet?", time: "22:58" },
        { from: "me", text: "Not yet", time: "23:00" },
        { from: "them", text: "The movers come Monday.", time: "23:01" },
        { from: "them", text: "Call me back", time: "23:02" }
      ]
    },
    {
      name: "Unknown",
      thread: [
        { from: "them", text: "This is Mr. Park from the leasing office. The Busan apartment is yours if you sign by Sunday.", time: "18:52" },
        { from: "me", text: "Thank you. I'll sign tomorrow.", time: "19:10" }
      ]
    }
  ],

  // group: true shows each sender's name
  chats: [
    {
      name: "Jun", unread: 1,
      thread: [
        { from: "Jun", text: "coffee tonight? same place", time: "17:20" },
        { from: "me", text: "ok. I have something to tell you", time: "17:31" },
        { from: "Jun", text: "good news or bad news 😅", time: "17:32" },
        { from: "me", text: "both I think", time: "17:40" }
      ]
    },
    {
      name: "Book club 📚", group: true,
      thread: [
        { from: "Hana", text: "Seo-yeon is it true you're leaving??", time: "12:03" },
        { from: "Minho", text: "wait what", time: "12:04" },
        { from: "me", text: "don't tell Jun. I want to tell him myself", time: "12:10" },
        { from: "Hana", text: "🤐", time: "12:11" }
      ]
    }
  ],

  notes: [
    {
      title: "Things to say tonight",
      date: "Today 16:05",
      body: "1. Thank him first.\n2. Don't cry before the coffee arrives.\n3. Busan isn't that far. (Is it?)\n4. Ask him to visit.\n\nDon't say: \"it's not you.\""
    },
    {
      title: "Packing list",
      date: "Wed 21:30",
      body: "- books (donate half)\n- winter coat\n- the mug he gave me\n- chargers"
    }
  ],

  // Shown newest first, in the order written here
  translations: [
    { from: "English", to: "Korean", input: "I'll miss you.", output: "보고 싶을 거야." },
    { from: "Korean", to: "English", input: "가지 마", output: "Don't go" }
  ],

  // color is used when there's no image
  photos: [
    { src: "", caption: "Our café, first visit", date: "March 3", color: "#c08457" },
    { src: "", caption: "Han river at night", date: "June 21", color: "#1e3a8a" },
    { src: "", caption: "Jun asleep on the train 🤫", date: "August 9", color: "#6b7280" },
    { src: "", caption: "Busan apartment viewing", date: "October 2", color: "#0ea5e9" },
    { src: "", caption: "Moving boxes", date: "October 14", color: "#a16207" }
  ]
};
