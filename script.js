/* ==========================================================
   团支书竞选个人主页 · 交互脚本
   ========================================================== */

/* ---------- 1. 首屏打字机 ---------- */
const phrases = [
  "一名踏实的共青团员",
  "两年班级工作的组织者",
  "愿意把小事做细的服务者",
  "和你说真话的同班同学",
];

const typewriterEl = document.getElementById("typewriter");
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
  const current = phrases[phraseIndex];

  if (!deleting) {
    charIndex++;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
    setTimeout(type, 110);
  } else {
    charIndex--;
    typewriterEl.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(type, 420);
      return;
    }
    setTimeout(type, 45);
  }
}
type();

/* ---------- 2. 首屏飘浮光点 ---------- */
(function createSparks() {
  const bg = document.getElementById("heroBg");
  if (!bg) return;
  const count = window.innerWidth < 720 ? 14 : 26;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = Math.random() * 100 + "%";
    spark.style.top = 45 + Math.random() * 55 + "%";
    spark.style.animationDuration = 6 + Math.random() * 8 + "s";
    spark.style.animationDelay = -Math.random() * 10 + "s";
    spark.style.opacity = 0.4 + Math.random() * 0.6;
    bg.appendChild(spark);
  }
})();

/* ---------- 3. 导航栏状态 / 进度条 / 回到顶部 ---------- */
const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");
const progressBar = document.getElementById("progressBar");

function onScroll() {
  const y = window.scrollY;

  // 未滚动时首屏为深色背景，导航文字反色；滚动后切换为浅色导航
  const atTop = y < 120;
  navbar.classList.toggle("on-hero", atTop);
  navbar.classList.toggle("scrolled", !atTop);
  backToTop.classList.toggle("visible", y > 520);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- 4. 移动端菜单 ---------- */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("open");
  navMenu.classList.toggle("open");
});

navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("open");
    navMenu.classList.remove("open");
  });
});

/* ---------- 5. 滚动入场动画 ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 90 + "ms";
  revealObserver.observe(el);
});

/* ---------- 6. 数字滚动 ---------- */
const counters = document.querySelectorAll("[data-count]");

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((el) => countObserver.observe(el));

/* ---------- 7. 导航高亮当前区块 ---------- */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + entry.target.id
        );
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);

sections.forEach((section) => spy.observe(section));

/* ---------- 8. 支持票数（本地存储） ---------- */
const VOTE_KEY = "lhp_campaign_vote";
const voteBtn = document.getElementById("voteBtn");
const voteCountEl = document.getElementById("voteCount");
const voteNote = document.getElementById("voteNote");

const BASE_VOTES = 46; // 演示基数，可自行修改
let voted = localStorage.getItem(VOTE_KEY) === "1";

function renderVote() {
  voteCountEl.textContent = BASE_VOTES + (voted ? 1 : 0);
  if (voted) {
    voteBtn.classList.add("voted");
    voteBtn.disabled = true;
    voteBtn.querySelector("span").textContent = "已收到你的支持";
    voteNote.textContent = "谢谢你！每一份信任我都会记住。";
  }
}

voteBtn.addEventListener("click", () => {
  if (voted) return;
  voted = true;
  localStorage.setItem(VOTE_KEY, "1");
  renderVote();
});

renderVote();

/* ---------- 9. 留言板（本地存储） ---------- */
const MSG_KEY = "lhp_campaign_messages";
const msgForm = document.getElementById("msgForm");
const msgName = document.getElementById("msgName");
const msgText = document.getElementById("msgText");
const msgList = document.getElementById("msgList");

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(MSG_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveMessages(list) {
  localStorage.setItem(MSG_KEY, JSON.stringify(list.slice(0, 20)));
}

function renderMessages() {
  const list = loadMessages();
  msgList.innerHTML = "";

  if (!list.length) {
    const li = document.createElement("li");
    li.innerHTML = "<b>提示</b>还没有留言，写下你的期待，我会一条条看完。";
    msgList.appendChild(li);
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = item.name + " · " + item.time;
    li.appendChild(b);
    li.appendChild(document.createTextNode(item.text));
    msgList.appendChild(li);
  });
}

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = msgText.value.trim();
  if (!text) return;

  const name = msgName.value.trim() || "匿名同学";
  const now = new Date();
  const time =
    now.getMonth() + 1 + "月" + now.getDate() + "日 " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");

  const list = loadMessages();
  list.unshift({ name, text, time });
  saveMessages(list);
  renderMessages();

  msgText.value = "";
  msgName.value = "";
});

renderMessages();
