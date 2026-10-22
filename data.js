// ============================================================
//  Edit this file to change everything on the page.
//  Put any [[text]] inside a story paragraph to make a link
//  that opens the phone. Images go in the img/ folder and are
//  written as "img/filename.jpg". Leave src empty for a
//  colored placeholder.
//
//  LANGUAGES: readers switch between English and 한국어 under
//  the story. Every text below is written as a pair:
//      text: { en: "Not yet", ko: "아직요" }
//  Edit either side; the reader sees the one for their language.
//  Text written only once (like "00:47" or "🌷") shows the same
//  in both. The phone's own buttons and labels switch by themselves.
// ============================================================

// ------------------------------------------------------------
//  PEOPLE: each name is written once here, in both languages,
//  and used everywhere below (Recents, Contacts, Messages, Chat)
//  so the names always match. To rename someone, change it here.
//  To add a new person, add a line here and use that word
//  (like MOM) below instead of typing the name in quotes.
// ------------------------------------------------------------
var OWNER   = { en: "Yoo Sung Woon", ko: "유성운" };
var MOM     = { en: "Mom",           ko: "엄마" };
var JUN     = { en: "Jun",           ko: "준" };
var HANA    = { en: "Hana",          ko: "하나" };
var MINHO   = { en: "Minho",         ko: "민호" };
var UNKNOWN = { en: "Unknown",       ko: "알 수 없음" };

window.PHONE_DATA = {
  // language: "ko",         // which language to start in (optional)
  // languagePicker: false,  // hide the language picker under the story
  // appNames: { chat: { en: "Talk", ko: "톡" } },   // rename apps on the home screen (chat, messages, calls, notes, photos…)

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
    name: OWNER,
    time: "00:47",            // leave "" to show the real time
    date: { en: "Friday, October 13", ko: "10월 13일 금요일" },
    battery: 23,
    wallpaper: "",            // e.g. "img/wallpaper.jpg"
    lockScreen: true,         // false = skip the lock screen and open on the home screen
    status: { en: "Be right back", ko: "잠깐 다녀올게" }   // status message on their Chat profile
    // photo: "img/me.jpg",   // profile picture
    // cover: "img/sky.jpg"   // Chat profile background (a picture, or a color like "#334455")
  },

  // Weather widget. Everything is optional; leave out what you don't need.
  // icon: "sun", "moon", "partly", "cloud", "rain", "snow" or "storm"
  weather: {
    city: { en: "Seoul", ko: "서울" },
    temp: 11,
    icon: "moon",
    // condition: { en: "Clear", ko: "맑음" },   // leave this out to use the automatic name for the icon
    high: 17,
    low: 8
    // hourly: [ { time: { en: "Now", ko: "지금" }, icon: "moon", temp: 11 }, { time: "1", icon: "cloud", temp: 10 } ],
    // daily:  [ { day: { en: "Today", ko: "오늘" }, icon: "sun", low: 8, high: 17 } ]
  },

  // Calendar widget and Calendar app (the first 3 show on the home screen)
  // color is optional, e.g. "#ff3b30" red, "#34c759" green, "#007aff" blue
  events: [
    {
      date:  { en: "Today", ko: "오늘" },
      time:  "23:55",
      title: { en: "Last train to Busan", ko: "부산행 막차" },
      place: { en: "Seoul Station", ko: "서울역" },
      color: "#ff3b30"
    },
    {
      date:  { en: "Sun, Oct 18", ko: "10월 18일 (일)" },
      time:  { en: "All day", ko: "하루 종일" },
      title: { en: "Sign the lease", ko: "임대 계약서 서명" },
      color: "#007aff"
    },
    {
      date:  { en: "Mon, Oct 19", ko: "10월 19일 (월)" },
      time:  "09:00",
      title: { en: "Movers arrive", ko: "이삿짐센터 도착" },
      place: { en: "Busan", ko: "부산" },
      color: "#34c759"
    }
  ],

  // type: "missed" | "incoming" | "outgoing"
  calls: [
    { name: MOM, type: "missed", time: "23:02", count: 2 },
    { name: JUN, type: "outgoing", time: "21:15", duration: "0:04" },
    { name: UNKNOWN, type: "incoming", time: "18:40", duration: "12:31" },
    { name: HANA, type: "incoming", time: { en: "Yesterday", ko: "어제" }, duration: "3:02" },
    { name: JUN, type: "missed", time: { en: "Yesterday", ko: "어제" } }
  ],

  // Contacts: readers can call or text these people
  // (Phone app → Contacts, or tap a name in Recents / a conversation).
  // Without this list, everyone in calls, messages and chats becomes a contact.
  //
  //   phone: "010-..."                        shown on their contact card
  //   call: { answer: true, lines: [...] }    they pick up and say these lines
  //   call: { message: "..." }                a recorded message plays instead
  //   (no call)                               it rings, then "No Answer"
  //   replies: [...]                          their replies when the reader texts them, in order
  //   delivered: false                        texts to them fail ("Not Delivered")
  //   note: "..."                             a note on their contact card
  //   photo: "img/mom.jpg"                    their picture
  //
  //   For the Chat app's Friends tab and profiles:
  //   status: "..."                           their status message
  //   cover: "img/beach.jpg" or "#556677"     their profile background
  //   friend: false                           leave them out of the Friends tab
  contacts: [
    {
      name: MOM, phone: "010-2847-1193", status: "🌷",
      replies: {
        en: ["Where are you?", "Pick up your phone. Now."],
        ko: ["어디야?", "전화 좀 받아. 지금 당장."]
      }
    },
    {
      name: JUN, phone: "010-5520-7781", status: { en: "coffee first", ko: "커피 먼저" },
      call: {
        answer: true,
        lines: {
          en: ["Hello?", "...Hello? Who is this?", "Why aren't you saying anything?"],
          ko: ["여보세요?", "...여보세요? 누구세요?", "왜 아무 말도 안 하세요?"]
        }
      },
      replies: { en: ["who is this?"], ko: ["누구세요?"] }
    },
    {
      name: HANA, phone: "010-3391-0456", status: "📚",
      call: { message: { en: "The number you have dialed is not available. Please try again later.",
                         ko: "지금 거신 전화는 전원이 꺼져 있어 음성사서함으로 연결됩니다." } },
      note: { en: "Book club", ko: "북클럽" }
    },
    {
      name: UNKNOWN, phone: "02-555-0132",
      delivered: false, friend: false
    }
  ],

  // Search history. A search can be just the words, or { q, results: [{ title, snippet }] }
  searches: [
    {
      q: { en: "how to tell someone you're moving away", ko: "이사 간다고 말하는 법" },
      results: [
        {
          title:   { en: "Saying goodbye without burning bridges", ko: "관계를 망치지 않고 작별하는 법" },
          snippet: { en: "Tell them in person if you can, and early…", ko: "가능하면 직접, 그리고 일찍 말하세요…" }
        },
        {
          title:   { en: "Is it better to just leave?", ko: "그냥 떠나는 게 나을까요?" },
          snippet: { en: "Forum thread · 214 replies", ko: "커뮤니티 글 · 댓글 214개" }
        }
      ]
    },
    { en: "last train to Busan time",    ko: "부산행 막차 시간" },
    { en: "Busan studio apartment rent", ko: "부산 원룸 월세" },
    { en: "does he like me quiz",        ko: "그 사람도 나를 좋아할까 테스트" },
    { en: "1-way ticket Seoul to Busan", ko: "서울 부산 편도 기차표" }
  ],

  // Messages app. unread: number shown on the app icon badge
  messages: [
    {
      name: MOM, unread: 2,
      thread: [
        { from: "them", time: "22:58", text: { en: "Did you tell him yet?", ko: "그 사람한테 말했니?" } },
        { from: "me",   time: "23:00", text: { en: "Not yet", ko: "아직요" } },
        { from: "them", time: "23:01", text: { en: "The movers come Monday.", ko: "이삿짐센터 월요일에 온다." } },
        { from: "them", time: "23:02", text: { en: "Call me back", ko: "전화 좀 해." } }
      ]
    },
    {
      name: UNKNOWN,
      thread: [
        { from: "them", time: "18:52", text: {
            en: "This is Mr. Park from the leasing office. The Busan apartment is yours if you sign by Sunday.",
            ko: "부동산 박 실장입니다. 일요일까지 계약하시면 부산 집은 고객님 걸로 해 드릴게요." } },
        { from: "me",   time: "19:10", text: { en: "Thank you. I'll sign tomorrow.", ko: "감사합니다. 내일 계약할게요." } }
      ]
    }
  ],

  // Chat app (messenger)
  //   group: true                      a group chat (shows member count and each sender's name)
  //   members: [HANA, MINHO]           who's in a group (otherwise: everyone who wrote in it)
  //   { date: "..." }                  a date divider
  //   read: false                      on one of "me"'s messages: shows "1" (not read yet)
  //   image: "img/photo.jpg"           a photo message (or a color like "#8899aa" as a stand-in)
  //   replies: [...]                   replies when the reader types in this chat
  chats: [
    {
      name: JUN, unread: 1,
      thread: [
        { date: { en: "Thursday, October 12", ko: "10월 12일 목요일" } },
        { from: JUN,  time: "17:20", text: { en: "coffee tonight? same place", ko: "오늘 밤 커피? 늘 가던 데" } },
        { from: "me", time: "17:31", text: { en: "ok. I have something to tell you", ko: "응. 할 말 있어" } },
        { from: JUN,  time: "17:32", text: { en: "good news or bad news 😅", ko: "좋은 소식이야 나쁜 소식이야 😅" } },
        { from: "me", time: "17:40", text: { en: "both I think", ko: "둘 다인 것 같아" }, read: false }
      ]
    },
    {
      name: { en: "Book club 📚", ko: "북클럽 📚" }, group: true,
      thread: [
        { date: { en: "Thursday, October 12", ko: "10월 12일 목요일" } },
        { from: HANA,  time: "12:03", text: { en: "Seo-yeon is it true you're leaving??", ko: "서연아 너 떠난다는 거 진짜야??" } },
        { from: MINHO, time: "12:04", text: { en: "wait what", ko: "잠깐 뭐야" } },
        { from: "me",  time: "12:10", text: { en: "don't tell Jun. I want to tell him myself", ko: "준한테는 말하지 마. 내가 직접 말할래" } },
        { from: HANA,  time: "12:11", text: "🤐" }
      ]
    }
  ],

  notes: [
    {
      title: { en: "Things to say tonight", ko: "오늘 밤 할 말" },
      date:  { en: "Today 16:05", ko: "오늘 16:05" },
      body: {
        en: "1. Thank him first.\n2. Don't cry before the coffee arrives.\n3. Busan isn't that far. (Is it?)\n4. Ask him to visit.\n\nDon't say: \"it's not you.\"",
        ko: "1. 먼저 고맙다고 하기.\n2. 커피 나오기 전에 울지 않기.\n3. 부산 그렇게 안 멀어. (그렇지?)\n4. 놀러 오라고 하기.\n\n하지 말 것: \"너 때문이 아니야.\""
      }
    },
    {
      title: { en: "Packing list", ko: "짐 목록" },
      date:  { en: "Wed 21:30", ko: "수 21:30" },
      body: {
        en: "- books (donate half)\n- winter coat\n- the mug he gave me\n- chargers",
        ko: "- 책 (반은 기부)\n- 겨울 코트\n- 그 사람이 준 머그컵\n- 충전기"
      }
    }
  ],

  // Translate app history, newest first
  translations: [
    { from: { en: "English", ko: "영어" }, to: { en: "Korean", ko: "한국어" }, input: "I'll miss you.", output: "보고 싶을 거야." },
    { from: { en: "Korean", ko: "한국어" }, to: { en: "English", ko: "영어" }, input: "가지 마", output: "Don't go" }
  ],

  // Photos. color is used when there's no image
  photos: [
    { src: "", color: "#c08457", date: { en: "March 3", ko: "3월 3일" },     caption: { en: "Our café, first visit", ko: "우리 카페, 처음 간 날" } },
    { src: "", color: "#1e3a8a", date: { en: "June 21", ko: "6월 21일" },    caption: { en: "Han river at night", ko: "밤의 한강" } },
    { src: "", color: "#6b7280", date: { en: "August 9", ko: "8월 9일" },    caption: { en: "Jun asleep on the train 🤫", ko: "기차에서 잠든 준 🤫" } },
    { src: "", color: "#0ea5e9", date: { en: "October 2", ko: "10월 2일" },  caption: { en: "Busan apartment viewing", ko: "부산 집 보러 간 날" } },
    { src: "", color: "#a16207", date: { en: "October 14", ko: "10월 14일" }, caption: { en: "Moving boxes", ko: "이삿짐 상자" } }
  ]
};
