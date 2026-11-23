
// ==========================================
// STUDYSMART APPLICATION
// Your Smart Companion in Studying
// ==========================================

// APP DATA
let schedules = JSON.parse(localStorage.getItem("schedules") || "[]");
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

let seconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let language = localStorage.getItem("language") || "en";
let studySoundEnabled = true;


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
  localStorage.setItem("schedules", JSON.stringify(schedules));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateDashboard();
}


// ==========================================
// NAVIGATION
// ==========================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }
}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {
  const total = document.getElementById("totalTasks");
  const completedDisplay = document.getElementById("completedTasks");
  const percentage = document.getElementById("progressPercent");
  const bar = document.getElementById("progressBar");
  const message = document.getElementById("progressText");

  const completed = tasks.filter(task => task.done).length;

  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  if (total) total.textContent = tasks.length;
  if (completedDisplay) completedDisplay.textContent = completed;
  if (percentage) percentage.textContent = percent + "%";
  if (bar) bar.style.width = percent + "%";

  if (message) {
    message.textContent =
      percent === 100 ? "Excellent work!" : "Keep going!";
  }

  renderTasks();
  renderSchedules();
}


// ==========================================
// ADD SCHEDULE
// ==========================================

function addSchedule() {
  const subject = document.getElementById("subject")?.value.trim();
  const date = document.getElementById("studyDate")?.value;
  const start = document.getElementById("startTime")?.value;
  const end = document.getElementById("endTime")?.value;

  if (!subject || !date || !start || !end) {
    alert("Please complete all schedule fields.");
    return;
  }

  if (end <= start) {
    alert("End time must be later than start time.");
    return;
  }

  schedules.push({
    id: Date.now(),
    subject,
    date,
    start,
    end
  });

  saveData();

  document.getElementById("subject").value = "";
  document.getElementById("studyDate").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";

  alert("Schedule saved!");
}


// ==========================================
// DISPLAY SCHEDULES
// ==========================================

function renderSchedules() {
  const list = document.getElementById("scheduleList");

  if (!list) return;

  list.innerHTML = "<h3>My Study Schedules</h3>";

  schedules.forEach(schedule => {
    const item = document.createElement("div");
    item.className = "item-card";

    const details = document.createElement("p");
    details.textContent =
      schedule.subject + " | " + schedule.date +
      " | " + schedule.start + " - " + schedule.end;

    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.onclick = () => {
      schedules = schedules.filter(s => s.id !== schedule.id);
      saveData();
    };

    item.append(details, remove);
    list.appendChild(item);
  });
}


// ==========================================
// STUDY TIMER
// ==========================================

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");

  if (!display) return;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  display.textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(remainingSeconds).padStart(2, "0");
}

function startTimer() {
  if (timerRunning) return;

  if (seconds <= 0) {
    seconds = Number(
      document.getElementById("timerMinutes")?.value || 25
    ) * 60;
  }

  if (!Number.isFinite(seconds) || seconds <= 0) {
    alert("Enter a valid timer duration.");
    return;
  }

  timerRunning = true;

  timerInterval = setInterval(() => {
    seconds--;
    updateTimerDisplay();

    if (seconds <= 0) {
      pauseTimer();
      alert("Study session completed! Great job!");
      playStudySound("success");
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function resetTimer() {
  pauseTimer();

  let minutes = Number(
    document.getElementById("timerMinutes")?.value || 25
  );

  if (!Number.isFinite(minutes) || minutes < 1) {
    minutes = 25;
  }

  seconds = minutes * 60;
  updateTimerDisplay();
}


// ==========================================
// MY TASKS
// ==========================================

function addTask() {
  const input = document.getElementById("taskInput");
  const deadlineInput = document.getElementById("taskDeadline");

  if (!input) return;

  const name = input.value.trim();
  const deadline = deadlineInput?.value || "";

  if (!name) {
    alert("Please enter a task.");
    input.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    name: name,
    deadline: deadline,
    done: false
  });

  saveData();

  input.value = "";

  if (deadlineInput) {
    deadlineInput.value = "";
  }

  playStudySound("click");
}

function renderTasks() {
  const list = document.getElementById("taskList");

  if (!list) return;

  list.innerHTML = "";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "item-card";

    const title = document.createElement("p");
    title.textContent = (task.done ? "✓ " : "") + task.name;

    const deadline = document.createElement("p");
    deadline.textContent = task.deadline
      ? "Deadline: " + task.deadline
      : "No deadline";

    const complete = document.createElement("button");
    complete.textContent = task.done ? "Undo" : "Complete";

    complete.onclick = () => {
      task.done = !task.done;
      saveData();
    };

    const remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveData();
    };

    card.append(title, deadline, complete, remove);
    list.appendChild(card);
  });
}


// ==========================================
// AUTOMATIC STUDY SCHEDULE GENERATOR
// ==========================================

// ADD ANOTHER TASK FORM

function addTaskInput() {
  const container = document.getElementById("taskInputs");

  if (!container) {
    alert("Task input area not found. Check index.html.");
    return;
  }

  const form = document.createElement("div");
  form.className = "task-input";

  form.innerHTML = `
    <label>Subject</label>
    <input class="subject" type="text" placeholder="Enter subject">

    <label>Topic or Task</label>
    <input class="topic" type="text" placeholder="Enter topic">

    <label>Submission Date</label>
    <input class="deadline" type="date">

    <label>Priority</label>
    <select class="priority">
      <option value="High">High</option>
      <option value="Medium" selected>Medium</option>
      <option value="Low">Low</option>
    </select>

    <label>Study Hours</label>
    <input class="hours" type="number" min="1" max="8" value="1">

    <button type="button" class="remove-task">Remove Task</button>
    <hr>
  `;

  form.querySelector(".remove-task").addEventListener("click", () => {
    form.remove();
  });

  container.appendChild(form);
}


// GENERATE STUDY PLAN

function generateStudySchedule() {
  const forms = document.querySelectorAll("#taskInputs .task-input");
  const output = document.getElementById("generatedSchedule");

  if (!output) {
    alert("Schedule display area not found.");
    return;
  }

  const tasksToPlan = [];

  for (const form of forms) {
    const subject = form.querySelector(".subject")?.value.trim() || "";
    const topic = form.querySelector(".topic")?.value.trim() || "";
    const deadline = form.querySelector(".deadline")?.value || "";
    const priority = form.querySelector(".priority")?.value || "Medium";
    const hoursValue = form.querySelector(".hours")?.value || "";

    // Ignore completely empty forms
    if (!subject && !topic && !deadline) {
      continue;
    }

    // Check required information
    if (!subject || !topic || !deadline || !hoursValue) {
      alert("Please complete all fields in each task you started.");
      return;
    }

    const hours = Number(hoursValue);

    if (!Number.isFinite(hours) || hours < 1 || hours > 8) {
      alert("Study hours must be between 1 and 8.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(deadline + "T00:00:00");

    if (Number.isNaN(dueDate.getTime()) || dueDate < today) {
      alert("Please choose a valid deadline that is today or later.");
      return;
    }

    tasksToPlan.push({
      subject,
      topic,
      deadline,
      priority,
      hours
    });
  }

  if (tasksToPlan.length === 0) {
    alert("Please enter at least one complete task.");
    return;
  }

  // Sort by deadline and priority
  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  tasksToPlan.sort((a, b) =>
    a.deadline.localeCompare(b.deadline) ||
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Organize tasks by date
  const plan = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasksToPlan.forEach(task => {
    const dueDate = new Date(task.deadline + "T00:00:00");
    const availableDays = [];

    for (
      let date = new Date(today);
      date < dueDate;
      date.setDate(date.getDate() + 1)
    ) {
      availableDays.push(new Date(date));
    }

    // If deadline is today, schedule it today
    if (availableDays.length === 0) {
      availableDays.push(new Date(today));
    }

    let remainingHours = task.hours;

    availableDays.forEach((date, index) => {
      if (remainingHours <= 0) return;

      const daysLeft = availableDays.length - index;
      const sessionHours = Math.ceil(remainingHours / daysLeft);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("-");

      if (!plan[dateKey]) {
        plan[dateKey] = [];
      }

      plan[dateKey].push({
        subject: task.subject,
        topic: task.topic,
        priority: task.priority,
        hours: sessionHours,
        deadline: task.deadline
      });

      remainingHours -= sessionHours;
    });
  });

  // DISPLAY THE PLAN
  output.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "✦ Your Generated Study Plan ✦";
  output.appendChild(heading);

  const intro = document.createElement("p");
  intro.textContent =
    "Your tasks are organized by submission date and priority.";
  output.appendChild(intro);

  Object.keys(plan).sort().forEach(date => {
    const dayCard = document.createElement("div");
    dayCard.className = "generated-day";

    const dayHeading = document.createElement("h3");

    dayHeading.textContent =
      new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      });

    dayCard.appendChild(dayHeading);

    plan[date].forEach(item => {
      const taskCard = document.createElement("div");
      taskCard.className = "generated-task";

      const title = document.createElement("h4");
      title.textContent = item.subject;

      const details = document.createElement("p");
      details.textContent =
        item.topic + " | " +
        item.hours + " study hour(s) | " +
        item.priority + " priority | Deadline: " +
        item.deadline;

      taskCard.append(title, details);
      dayCard.appendChild(taskCard);
    });

    output.appendChild(dayCard);
  });

  localStorage.setItem("generatedStudyPlan", JSON.stringify(plan));

  output.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  playStudySound("success");
  alert("Your study plan has been generated!");
}


// ==========================================
// CALENDAR
// ==========================================

function showCalendarTasks() {
  const date = document.getElementById("calendarDate")?.value;
  const results = document.getElementById("calendarResults");

  if (!results) return;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  results.innerHTML = "";

  const matchingSchedules = schedules.filter(s => s.date === date);
  const matchingTasks = tasks.filter(t => t.deadline === date);

  const heading = document.createElement("h3");
  heading.textContent = "Activities for " + date;
  results.appendChild(heading);

  matchingSchedules.forEach(schedule => {
    const p = document.createElement("p");
    p.textContent =
      schedule.subject + " (" + schedule.start + " - " + schedule.end + ")";
    results.appendChild(p);
  });

  matchingTasks.forEach(task => {
    const p = document.createElement("p");
    p.textContent = "Task: " + task.name;
    results.appendChild(p);
  });

  if (!matchingSchedules.length && !matchingTasks.length) {
    const p = document.createElement("p");
    p.textContent = "No activities scheduled.";
    results.appendChild(p);
  }
}


// ==========================================
// PROFILE
// ==========================================

function saveProfile() {
  const nameInput = document.getElementById("studentName");

  if (!nameInput) return;

  const name = nameInput.value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  localStorage.setItem("studentName", name);

  const welcome = document.getElementById("welcomeText");
  const message = document.getElementById("profileMessage");

  if (welcome) {
    welcome.textContent = "Welcome, " + name + "!";
  }

  if (message) {
    message.textContent = "Profile saved successfully!";
  }
}


// ==========================================
// LANGUAGE
// ==========================================

function toggleLanguage() {
  language = language === "en" ? "tl" : "en";

  const button = document.getElementById("languageBtn");
  const welcome = document.getElementById("welcomeText");
  const quoteHeading = document.querySelector(".quote-card h3");
  const quote = document.getElementById("quote");
  const prayer = document.getElementById("prayer");

  if (button) {
    button.textContent = language === "en" ? "EN" : "TL";
  }

  if (welcome) {
    welcome.textContent = language === "en"
      ? "Welcome, Student!"
      : "Maligayang pagdating, Mag-aaral!";
  }

  if (quoteHeading) {
    quoteHeading.textContent = language === "en"
      ? "Today's Motivation"
      : "Inspirasyon Ngayon";
  }

  if (quote) {
    quote.textContent = language === "en"
      ? "Small steps every day lead to big achievements."
      : "Ang maliliit na hakbang araw-araw ay nagdadala sa malaking tagumpay.";
  }

  if (prayer) {
    prayer.textContent = language === "en"
      ? "Lord, guide my mind, strengthen my focus, and help me understand what I am about to learn. Amen."
      : "Panginoon, gabayan Mo ang aking isipan, palakasin ang aking pokus, at tulungan akong maunawaan ang aking pag-aaralan. Amen.";
  }

  localStorage.setItem("language", language);
}


// ==========================================
// SOUND EFFECTS
// ==========================================

function playStudySound(type = "click") {
  if (!studySoundEnabled) return;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.type = "sine";

  if (type === "success") {
    oscillator.frequency.setValueAtTime(523, audio.currentTime);
    oscillator.frequency.setValueAtTime(659, audio.currentTime + 0.12);
    oscillator.frequency.setValueAtTime(784, audio.currentTime + 0.24);
  } else {
    oscillator.frequency.setValueAtTime(600, audio.currentTime);
  }

  gain.gain.setValueAtTime(0.08, audio.currentTime);

  const duration = type === "success" ? 0.4 : 0.12;

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + duration
  );

  oscillator.start();
  oscillator.stop(audio.currentTime + duration);

  oscillator.onended = () => audio.close();
}


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function initializeApp() {
  const name = localStorage.getItem("studentName");
  const nameInput = document.getElementById("studentName");
  const welcome = document.getElementById("welcomeText");

  if (name) {
    if (nameInput) nameInput.value = name;
    if (welcome) welcome.textContent = "Welcome, " + name + "!";
  }

  updateDashboard();
  updateTimerDisplay();

  // Restore saved language
  if (language === "tl") {
    language = "en";
    toggleLanguage();
  }

  // Set default calendar date
  const calendarDate = document.getElementById("calendarDate");

  if (calendarDate) {
    const today = new Date();

    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    calendarDate.value = localDate;
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
// ==========================================
// HELP AND TUTORIAL
// ==========================================

function showTutorial() {
  const modal = document.getElementById("tutorialModal");

  if (modal) {
    modal.hidden = false;
  }
}

function closeTutorial() {
  const modal = document.getElementById("tutorialModal");

  if (modal) {
    modal.hidden = true;
  }
}
function updateTutorialLanguage() {
  const isTagalog = language === "TL";

  const english = {
    title: "📚 STUDYSMART GUIDE",
    intro: "Welcome! Here's how to use your study companion.",
    titles: [
      "1. 🏠 Dashboard",
      "2. 📅 Create Your Study Plan",
      "3. ✅ Manage Your Tasks",
      "4. ⏱️ Study Timer",
      "5. 🗓️ Study Calendar",
      "6. 📊 Track Your Progress",
      "7. 👤 Student Profile"
    ],
    texts: [
      "View your motivation, prayer, task summary, and quick access buttons.",
      "Enter your subject, topic, deadline, priority, and study hours. Add more tasks if needed, then tap Generate My Study Plan.",
      "Add your activities and mark them complete when finished.",
      "Choose your study duration and tap Start. Use Pause or Reset when needed.",
      "Select a date to check your scheduled activities.",
      "Check your completed tasks and progress percentage.",
      "Enter your name and save your profile."
    ],
    footer: "✨ Plan your time. Stay focused. Achieve your goals!",
    done: "Got It!"
  };

  const tagalog = {
    title: "📚 GABAY SA PAGGAMIT NG STUDYSMART",
    intro: "Maligayang pagdating! Narito ang gabay sa paggamit ng iyong katuwang sa pag-aaral.",
    titles: [
      "1. 🏠 Dashboard",
      "2. 📅 Gumawa ng Study Plan",
      "3. ✅ Pamahalaan ang mga Gawain",
      "4. ⏱️ Study Timer",
      "5. 🗓️ Study Calendar",
      "6. 📊 Subaybayan ang Iyong Progreso",
      "7. 👤 Profile ng Mag-aaral"
    ],
    texts: [
      "Makikita rito ang iyong inspirasyon, panalangin, buod ng mga gawain, at mga shortcut.",
      "Ilagay ang asignatura, paksa, deadline, prayoridad, at oras ng pag-aaral. Magdagdag pa ng gawain kung kinakailangan, pagkatapos ay pindutin ang Generate My Study Plan.",
      "Magdagdag ng iyong mga gawain at markahan ang mga ito bilang kumpleto kapag natapos na.",
      "Piliin ang tagal ng iyong pag-aaral at pindutin ang Start. Gamitin ang Pause o Reset kung kinakailangan.",
      "Pumili ng petsa upang makita ang mga nakatakdang gawain.",
      "Tingnan ang bilang ng iyong mga natapos na gawain at porsiyento ng iyong progreso.",
      "Ilagay ang iyong pangalan at pindutin ang Save Profile upang mai-save ang iyong impormasyon."
    ],
    footer: "✨ Ayusin ang oras. Magpokus sa pag-aaral. Abutin ang iyong mga pangarap!",
    done: "Naiintindihan Ko!"
  };

  const content = isTagalog ? tagalog : english;

  document.getElementById("tutorialTitle").textContent = content.title;
  document.getElementById("tutorialIntro").textContent = content.intro;
  document.getElementById("tutorialFooter").textContent = content.footer;
  document.getElementById("tutorialDone").textContent = content.done;

  for (let i = 0; i < 7; i++) {
    document.getElementById(`guide${i + 1}Title`).textContent = content.titles[i];
    document.getElementById(`guide${i + 1}Text`).textContent = content.texts[i];
  }
}

function showTutorial() {
  updateTutorialLanguage();

  const modal = document.getElementById("tutorialModal");
  if (modal) modal.hidden = false;
}

function closeTutorial() {
  const modal = document.getElementById("tutorialModal");
  if (modal) modal.hidden = true;
}