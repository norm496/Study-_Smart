
// ==========================================
// STUDYSMART APPLICATION
// Your Smart Companion in Studying
// ==========================================

// ---------- APP DATA ----------
function loadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error("Unable to load " + key, error);
    return [];
  }
}

let schedules = loadArray("schedules");
let tasks = loadArray("tasks");

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
  } else {
    console.warn("Page not found:", pageId);
  }

  playStudySound("click");
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
  playStudySound("success");
}


// ==========================================
// DISPLAY SCHEDULES
// ==========================================

function renderSchedules() {
  const list = document.getElementById("scheduleList");
  if (!list) return;

  list.innerHTML = "";

  const heading = document.createElement("h3");
  heading.textContent = "My Study Schedules";
  list.appendChild(heading);

  schedules.forEach(schedule => {
    const item = document.createElement("div");
    item.className = "item-card";

    const details = document.createElement("p");
    details.textContent =
      schedule.subject + " | " + schedule.date +
      " | " + schedule.start + " - " + schedule.end;

    const remove = document.createElement("button");
    remove.type = "button";
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

  playStudySound("click");
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
    name,
    deadline,
    done: false
  });

  saveData();

  input.value = "";
  if (deadlineInput) deadlineInput.value = "";

  playStudySound("success");
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
    complete.type = "button";
    complete.textContent = task.done ? "Undo" : "Complete";

    complete.onclick = () => {
      task.done = !task.done;
      saveData();
    };

    const remove = document.createElement("button");
    remove.type = "button";
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
// SMART STUDY SCHEDULE GENERATOR
// Exact Time + Unavailable Periods + Breaks
// ==========================================

// ADD UNAVAILABLE TIME
function addUnavailableTime() {
  const container = document.getElementById("unavailableTimes");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "unavailable-row";

  row.innerHTML = `
    <label>Unavailable From</label>
    <input type="time" class="unavailable-start" value="12:00">

    <label>Unavailable Until</label>
    <input type="time" class="unavailable-end" value="13:00">

    <button type="button" class="remove-unavailable">
      Remove
    </button>
    <hr>
  `;

  row.querySelector(".remove-unavailable").onclick = () => {
    row.remove();
  };

  container.appendChild(row);
}


// ADD ANOTHER TASK INPUT
function addTaskInput() {
  const container = document.getElementById("taskInputs");
  if (!container) return;

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

    <button type="button" class="remove-task">
      Remove Task
    </button>
    <hr>
  `;

  form.querySelector(".remove-task").onclick = () => {
    form.remove();
  };

  container.appendChild(form);
}


// ==========================================
// TIME UTILITIES
// ==========================================

function timeToMinutes(time) {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function formatStudyTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return displayHour + ":" +
    String(mins).padStart(2, "0") + " " + period;
}

function formatTimeRange(start, end) {
  return formatStudyTime(start) + " – " + formatStudyTime(end);
}

function makeDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function intervalsOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}


// ==========================================
// CHECK AVAILABLE TIME
// ==========================================

function isTimeAvailable(start, end, unavailable, booked) {
  const overlapsUnavailable = unavailable.some(period =>
    intervalsOverlap(start, end, period.start, period.end)
  );

  const overlapsBooked = booked.some(period =>
    intervalsOverlap(start, end, period.start, period.end)
  );

  return !overlapsUnavailable && !overlapsBooked;
}


// ==========================================
// FIND ONE-HOUR STUDY SLOT
// ==========================================

function findStudySlot(windowStart, windowEnd, unavailable, booked) {
  const studyDuration = 60;
  const breakDuration = 5;

  for (
    let start = windowStart;
    start + studyDuration + breakDuration <= windowEnd;
    start += 5
  ) {
    const studyEnd = start + studyDuration;
    const breakEnd = studyEnd + breakDuration;

    if (
      isTimeAvailable(
        start,
        breakEnd,
        unavailable,
        booked
      )
    ) {
      return {
        studyStart: start,
        studyEnd,
        breakStart: studyEnd,
        breakEnd
      };
    }
  }

  return null;
}


// ==========================================
// GENERATE STUDY PLAN
// ==========================================

function generateStudySchedule() {
  const output = document.getElementById("generatedSchedule");

  if (!output) {
    alert("Schedule display area not found.");
    return;
  }

  // PREFERRED STUDY HOURS
  const startTime = document.getElementById("availableStart")?.value;
  const endTime = document.getElementById("availableEnd")?.value;

  if (!startTime || !endTime) {
    alert("Please select your preferred study hours.");
    return;
  }

  const windowStart = timeToMinutes(startTime);
  const windowEnd = timeToMinutes(endTime);

  if (windowEnd <= windowStart) {
    alert("Your ending time must be later than your starting time. Overnight study windows are not supported.");
    return;
  }

  // UNAVAILABLE PERIODS
  const unavailable = [];

  const unavailableRows = document.querySelectorAll(
    "#unavailableTimes .unavailable-row"
  );

  for (const row of unavailableRows) {
    const start = row.querySelector(".unavailable-start")?.value;
    const end = row.querySelector(".unavailable-end")?.value;

    if (!start || !end) {
      alert("Please complete all unavailable time fields.");
      return;
    }

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (
      endMinutes <= startMinutes ||
      startMinutes < windowStart ||
      endMinutes > windowEnd
    ) {
      alert("Unavailable periods must be valid and within your preferred study hours.");
      return;
    }

    unavailable.push({
      start: startMinutes,
      end: endMinutes
    });
  }

  unavailable.sort((a, b) => a.start - b.start);

  for (let i = 1; i < unavailable.length; i++) {
    if (unavailable[i].start < unavailable[i - 1].end) {
      alert("Your unavailable time periods overlap. Please correct them.");
      return;
    }
  }

  // TASK INFORMATION
  const forms = document.querySelectorAll(
    "#taskInputs .task-input"
  );

  const tasksToPlan = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const form of forms) {
    const subject = form.querySelector(".subject")?.value.trim() || "";
    const topic = form.querySelector(".topic")?.value.trim() || "";
    const deadline = form.querySelector(".deadline")?.value || "";
    const priority = form.querySelector(".priority")?.value || "Medium";
    const hoursValue = form.querySelector(".hours")?.value || "";

    if (!subject && !topic && !deadline) continue;

    if (!subject || !topic || !deadline || !hoursValue) {
      alert("Please complete all fields in every task you started.");
      return;
    }

    const hours = Number(hoursValue);
    const dueDate = new Date(deadline + "T00:00:00");

    if (!Number.isInteger(hours) || hours < 1 || hours > 8) {
      alert("Study hours must be between 1 and 8.");
      return;
    }

    if (Number.isNaN(dueDate.getTime()) || dueDate < today) {
      alert("Please select a valid deadline that is today or later.");
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

  if (!tasksToPlan.length) {
    alert("Please enter at least one complete task.");
    return;
  }

  // SORT BY DEADLINE AND PRIORITY
  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
  };

  tasksToPlan.sort((a, b) =>
    a.deadline.localeCompare(b.deadline) ||
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // CREATE AVAILABLE DATES
  const dates = [];

  const latestDeadline = new Date(
    Math.max(
      ...tasksToPlan.map(task =>
        new Date(task.deadline + "T00:00:00").getTime()
      )
    )
  );

  for (
    let date = new Date(today);
    date <= latestDeadline;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date));
  }

  // PREPARE DAILY SCHEDULE
  const plan = {};
  const bookedByDate = {};
  const unscheduled = [];

  dates.forEach(date => {
    const key = makeDateKey(date);
    plan[key] = [];
    bookedByDate[key] = [];
  });

  // ALLOCATE STUDY SESSIONS
  tasksToPlan.forEach(task => {
    const dueDate = new Date(task.deadline + "T00:00:00");

    const availableDates = dates.filter(date =>
      date <= dueDate
    );

    let remainingSessions = task.hours;

    for (
      let session = 0;
      session < task.hours;
      session++
    ) {
      if (remainingSessions <= 0) break;

      const preferredIndex = Math.floor(
        session * availableDates.length / task.hours
      );

      const searchOrder = [
        ...availableDates.slice(preferredIndex),
        ...availableDates.slice(0, preferredIndex)
      ];

      let placed = false;

      for (const date of searchOrder) {
        const dateKey = makeDateKey(date);

        const slot = findStudySlot(
          windowStart,
          windowEnd,
          unavailable,
          bookedByDate[dateKey]
        );

        if (!slot) continue;

        plan[dateKey].push({
          type: "study",
          subject: task.subject,
          topic: task.topic,
          priority: task.priority,
          deadline: task.deadline,
          start: slot.studyStart,
          end: slot.studyEnd
        });

        plan[dateKey].push({
          type: "break",
          subject: "📱 Social Media Break",
          topic: "Enjoy a 5-minute break!",
          start: slot.breakStart,
          end: slot.breakEnd
        });

        bookedByDate[dateKey].push({
          start: slot.studyStart,
          end: slot.breakEnd
        });

        remainingSessions--;
        placed = true;
        break;
      }

      if (!placed) break;
    }

    if (remainingSessions > 0) {
      unscheduled.push({
        subject: task.subject,
        remaining: remainingSessions,
        deadline: task.deadline
      });
    }
  });

  // DISPLAY GENERATED PLAN
  output.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "✦ Your Generated Study Plan ✦";
  output.appendChild(heading);

  const intro = document.createElement("p");
  intro.textContent =
    "Your study sessions are arranged according to your deadlines, priorities, preferred hours, and unavailable periods.";
  output.appendChild(intro);

  let totalStudySessions = 0;
  let totalBreaks = 0;

  Object.keys(plan).sort().forEach(dateKey => {
    const items = plan[dateKey].sort(
      (a, b) => a.start - b.start
    );

    // Remove the final break of the day.
    const studyIndexes = items
      .map((item, index) => item.type === "study" ? index : -1)
      .filter(index => index !== -1);

    if (studyIndexes.length) {
      const lastStudyIndex = studyIndexes[studyIndexes.length - 1];

      const nextBreak = items.findIndex(
        (item, index) =>
          index > lastStudyIndex && item.type === "break"
      );

      if (nextBreak !== -1) {
        items.splice(nextBreak, 1);
      }
    }

    if (!items.length) return;

    const dayCard = document.createElement("div");
    dayCard.className = "generated-day";

    const dayHeading = document.createElement("h3");

    dayHeading.textContent =
      new Date(dateKey + "T00:00:00").toLocaleDateString(
        language === "tl" ? "fil-PH" : "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }
      );

    dayCard.appendChild(dayHeading);

    items.forEach(item => {
      const card = document.createElement("div");

      card.className = item.type === "break"
        ? "generated-task social-break"
        : "generated-task";

      const time = document.createElement("p");
      time.className = "schedule-time";
      time.textContent = formatTimeRange(item.start, item.end);

      const title = document.createElement("h4");
      title.textContent = item.subject;

      const details = document.createElement("p");

      if (item.type === "break") {
        details.textContent = "5-minute social media break";
        totalBreaks++;
      } else {
        details.textContent =
          item.topic + " | " +
          item.priority + " Priority | Deadline: " +
          item.deadline;

        totalStudySessions++;
      }

      card.append(time, title, details);
      dayCard.appendChild(card);
    });

    output.appendChild(dayCard);
  });

  // UNSCHEDULED TASKS WARNING
  if (unscheduled.length) {
    const warning = document.createElement("div");
    warning.className = "schedule-warning";

    const warningTitle = document.createElement("h3");
    warningTitle.textContent = "⚠️ Some Sessions Need More Time";

    const message = document.createElement("p");
    message.textContent =
      "Some requested study hours could not fit before their deadlines. Consider extending your study availability or adjusting your study hours.";

    warning.append(warningTitle, message);

    unscheduled.forEach(task => {
      const p = document.createElement("p");
      p.textContent =
        task.subject + ": " + task.remaining +
        " hour(s) still unscheduled. Deadline: " +
        task.deadline;

      warning.appendChild(p);
    });

    output.appendChild(warning);
  }

  // SUMMARY
  const summary = document.createElement("p");
  summary.textContent =
    "Total study sessions: " + totalStudySessions +
    " | Social media breaks: " + totalBreaks;

  output.appendChild(summary);

  // SAVE GENERATED PLAN
  localStorage.setItem(
    "generatedStudyPlan",
    JSON.stringify(plan)
  );

  localStorage.setItem(
    "studyAvailability",
    JSON.stringify({
      startTime,
      endTime,
      unavailable
    })
  );

  output.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  playStudySound("success");

  alert(
    unscheduled.length
      ? "Your study plan was generated, but some hours could not be scheduled."
      : "Your study plan has been generated successfully!"
  );
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
      schedule.subject + " (" +
      schedule.start + " - " + schedule.end + ")";

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
// STUDENT PROFILE
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
    welcome.textContent =
      language === "en"
        ? "Welcome, " + name + "!"
        : "Maligayang pagdating, " + name + "!";
  }

  if (message) {
    message.textContent =
      language === "en"
        ? "Profile saved successfully!"
        : "Matagumpay na na-save ang profile!";
  }

  playStudySound("success");
  }


// ==========================================
// LANGUAGE
// ==========================================

function toggleLanguage() {
  language = language === "en" ? "tl" : "en";

  localStorage.setItem("language", language);

  applyLanguage();
}

function applyLanguage() {
  const button = document.getElementById("languageBtn");
  const welcome = document.getElementById("welcomeText");
  const quoteHeading = document.querySelector(".quote-card h3");
  const quote = document.getElementById("quote");
  const prayer = document.getElementById("prayer");

  if (button) {
    button.textContent = language === "en" ? "EN" : "TL";
  }

  const savedName = localStorage.getItem("studentName");

  if (welcome) {
    welcome.textContent = savedName
      ? (language === "en"
          ? "Welcome, " + savedName + "!"
          : "Maligayang pagdating, " + savedName + "!")
      : (language === "en"
          ? "Welcome, Student!"
          : "Maligayang pagdating, Mag-aaral!");
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

  updateTutorialLanguage();
}


// ==========================================
// SOUND EFFECTS
// ==========================================

function playStudySound(type = "click") {
  if (!studySoundEnabled) return;

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  try {
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
  } catch (error) {
    console.warn("Sound could not be played:", error);
  }
}


// ==========================================
// HELP AND TUTORIAL
// ==========================================

function showTutorial() {
  const modal = document.getElementById("tutorialModal");

  if (modal) {
    modal.hidden = false;
    updateTutorialLanguage();
  }
}

function closeTutorial() {
  const modal = document.getElementById("tutorialModal");

  if (modal) {
    modal.hidden = true;
  }
}

function updateTutorialLanguage() {
  const isTagalog = language === "tl";

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
      "Tingnan ang iyong inspirasyon, panalangin, buod ng mga gawain, at mga shortcut.",
      "Ilagay ang asignatura, paksa, deadline, prayoridad, at oras ng pag-aaral. Magdagdag ng iba pang gawain kung kinakailangan, pagkatapos ay pindutin ang Generate My Study Plan.",
      "Magdagdag ng mga gawain at markahan ang mga ito kapag natapos na.",
      "Piliin ang tagal ng pag-aaral at pindutin ang Start. Gamitin ang Pause o Reset kung kinakailangan.",
      "Pumili ng petsa upang makita ang iyong mga nakatakdang gawain.",
      "Tingnan ang mga natapos na gawain at porsiyento ng iyong progreso.",
      "Ilagay ang iyong pangalan at i-save ang iyong profile."
    ],
    footer: "✨ Planuhin ang oras. Magpokus. Abutin ang iyong mga pangarap!",
    done: "Naiintindihan Ko!"
  };

  const content = isTagalog ? tagalog : english;

  const titleElement = document.getElementById("tutorialTitle");
  const introElement = document.getElementById("tutorialIntro");
  const footerElement = document.getElementById("tutorialFooter");
  const doneElement = document.getElementById("tutorialDone");

  if (titleElement) titleElement.textContent = content.title;
  if (introElement) introElement.textContent = content.intro;
  if (footerElement) footerElement.textContent = content.footer;
  if (doneElement) doneElement.textContent = content.done;

  for (let i = 0; i < 7; i++) {
    const title = document.getElementById("guide" + (i + 1) + "Title");
    const text = document.getElementById("guide" + (i + 1) + "Text");

    if (title) title.textContent = content.titles[i];
    if (text) text.textContent = content.texts[i];
  }
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

function initializeApp() {
  const name = localStorage.getItem("studentName");
  const nameInput = document.getElementById("studentName");

  if (name && nameInput) {
    nameInput.value = name;
  }

  updateDashboard();
  updateTimerDisplay();
  applyLanguage();

  // Set today's date in the calendar
  const calendarDate = document.getElementById("calendarDate");

  if (calendarDate) {
    const today = new Date();

    calendarDate.value = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");
  }
}


// ==========================================
// START APPLICATION
// ==========================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

      