/* =========================================================
   QUYOSHBOY JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  // 10 000 EXP = 1 000 000 so'm
  rewardExpBase: 10000,
  rewardMoneyBase: 1000000,

  // Bir testda 10 ta savol
  questionsPerTest: 10,

  // Kuniga 2 marta
  maxAttemptsPerDay: 2,

  // Birinchi urinishda savol uchun EXP
  expPerCorrect: 10,

  // Kitob narxi
  bookPrice: 5000
};


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE = {
  profile: "quyoshboy_profile",
  exp: "quyoshboy_exp",
  tests: "quyoshboy_tests",
  rewards: "quyoshboy_rewards",
  daily: "quyoshboy_daily",
  unlockedBooks: "quyoshboy_unlocked_books"
};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];


/* =========================================================
   BASIC FUNCTIONS
========================================================= */

function getNumber(key) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}

function setNumber(key, value) {
  localStorage.setItem(key, String(value));
}

function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);

    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}


/* =========================================================
   PROFILE
========================================================= */

function getProfile() {
  return getJSON(STORAGE.profile, null);
}

function saveProfile(profile) {
  setJSON(STORAGE.profile, profile);
}

function clearProfile() {
  localStorage.removeItem(STORAGE.profile);
}


/* =========================================================
   EXP
========================================================= */

function getExp() {
  return getNumber(STORAGE.exp);
}

function setExp(value) {
  setNumber(STORAGE.exp, Math.max(0, Math.floor(value)));
}

function addExp(amount) {
  const current = getExp();

  setExp(current + amount);

  updateAllUI();

  if (amount > 0) {
    showToast(`+${formatNumber(amount)} EXP qo‘shildi ☀️`);
  }
}


/* =========================================================
   TEST COUNT
========================================================= */

function getTestCount() {
  return getNumber(STORAGE.tests);
}

function addTest() {
  setNumber(
    STORAGE.tests,
    getTestCount() + 1
  );
}


/* =========================================================
   REWARD COUNT
========================================================= */

function getRewardCount() {
  return getNumber(STORAGE.rewards);
}

function addRewardCount() {
  setNumber(
    STORAGE.rewards,
    getRewardCount() + 1
  );
}


/* =========================================================
   TIER SYSTEM
========================================================= */

function getTier(exp) {

  if (exp > 1000000) {
    return {
      name: "Master",
      className: "tier-master",
      start: 1000001,
      next: Infinity
    };
  }

  if (exp >= 1000000) {
    return {
      name: "Diamond",
      className: "tier-diamond",
      start: 1000000,
      next: Infinity
    };
  }

  if (exp >= 100000) {
    return {
      name: "Gold",
      className: "tier-gold",
      start: 100000,
      next: 1000000
    };
  }

  if (exp >= 10000) {
    return {
      name: "Silver",
      className: "tier-silver",
      start: 10000,
      next: 100000
    };
  }

  if (exp >= 1000) {
    return {
      name: "Bronze",
      className: "tier-bronze",
      start: 1000,
      next: 10000
    };
  }

  return {
    name: "Boshlovchi",
    className: "tier-starter",
    start: 0,
    next: 1000
  };
}


function getLevel(exp) {
  return Math.floor(exp / 100) + 1;
}


function getProgress(exp) {

  const tier = getTier(exp);

  if (!Number.isFinite(tier.next)) {
    return {
      percent: 100,
      remaining: 0
    };
  }

  const range = tier.next - tier.start;

  const current = exp - tier.start;

  const percent =
    Math.max(
      0,
      Math.min(
        100,
        Math.round((current / range) * 100)
      )
    );

  return {
    percent,
    remaining: Math.max(0, tier.next - exp)
  };
}


/* =========================================================
   EXP UI
========================================================= */

function updateExpUI() {

  const exp = getExp();

  const tier = getTier(exp);

  const progress = getProgress(exp);

  $("#expNumber").textContent =
    `${formatNumber(exp)} EXP`;

  $("#totalExp").textContent =
    formatNumber(exp);

  $("#levelText").textContent =
    `Level ${getLevel(exp)}`;

  $("#progressPercent").textContent =
    `${progress.percent}%`;

  $("#progressBar").style.width =
    `${progress.percent}%`;

  const tierBadge = $("#tierBadge");

  tierBadge.textContent =
    tier.name;

  tierBadge.className =
    `tier-badge ${tier.className}`;

  if (tier.name === "Master") {

    $("#nextTierText").textContent =
      "Siz Master darajasidasiz 👑";

  } else if (tier.name === "Diamond") {

    $("#nextTierText").textContent =
      "Master uchun 1 000 001+ EXP kerak";

  } else {

    $("#nextTierText").textContent =
      `${formatNumber(progress.remaining)} EXP qoldi`;

  }

  $("#rankingTier").textContent =
    tier.name;

  $("#rankingExp").textContent =
    formatNumber(exp);

  $("#availableExpReward").textContent =
    `${formatNumber(exp)} EXP`;

}


/* =========================================================
   PROFILE UI
========================================================= */

function updateProfileUI() {

  const profile = getProfile();

  const loginButton = $("#loginButton");

  if (!profile) {

    $("#studentNameDisplay").textContent =
      "Mehmon";

    $("#studentClassDisplay").textContent =
      "Profilga kiring";

    $("#studentStickerDisplay").textContent =
      "☀️";

    $("#rankingStudentName").textContent =
      "Mehmon";

    $("#rankingStudentClass").textContent =
      "Profilga kiring";

    $("#rankingStudentClass2").textContent =
      "—";

    $("#rankingStudentSticker").textContent =
      "☀️";

    $("#currentRankPosition").textContent =
      "—";

    $("#loginButton").textContent =
      "Kirish";

    $("#logoutButton").classList.add("hidden");

    return;
  }


  $("#studentNameDisplay").textContent =
    profile.name;

  $("#studentClassDisplay").textContent =
    profile.className;

  $("#studentStickerDisplay").textContent =
    profile.sticker;

  $("#rankingStudentName").textContent =
    profile.name;

  $("#rankingStudentClass").textContent =
    profile.className;

  $("#rankingStudentClass2").textContent =
    profile.className;

  $("#rankingStudentSticker").textContent =
    profile.sticker;

  /*
    Hozir real maktab serveri yo‘q.
    Shuning uchun sun'iy ravishda #1 bermaymiz.
  */
  $("#currentRankPosition").textContent =
    "—";

  loginButton.textContent =
    "Profil";

  $("#logoutButton").classList.remove("hidden");
}


/* =========================================================
   DAILY DATE
========================================================= */

function getTodayKey() {

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function getDayOfYear() {

  const now = new Date();

  const start = new Date(now.getFullYear(), 0, 0);

  const diff =
    now - start;

  const oneDay =
    1000 * 60 * 60 * 24;

  return Math.floor(diff / oneDay);
}


function getFormattedDate() {

  return new Intl.DateTimeFormat(
    "uz-UZ",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(new Date());
}


/* =========================================================
   DAILY STATE
========================================================= */

function getDailyState() {

  const today =
    getTodayKey();

  const saved =
    getJSON(STORAGE.daily, null);

  if (
    !saved ||
    saved.date !== today
  ) {

    const freshState = {
      date: today,
      subject: null,
      attempts: 0,
      completed: false,
      rewardGiven: false
    };

    setJSON(
      STORAGE.daily,
      freshState
    );

    return freshState;
  }

  return saved;
}


function saveDailyState(state) {
  setJSON(STORAGE.daily, state);
}


/* =========================================================
   SEEDED RANDOM
========================================================= */

function seededRandom(seed) {

  let value =
    Math.sin(seed) * 10000;

  return value - Math.floor(value);
}


function shuffleWithSeed(array, seed) {

  const copy = [...array];

  let currentSeed =
    seed;

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const random =
      seededRandom(currentSeed++);

    const j =
      Math.floor(random * (i + 1));

    [
      copy[i],
      copy[j]
    ] =
    [
      copy[j],
      copy[i]
    ];
  }

  return copy;
}


/* =========================================================
   QUESTION HELPERS
========================================================= */

function makeQuestion(text, options, correct) {

  return {
    text,
    options: shuffleWithSeed(
      options.map((item) => ({
        text: item,
        correct: item === correct
      })),
      text.length * 17
    )
  };
}


/* =========================================================
   MATH QUESTIONS
========================================================= */

function generateMathQuestion(index, day) {

  const type =
    (day + index) % 8;

  const seed =
    day * 31 + index * 17;

  const a =
    10 + Math.floor(seededRandom(seed) * 90);

  const b =
    2 + Math.floor(seededRandom(seed + 1) * 30);


  if (type === 0) {

    const answer = a + b;

    return makeQuestion(
      `${a} + ${b} = ?`,
      [
        String(answer),
        String(answer + 5),
        String(answer - 3),
        String(answer + 10)
      ],
      String(answer)
    );
  }


  if (type === 1) {

    const answer = a - b;

    return makeQuestion(
      `${a} − ${b} = ?`,
      [
        String(answer),
        String(answer + 4),
        String(answer - 2),
        String(answer + 7)
      ],
      String(answer)
    );
  }


  if (type === 2) {

    const x =
      3 + (index % 8);

    const c =
      x * b;

    return makeQuestion(
      `${b} × ${x} = ?`,
      [
        String(c),
        String(c + b),
        String(c - x),
        String(c + 5)
      ],
      String(c)
    );
  }


  if (type === 3) {

    const divisor =
      2 + (index % 7);

    const answer =
      5 + (day + index) % 15;

    const dividend =
      divisor * answer;

    return makeQuestion(
      `${dividend} ÷ ${divisor} = ?`,
      [
        String(answer),
        String(answer + 1),
        String(answer - 1),
        String(answer * 2)
      ],
      String(answer)
    );
  }


  if (type === 4) {

    const base =
      100 + (index * 20);

    const percent =
      10 + ((day + index) % 5) * 5;

    const answer =
      base * percent / 100;

    return makeQuestion(
      `${base} ning ${percent}% i qancha?`,
      [
        String(answer),
        String(answer + 5),
        String(answer - 5),
        String(answer + 10)
      ],
      String(answer)
    );
  }


  if (type === 5) {

    const x =
      2 + (index % 5);

    const value =
      x + 5;

    return makeQuestion(
      `x + 5 = ${value}. x = ?`,
      [
        String(x),
        String(x + 1),
        String(x + 2),
        String(x - 1)
      ],
      String(x)
    );
  }


  if (type === 6) {

    const side =
      4 + (index % 6);

    const answer =
      side * side;

    return makeQuestion(
      `Tomoni ${side} sm bo‘lgan kvadratning yuzi qancha?`,
      [
        `${answer} sm²`,
        `${side * 4} sm²`,
        `${answer + side} sm²`,
        `${answer - 2} sm²`
      ],
      `${answer} sm²`
    );
  }


  const side =
    5 + (index % 6);

  const answer =
    side * 4;

  return makeQuestion(
    `Tomoni ${side} sm bo‘lgan kvadratning perimetri qancha?`,
    [
      `${answer} sm`,
      `${side * 2} sm`,
      `${answer + 4} sm`,
      `${answer - 4} sm`
    ],
    `${answer} sm`
  );
}


/* =========================================================
   STATIC QUESTION BANKS
========================================================= */

const QUESTION_BANKS = {

  "Ona tili": [

    {
      q: "Ot so‘z turkumini toping.",
      o: ["Kitob", "Chiroyli", "Yugurdi", "Tez"],
      a: "Kitob"
    },

    {
      q: "Sifatni toping.",
      o: ["Go‘zal", "Kitob", "Yozdi", "Besh"],
      a: "Go‘zal"
    },

    {
      q: "Fe’lni toping.",
      o: ["O‘qidi", "Qalam", "Chiroyli", "Yashil"],
      a: "O‘qidi"
    },

    {
      q: "Ko‘plik qo‘shimchasini toping.",
      o: ["-lar", "-ni", "-ga", "-dan"],
      a: "-lar"
    },

    {
      q: "Qaysi biri olmosh?",
      o: ["Men", "Kitob", "Chiroyli", "Beshta"],
      a: "Men"
    },

    {
      q: "Sinonim so‘zni toping.",
      o: ["Go‘zal — chiroyli", "Katta — kichik", "Issiq — sovuq", "Tez — sekin"],
      a: "Go‘zal — chiroyli"
    },

    {
      q: "Antonim so‘zni toping.",
      o: ["Katta — kichik", "Go‘zal — chiroyli", "Tez — ildam", "Uy — xonadon"],
      a: "Katta — kichik"
    },

    {
      q: "Gapning asosiy bo‘laklaridan biri qaysi?",
      o: ["Ega", "Aniqlovchi", "To‘ldiruvchi", "Hol"],
      a: "Ega"
    },

    {
      q: "Tinish belgilaridan birini toping.",
      o: ["Nuqta", "So‘z", "Fe’l", "Ot"],
      a: "Nuqta"
    },

    {
      q: "Alifboda nechta turdagi harf ishlatiladi? To‘g‘ri javobni belgilang.",
      o: ["Unli va undosh", "Faqat unli", "Faqat undosh", "Faqat son"],
      a: "Unli va undosh"
    }

  ],


  "Tarix": [

    {
      q: "Amir Temur qaysi davlatga asos solgan?",
      o: ["Temuriylar davlati", "Rim imperiyasi", "Usmoniylar davlati", "Qoraxoniylar"],
      a: "Temuriylar davlati"
    },

    {
      q: "Samarqand Amir Temur davrida qanday ahamiyatga ega bo‘lgan?",
      o: ["Poytaxt", "Dengiz porti", "Mustamlaka", "Harbiy lager"],
      a: "Poytaxt"
    },

    {
      q: "Mirzo Ulug‘bek kim bo‘lgan?",
      o: ["Astronom va hukmdor", "Shoir va rassom", "Faqat savdogar", "Faqat sarkarda"],
      a: "Astronom va hukmdor"
    },

    {
      q: "Registon qaysi shaharda joylashgan?",
      o: ["Samarqand", "Buxoro", "Xiva", "Qo‘qon"],
      a: "Samarqand"
    },

    {
      q: "Ipak yo‘li asosan nimani bog‘lagan?",
      o: ["Sharq va G‘arbni", "Shimol va Janubni", "Faqat ikki qishloqni", "Faqat orollarni"],
      a: "Sharq va G‘arbni"
    },

    {
      q: "O‘zbekiston Respublikasi mustaqilligi qachon e’lon qilingan?",
      o: ["1991-yil 1-sentabr", "1989-yil 1-sentabr", "1995-yil 1-iyul", "1990-yil 8-dekabr"],
      a: "1991-yil 1-sentabr"
    },

    {
      q: "Alisher Navoiy kim sifatida mashhur?",
      o: ["Shoir va mutafakkir", "Astronavt", "Sarkarda", "Geolog"],
      a: "Shoir va mutafakkir"
    },

    {
      q: "Buxoro qaysi jihati bilan tarixda mashhur?",
      o: ["Ilm va madaniyat markazi sifatida", "Faqat dengiz savdosi bilan", "Faqat konlari bilan", "Faqat zamonaviy sanoat bilan"],
      a: "Ilm va madaniyat markazi sifatida"
    },

    {
      q: "Xiva tarixiy markazi qanday nom bilan mashhur?",
      o: ["Ichan qal’a", "Registon", "Ark", "Shohi Zinda"],
      a: "Ichan qal’a"
    },

    {
      q: "Ulug‘bek rasadxonasi qaysi shaharda?",
      o: ["Samarqand", "Toshkent", "Xiva", "Termiz"],
      a: "Samarqand"
    }

  ],


  "Ingliz tili": [

    {
      q: "Choose the correct verb: I ___ a student.",
      o: ["am", "is", "are", "be"],
      a: "am"
    },

    {
      q: "Choose the plural form of 'child'.",
      o: ["children", "childs", "childes", "childrens"],
      a: "children"
    },

    {
      q: "Choose the correct article: ___ apple.",
      o: ["an", "a", "thee", "no"],
      a: "an"
    },

    {
      q: "Past tense of 'go' is:",
      o: ["went", "goed", "gone", "going"],
      a: "went"
    },

    {
      q: "Choose the opposite of 'big'.",
      o: ["small", "long", "fast", "high"],
      a: "small"
    },

    {
      q: "She ___ to school every day.",
      o: ["goes", "go", "going", "gone"],
      a: "goes"
    },

    {
      q: "What is the plural of 'book'?",
      o: ["books", "bookes", "bookies", "book"],
      a: "books"
    },

    {
      q: "Choose the correct pronoun: ___ am happy.",
      o: ["I", "He", "They", "She"],
      a: "I"
    },

    {
      q: "The opposite of 'hot' is:",
      o: ["cold", "warm", "high", "dark"],
      a: "cold"
    },

    {
      q: "Choose the correct form: They ___ playing.",
      o: ["are", "is", "am", "be"],
      a: "are"
    }

  ],


  "Rus tili": [

    {
      q: "Выберите существительное.",
      o: ["Книга", "Красивый", "Бежать", "Быстро"],
      a: "Книга"
    },

    {
      q: "Выберите глагол.",
      o: ["Читать", "Книга", "Красный", "Пять"],
      a: "Читать"
    },

    {
      q: "Какое слово является прилагательным?",
      o: ["Красивый", "Дом", "Бежать", "Очень"],
      a: "Красивый"
    },

    {
      q: "Антоним слова «большой»:",
      o: ["маленький", "красивый", "быстрый", "новый"],
      a: "маленький"
    },

    {
      q: "Множественное число слова «дом»:",
      o: ["дома", "домы", "доме", "домом"],
      a: "дома"
    },

    {
      q: "Выберите местоимение.",
      o: ["Я", "Книга", "Красный", "Бег"],
      a: "Я"
    },

    {
      q: "Какое слово означает «спасибо»?",
      o: ["Спасибо", "Привет", "До свидания", "Пожалуйста"],
      a: "Спасибо"
    },

    {
      q: "Какое слово является числительным?",
      o: ["Пять", "Синий", "Стол", "Читать"],
      a: "Пять"
    },

    {
      q: "Выберите правильное слово: Я ___ студент.",
      o: ["есть", "быть", "будут", "были"],
      a: "есть"
    },

    {
      q: "Антоним слова «быстро»:",
      o: ["медленно", "красиво", "ново", "высоко"],
      a: "медленно"
    }

  ],


  "Biologiya": [

    {
      q: "Fotosintez asosan qaysi organoidda sodir bo‘ladi?",
      o: ["Xloroplast", "Yadro", "Ribosoma", "Vakuola"],
      a: "Xloroplast"
    },

    {
      q: "Inson yuragi nechta bo‘lmadan iborat?",
      o: ["4", "2", "3", "5"],
      a: "4"
    },

    {
      q: "Odam nafas olishda qaysi gazni qabul qiladi?",
      o: ["Kislorod", "Azot", "Karbonat angidrid", "Vodorod"],
      a: "Kislorod"
    },

    {
      q: "Qonning qizil hujayralari nima deyiladi?",
      o: ["Eritrotsitlar", "Leykotsitlar", "Trombotsitlar", "Neyronlar"],
      a: "Eritrotsitlar"
    },

    {
      q: "Asab tizimining asosiy hujayrasi:",
      o: ["Neyron", "Eritrotsit", "Osteotsit", "Trombotsit"],
      a: "Neyron"
    },

    {
      q: "O‘simliklarda suv asosan qaysi qism orqali so‘riladi?",
      o: ["Ildiz", "Gul", "Meva", "Bargning ustki qismi"],
      a: "Ildiz"
    },

    {
      q: "DNK asosan qayerda joylashadi?",
      o: ["Yadroda", "Hujayra devorida", "Vakuolada", "Ribosomada"],
      a: "Yadroda"
    },

    {
      q: "Vitamin D hosil bo‘lishiga nima yordam beradi?",
      o: ["Quyosh nuri", "Faqat suv", "Faqat tuz", "Faqat kraxmal"],
      a: "Quyosh nuri"
    },

    {
      q: "Qaysi biri umurtqali hayvon?",
      o: ["Baliq", "Chigirtka", "O‘rgimchak", "Qisqichbaqa"],
      a: "Baliq"
    },

    {
      q: "Odam tanasida qonni haydaydigan organ:",
      o: ["Yurak", "O‘pka", "Jigar", "Buyrak"],
      a: "Yurak"
    }

  ],


  "Kimyo": [

    {
      q: "Suvning kimyoviy formulasi:",
      o: ["H₂O", "CO₂", "O₂", "NaCl"],
      a: "H₂O"
    },

    {
      q: "Kislorodning belgisi:",
      o: ["O", "K", "C", "N"],
      a: "O"
    },

    {
      q: "Vodorodning belgisi:",
      o: ["H", "V", "Hy", "Ho"],
      a: "H"
    },

    {
      q: "Osh tuzining formulasi:",
      o: ["NaCl", "H₂O", "CO₂", "CaO"],
      a: "NaCl"
    },

    {
      q: "Karbonat angidrid formulasi:",
      o: ["CO₂", "CO", "CaCO₃", "CH₄"],
      a: "CO₂"
    },

    {
      q: "Temirning kimyoviy belgisi:",
      o: ["Fe", "Te", "T", "Ir"],
      a: "Fe"
    },

    {
      q: "Oltinning kimyoviy belgisi:",
      o: ["Au", "Ag", "O", "Al"],
      a: "Au"
    },

    {
      q: "Kislotaga misol:",
      o: ["HCl", "NaCl", "O₂", "Fe"],
      a: "HCl"
    },

    {
      q: "Na nimani bildiradi?",
      o: ["Natriy", "Azot", "Neon", "Nikel"],
      a: "Natriy"
    },

    {
      q: "CO₂ tarkibida nechta kislorod atomi bor?",
      o: ["2", "1", "3", "4"],
      a: "2"
    }

  ]

};


/* =========================================================
   GENERATE NON-MATH TEST
========================================================= */

function generateFromBank(subject, day) {

  const bank =
    QUESTION_BANKS[subject] || [];

  if (!bank.length) {
    return [];
  }

  const selected = [];

  for (
    let i = 0;
    i < CONFIG.questionsPerTest;
    i++
  ) {

    const bankIndex =
      Math.abs(
        (day * 7 + i * 13) % bank.length
      );

    const source =
      bank[bankIndex];

    const shuffledOptions =
      shuffleWithSeed(
        source.o,
        day * 100 + i * 11
      );

    selected.push({
      text: source.q,
      options: shuffledOptions.map(
        (item) => ({
          text: item,
          correct: item === source.a
        })
      )
    });
  }

  return selected;
}


/* =========================================================
   DAILY TEST GENERATOR
========================================================= */

function generateDailyTest(subject) {

  const day =
    getDayOfYear();

  if (subject === "Matematika") {

    return Array.from(
      {
        length: CONFIG.questionsPerTest
      },
      (_, index) =>
        generateMathQuestion(
          index,
          day
        )
    );
  }

  return generateFromBank(
    subject,
    day
  );
}


/* =========================================================
   TEST STATE
========================================================= */

const testState = {
  active: false,
  subject: null,
  questions: [],
  questionIndex: 0,
  answers: []
};


/* =========================================================
   TEST UI UPDATE
========================================================= */

function updateDailyInfo() {

  const daily =
    getDailyState();

  $("#todaySubject").textContent =
    daily.subject || "Hali tanlanmagan";

  $("#attemptInfo").textContent =
    `${daily.attempts} / ${CONFIG.maxAttemptsPerDay}`;

  $("#todayDate").textContent =
    getFormattedDate();


  $$(".subject-card").forEach((card) => {

    card.classList.remove("selected");
    card.classList.remove("locked");

    const subject =
      card.dataset.subject;

    if (daily.subject === subject) {
      card.classList.add("selected");
    }

    if (
      daily.subject &&
      daily.subject !== subject
    ) {
      card.classList.add("locked");
    }

  });


  if (
    daily.completed ||
    daily.attempts >= CONFIG.maxAttemptsPerDay
  ) {

    $("#testNotice").textContent =
      `Bugungi test uchun limit tugagan. Ertaga yangi fan tanlash mumkin.`;

  } else if (daily.subject) {

    $("#testNotice").textContent =
      `Bugungi fan: ${daily.subject}. ${CONFIG.maxAttemptsPerDay - daily.attempts} ta urinish qoldi.`;

  } else {

    $("#testNotice").textContent =
      "Bugungi faningizni tanlang.";

  }
}


/* =========================================================
   START TEST
========================================================= */

function startSubject(subject) {

  const profile =
    getProfile();

  if (!profile) {

    showToast(
      "Avval profilingizga kiring."
    );

    openLogin();

    return;
  }


  const daily =
    getDailyState();


  if (
    daily.attempts >=
    CONFIG.maxAttemptsPerDay
  ) {

    showToast(
      "Bugungi 2 ta urinish tugagan."
    );

    return;
  }


  if (
    daily.subject &&
    daily.subject !== subject
  ) {

    showToast(
      `Bugun ${daily.subject} tanlangan.`
    );

    return;
  }


  if (!daily.subject) {

    daily.subject =
      subject;

    saveDailyState(
      daily
    );
  }


  testState.active = true;

  testState.subject =
    subject;

  testState.questions =
    generateDailyTest(subject);

  testState.questionIndex = 0;

  testState.answers =
    new Array(
      testState.questions.length
    ).fill(null);


  renderQuestion();

  $("#dailyTestOverlay")
    .classList.remove("hidden");

  $("#testModalTitle")
    .textContent = subject;

  $("#modalAttemptText")
    .textContent =
    `${daily.attempts + 1} / ${CONFIG.maxAttemptsPerDay}`;
}


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion() {

  const current =
    testState.questions[
      testState.questionIndex
    ];

  if (!current) {
    return;
  }


  const index =
    testState.questionIndex;

  const total =
    testState.questions.length;


  $("#questionProgressFill")
    .style.width =
    `${((index + 1) / total) * 100}%`;

  $("#questionProgressText")
    .textContent =
    `${index + 1} / ${total}`;


  const selected =
    testState.answers[index];


  const optionsHTML =
    current.options.map(
      (option, optionIndex) => {

        const selectedClass =
          selected === optionIndex
            ? "selected"
            : "";

        return `
          <button
            type="button"
            class="answer-button ${selectedClass}"
            data-answer-index="${optionIndex}"
          >
            ${String.fromCharCode(65 + optionIndex)}.
            ${escapeHTML(option.text)}
          </button>
        `;
      }
    ).join("");


  $("#testQuestionContainer").innerHTML = `

    <div class="question-card">

      <div class="question-number">
        SAVOL ${index + 1}
      </div>

      <h3>
        ${escapeHTML(current.text)}
      </h3>

      <div class="answer-list">
        ${optionsHTML}
      </div>

    </div>

  `;


  $$(".answer-button").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const answerIndex =
            Number(
              button.dataset.answerIndex
            );

          testState.answers[index] =
            answerIndex;

          $$(".answer-button")
            .forEach((item) =>
              item.classList.remove(
                "selected"
              )
            );

          button.classList.add(
            "selected"
          );

        }
      );
    }
  );


  const isLast =
    index === total - 1;

  $("#nextQuestionButton")
    .classList.toggle(
      "hidden",
      isLast
    );

  $("#submitTestButton")
    .classList.toggle(
      "hidden",
      !isLast
    );
}


/* =========================================================
   NEXT QUESTION
========================================================= */

function goNextQuestion() {

  const currentAnswer =
    testState.answers[
      testState.questionIndex
    ];

  if (
    currentAnswer === null ||
    currentAnswer === undefined
  ) {

    showToast(
      "Avval javobni tanlang."
    );

    return;
  }


  testState.questionIndex++;

  renderQuestion();
}


/* =========================================================
   SUBMIT TEST
========================================================= */

function submitTest() {

  const unanswered =
    testState.answers.some(
      (answer) =>
        answer === null ||
        answer === undefined
    );


  if (unanswered) {

    showToast(
      "Barcha savollarga javob bering."
    );

    return;
  }


  let correct = 0;


  testState.questions.forEach(
    (question, index) => {

      const selectedIndex =
        testState.answers[index];

      if (
        question.options[
          selectedIndex
        ]?.correct
      ) {
        correct++;
      }

    }
  );


  const daily =
    getDailyState();

  const firstAttempt =
    daily.attempts === 0;

  const earnedExp =
    correct *
    CONFIG.expPerCorrect;


  daily.attempts++;

  daily.completed =
    daily.attempts >=
    CONFIG.maxAttemptsPerDay;

  if (firstAttempt) {

    daily.rewardGiven =
      true;
  }


  saveDailyState(
    daily
  );

  addTest();


  let expReward = 0;

  if (firstAttempt) {

    expReward =
      earnedExp;

    addExp(
      expReward
    );

  }


  closeTestModal();

  showResult(
    correct,
    expReward,
    firstAttempt
  );

  updateAllUI();
}


/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(
  correct,
  earnedExp,
  firstAttempt
) {

  const percent =
    correct * 10;


  let description;

  if (percent >= 90) {

    description =
      "Ajoyib natija! Bilimingiz juda kuchli 🔥";

  } else if (percent >= 70) {

    description =
      "Juda yaxshi! Yana ozgina mashq qiling 💪";

  } else if (percent >= 50) {

    description =
      "Yaxshi boshlanish. Keyingi urinishda yaxshilang 📚";

  } else {

    description =
      "Mashq qilishni davom ettiring. Keyingi safar yaxshiroq bo‘ladi ☀️";
  }


  $("#resultTitle").textContent =
    firstAttempt
      ? "Test yakunlandi"
      : "Mashq yakunlandi";

  $("#resultCorrect").textContent =
    correct;

  $("#resultExp").textContent =
    earnedExp;

  $("#resultDescription").textContent =
    firstAttempt
      ? `${description} Birinchi urinish uchun ${earnedExp} EXP olasiz.`
      : `${description} Ikkinchi urinish mashq uchun edi, EXP qayta berilmadi.`;


  $("#resultOverlay")
    .classList.remove(
      "hidden"
    );
}


/* =========================================================
   CLOSE TEST
========================================================= */

function closeTestModal() {

  $("#dailyTestOverlay")
    .classList.add(
      "hidden"
    );

  testState.active =
    false;

  testState.subject =
    null;

  testState.questions =
    [];

  testState.answers =
    [];
}


/* =========================================================
   BOOKS
========================================================= */

function getUnlockedBooks() {
  return getJSON(
    STORAGE.unlockedBooks,
    []
  );
}


function saveUnlockedBooks(books) {
  setJSON(
    STORAGE.unlockedBooks,
    books
  );
}


function updateBooksUI() {

  const exp =
    getExp();

  const unlocked =
    getUnlockedBooks();


  $$(".book-select").forEach(
    (button) => {

      const id =
        Number(
          button.dataset.book
        );

      const hasBook =
        unlocked.includes(id);


      if (hasBook) {

        button.classList.add(
          "unlocked"
        );

        button.textContent =
          "Ochilgan";

      } else {

        button.classList.remove(
          "unlocked"
        );

        if (
          exp >= CONFIG.bookPrice
        ) {

          button.textContent =
            "Ochish";

        } else {

          button.textContent =
            `🔒 ${formatNumber(CONFIG.bookPrice)} EXP`;

        }
      }

    }
  );
}


function openBook(bookId) {

  const exp =
    getExp();

  const unlocked =
    getUnlockedBooks();


  if (unlocked.includes(bookId)) {

    showBookContent(bookId);

    return;
  }


  if (
    exp <
    CONFIG.bookPrice
  ) {

    showToast(
      `Kitobni ochish uchun ${formatNumber(CONFIG.bookPrice)} EXP kerak.`
    );

    return;
  }


  const newUnlocked =
    [
      ...unlocked,
      bookId
    ];

  saveUnlockedBooks(
    newUnlocked
  );

  showToast(
    `Kitob №${bookId} ochildi 📚`
  );

  updateBooksUI();

  showBookContent(bookId);
}


function showBookContent(bookId) {

  const data = {

    1: {
      title: "Kitob №1",
      emoji: "📕",
      text: "Bu joyga administrator tomonidan 1-oy uchun tanlangan kitobning mazmuni, PDF yoki elektron sahifalari joylashtiriladi."
    },

    2: {
      title: "Kitob №2",
      emoji: "📘",
      text: "Bu joyga administrator tomonidan 2-kitobning mazmuni, PDF yoki elektron sahifalari joylashtiriladi."
    },

    3: {
      title: "Kitob №3",
      emoji: "📙",
      text: "Bu joyga administrator tomonidan 3-kitobning mazmuni, PDF yoki elektron sahifalari joylashtiriladi."
    }

  };


  const book =
    data[bookId];


  $("#bookModalContent").innerHTML = `

    <div class="result-sun">
      ${book.emoji}
    </div>

    <span class="modal-kicker">
      KITOB
    </span>

    <h2>
      ${book.title}
    </h2>

    <p>
      ${book.text}
    </p>

    <div
      style="
        margin-top:20px;
        padding:16px;
        border-radius:15px;
        background:#eaf5ff;
        color:#124b85;
        font-weight:700;
      "
    >
      Kitob muvaffaqiyatli ochildi ✅
    </div>

  `;


  $("#bookOverlay")
    .classList.remove(
      "hidden"
    );
}


/* =========================================================
   REWARD CALCULATOR
========================================================= */

function calculateRewardMoney(exp) {

  return (
    Number(exp) /
    CONFIG.rewardExpBase
  ) *
  CONFIG.rewardMoneyBase;
}


function updateRewardCalculator() {

  const input =
    Number(
      $("#rewardExpInput").value
    );


  if (
    !input ||
    input <= 0
  ) {

    $("#rewardMoneyResult").textContent =
      "0 so‘m";

    return;
  }


  const money =
    calculateRewardMoney(
      input
    );


  $("#rewardMoneyResult").textContent =
    `${formatNumber(money)} so‘m`;
}


function formatCardNumber(value) {

  const digits =
    value
      .replace(/\D/g, "")
      .slice(0, 16);

  return digits.replace(
    /(.{4})/g,
    "$1 "
  ).trim();
}


function requestReward() {

  const expAmount =
    Number(
      $("#rewardExpInput").value
    );


  const card =
    $("#cardNumberInput")
      .value
      .replace(/\s/g, "");


  const currentExp =
    getExp();


  if (
    !Number.isFinite(expAmount) ||
    expAmount < CONFIG.rewardExpBase
  ) {

    showToast(
      `Minimum ${formatNumber(CONFIG.rewardExpBase)} EXP bo‘lishi kerak.`
    );

    return;
  }


  if (
    expAmount > currentExp
  ) {

    showToast(
      "Sizda yetarli EXP yo‘q."
    );

    return;
  }


  if (
    !/^\d{16}$/.test(card)
  ) {

    showToast(
      "16 xonali karta raqamini kiriting."
    );

    return;
  }


  const money =
    calculateRewardMoney(
      expAmount
    );


  /*
    FRONTEND DEMO:
    Haqiqiy pul o'tkazmasi bu yerda qilinmaydi.
  */

  setExp(
    currentExp - expAmount
  );

  addRewardCount();


  $("#rewardExpInput").value = "";
  $("#cardNumberInput").value = "";

  $("#rewardMoneyResult").textContent =
    "0 so‘m";


  showToast(
    `${formatNumber(money)} so‘mlik mukofot so‘rovi yuborildi ✅`
  );


  updateAllUI();
}


/* =========================================================
   LOGIN
========================================================= */

function openLogin() {

  const profile =
    getProfile();


  if (profile) {

    $("#studentName").value =
      profile.name;

    $("#studentClass").value =
      profile.className;

    $("#studentPhone").value =
      profile.phone;

    $("#studentSticker").value =
      profile.sticker;


    $$(".sticker-option")
      .forEach((button) => {

        button.classList.toggle(
          "active",
          button.dataset.sticker ===
          profile.sticker
        );

      });
  }


  $("#loginOverlay")
    .classList.remove(
      "hidden"
    );
}


function closeLogin() {

  $("#loginOverlay")
    .classList.add(
      "hidden"
    );
}


function handleLoginSubmit(event) {

  event.preventDefault();


  const name =
    $("#studentName").value.trim();

  const className =
    $("#studentClass").value;

  const phone =
    $("#studentPhone").value.trim();

  const sticker =
    $("#studentSticker").value;


  if (
    name.length < 2
  ) {

    showToast(
      "Ism va familiyangizni kiriting."
    );

    return;
  }


  if (!className) {

    showToast(
      "Sinfni tanlang."
    );

    return;
  }


  if (
    !/^\+998\d{9}$/.test(phone)
  ) {

    showToast(
      "Telefon +998XXXXXXXXX formatida bo‘lishi kerak."
    );

    return;
  }


  saveProfile({
    name,
    className,
    phone,
    sticker
  });


  closeLogin();

  updateProfileUI();

  showToast(
    `Xush kelibsiz, ${name}! ☀️`
  );
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

  clearProfile();

  closeLogin();

  updateProfileUI();

  showToast(
    "Profil o‘chirildi."
  );
}


/* =========================================================
   CHAT
========================================================= */

function addChatMessage(
  text,
  type
) {

  const message =
    document.createElement("div");

  message.className =
    `message ${
      type === "user"
        ? "user-message"
        : "bot-message"
    }`;

  message.textContent =
    text;

  $("#chatMessages")
    .appendChild(
      message
    );


  $("#chatMessages")
    .scrollTop =
    $("#chatMessages").scrollHeight;
}


function getBotResponse(input) {

  const text =
    input
      .toLowerCase()
      .trim();


  if (
    text.includes("salom") ||
    text.includes("assalomu")
  ) {

    return "Salom ☀️ Quyoshboyga xush kelibsiz!";
  }


  if (
    text.includes("exp") ||
    text.includes("tajriba")
  ) {

    return `Sizda hozir ${formatNumber(getExp())} EXP bor. Birinchi testdagi har bir to‘g‘ri javob ${CONFIG.expPerCorrect} EXP beradi.`;
  }


  if (
    text.includes("bronze") ||
    text.includes("silver") ||
    text.includes("gold") ||
    text.includes("diamond") ||
    text.includes("master") ||
    text.includes("daraja")
  ) {

    const tier =
      getTier(
        getExp()
      );

    return `Sizning hozirgi darajangiz: ${tier.name}. Bronze 1 000 EXP, Silver 10 000 EXP, Gold 100 000 EXP, Diamond 1 000 000 EXP, Master esa 1 000 000 dan yuqori EXP dan boshlanadi.`;
  }


  if (
    text.includes("test")
  ) {

    return "Testlar bo‘limidan bugungi fanni tanlang. Har kuni 2 ta urinish bor.";
  }


  if (
    text.includes("kitob")
  ) {

    return `Har bir kitob ${formatNumber(CONFIG.bookPrice)} EXP bilan ochiladi.`;
  }


  if (
    text.includes("reyting")
  ) {

    return "Hozir reyting faqat lokal profilni saqlaydi. Haqiqiy maktab reytingi uchun server bazasi kerak.";
  }


  if (
    text.includes("mukofot") ||
    text.includes("pul") ||
    text.includes("so'm") ||
    text.includes("sum")
  ) {

    return "Mukofot bo‘limida minimum 10 000 EXP ishlatiladi. Demo kurs bo‘yicha 10 000 EXP = 1 000 000 so‘m.";
  }


  if (
    text.includes("biolog")
  ) {

    return "Biologiya tabiiy fanlar bo‘limidagi testlardan biri.";
  }


  if (
    text.includes("kimyo")
  ) {

    return "Kimyo ham tabiiy fanlar bo‘limiga qo‘shilgan.";
  }


  if (
    text.includes("rahmat")
  ) {

    return "Arzimaydi ☀️ O‘qishda omad!";
  }


  return "Bu savol bo‘yicha hozircha lokal yordamchi javobiga ega emasman. Testlar, EXP, darajalar, kitoblar yoki mukofot haqida so‘rashingiz mumkin.";
}


function sendChatMessage() {

  const input =
    $("#chatInput");

  const value =
    input.value.trim();


  if (!value) {
    return;
  }


  addChatMessage(
    value,
    "user"
  );


  input.value = "";


  setTimeout(
    () => {

      const response =
        getBotResponse(
          value
        );

      addChatMessage(
        response,
        "bot"
      );

    },
    250
  );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

  const toast =
    $("#toast");


  $("#toastMessage")
    .textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2800
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   UPDATE ALL UI
========================================================= */

function updateAllUI() {

  updateExpUI();

  updateProfileUI();

  updateDailyInfo();

  updateBooksUI();

  $("#testCount").textContent =
    formatNumber(
      getTestCount()
    );

  $("#rewardCount").textContent =
    formatNumber(
      getRewardCount()
    );
}


/* =========================================================
   EVENTS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* LOGIN */

    $("#loginButton")
      .addEventListener(
        "click",
        openLogin
      );


    $("#loginClose")
      .addEventListener(
        "click",
        closeLogin
      );


    $("#loginOverlay")
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            $("#loginOverlay")
          ) {

            closeLogin();
          }

        }
      );


    $("#loginForm")
      .addEventListener(
        "submit",
        handleLoginSubmit
      );


    $("#logoutButton")
      .addEventListener(
        "click",
        logout
      );


    /* STICKERS */

    $$(".sticker-option")
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              $$(".sticker-option")
                .forEach(
                  (item) =>
                    item.classList.remove(
                      "active"
                    )
                );

              button.classList.add(
                "active"
              );

              $("#studentSticker")
                .value =
                button.dataset.sticker;

            }
          );

        }
      );


    /* PHONE FORMAT */

    $("#studentPhone")
      .addEventListener(
        "input",
        (event) => {

          let value =
            event.target.value;

          value =
            value.replace(
              /[^\d+]/g,
              ""
            );

          if (
            value &&
            !value.startsWith("+998")
          ) {

            const digits =
              value.replace(
                /\D/g,
                ""
              );

            if (
              digits.startsWith("998")
            ) {

              value =
                "+" + digits;

            } else if (
              digits.length
            ) {

              value =
                "+998" +
                digits;
            }
          }

          value =
            value.slice(
              0,
              13
            );

          event.target.value =
            value;

        }
      );


    /* SUBJECTS */

    $$(".subject-card")
      .forEach(
        (card) => {

          card.addEventListener(
            "click",
            () => {

              startSubject(
                card.dataset.subject
              );

            }
          );

        }
      );


    /* START TEST */

    $("#startTestButton")
      .addEventListener(
        "click",
        () => {

          document
            .querySelector("#tests")
            .scrollIntoView({
              behavior: "smooth"
            });

        }
      );


    /* BOOK SCROLL */

    $("#bookScrollButton")
      .addEventListener(
        "click",
        () => {

          document
            .querySelector("#books")
            .scrollIntoView({
              behavior: "smooth"
            });

        }
      );


    /* TEST MODAL */

    $("#dailyTestClose")
      .addEventListener(
        "click",
        closeTestModal
      );


    $("#dailyTestOverlay")
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            $("#dailyTestOverlay")
          ) {

            closeTestModal();

          }

        }
      );


    $("#nextQuestionButton")
      .addEventListener(
        "click",
        goNextQuestion
      );


    $("#submitTestButton")
      .addEventListener(
        "click",
        submitTest
      );


    /* RESULT */

    $("#resultCloseButton")
      .addEventListener(
        "click",
        () => {

          $("#resultOverlay")
            .classList.add(
              "hidden"
            );

        }
      );


    $("#resultOverlay")
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            $("#resultOverlay")
          ) {

            $("#resultOverlay")
              .classList.add(
                "hidden"
              );
          }

        }
      );


    /* BOOKS */

    $$(".book-select")
      .forEach(
        (button) => {

          button.addEventListener(
            "click",
            () => {

              openBook(
                Number(
                  button.dataset.book
                )
              );

            }
          );

        }
      );


    $("#bookClose")
      .addEventListener(
        "click",
        () => {

          $("#bookOverlay")
            .classList.add(
              "hidden"
            );

        }
      );


    $("#bookOverlay")
      .addEventListener(
        "click",
        (event) => {

          if (
            event.target ===
            $("#bookOverlay")
          ) {

            $("#bookOverlay")
              .classList.add(
                "hidden"
              );

          }

        }
      );


    /* REWARD */

    $("#rewardExpInput")
      .addEventListener(
        "input",
        updateRewardCalculator
      );


    $("#cardNumberInput")
      .addEventListener(
        "input",
        (event) => {

          event.target.value =
            formatCardNumber(
              event.target.value
            );

        }
      );


    $("#rewardRequestButton")
      .addEventListener(
        "click",
        requestReward
      );


    /* CHAT */

    $("#chatButton")
      .addEventListener(
        "click",
        () => {

          $("#chatWindow")
            .classList.toggle(
              "hidden"
            );

        }
      );


    $("#chatClose")
      .addEventListener(
        "click",
        () => {

          $("#chatWindow")
            .classList.add(
              "hidden"
            );

        }
      );


    $("#chatSend")
      .addEventListener(
        "click",
        sendChatMessage
      );


    $("#chatInput")
      .addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Enter"
          ) {

            sendChatMessage();

          }

        }
      );


    /* INIT */

    updateAllUI();

  }
);