
// STUDYSMART APPLICATION

let schedules = JSON.parse(localStorage.getItem("schedules") || "[]");
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let seconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let language = "en";

// SAVE DATA
function saveData() {
  localStorage.setItem("schedules", JSON.stringify(schedules));
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateDashboard();
}

// NAVIGATION
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");
}

// DASHBOARD
function updateDashboard() {
  document.getElementById("totalTasks").textContent = tasks.length;

  let completed = tasks.filter(task => task.done).length;

  document.getElementById("completedTasks").textContent = completed;

  let percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";

  document.getElementById("progressText").textContent =
    percent === 100 ? "Excellent work!" : "Keep going!";

  renderTasks();
  renderSchedules();
}

// ADD SCHEDULE
function addSchedule() {
  let subject = document.getElementById("subject").value.trim();
  let date = document.getElementById("studyDate").value;
  let start = document.getElementById("startTime").value;
  let end = document.getElementById("endTime").value;

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

function renderSchedules() {
  let list = document.getElementById("scheduleList");

  list.innerHTML = "<h3>My Study Schedules</h3>";

  schedules.forEach(schedule => {
    let item = document.createElement("div");
    item.className = "item-card";

    let details = document.createElement("p");
    details.textContent =
      schedule.subject + " | " + schedule.date +
      " | " + schedule.start + " - " + schedule.end;

    let remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.onclick = () => {
      schedules = schedules.filter(s => s.id !== schedule.id);
      saveData();
    };

    item.append(details, remove);
    list.appendChild(item);
  });
}

// TIMER
function updateTimerDisplay() {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  document.getElementById("timerDisplay").textContent =
    String(minutes).padStart(2, "0") + ":" +
    String(remainingSeconds).padStart(2, "0");
}

function startTimer() {
  if (timerRunning) return;

  if (seconds <= 0) {
    seconds = Number(document.getElementById("timerMinutes").value) * 60;
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

  let minutes = Number(document.getElementById("timerMinutes").value);

  if (!Number.isFinite(minutes) || minutes < 1) minutes = 25;

  seconds = minutes * 60;
  updateTimerDisplay();
}

// ADD TASK
function addTask() {
  let name = document.getElementById("taskInput").value.trim();
  let deadline = document.getElementById("taskDeadline").value;

  if (!name) {
    alert("Please enter a task.");
    return;
  }

  tasks.push({
    id: Date.now(),
    name,
    deadline,
    done: false
  });

  saveData();

  document.getElementById("taskInput").value = "";
  document.getElementById("taskDeadline").value = "";
}

// DISPLAY TASKS
function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach(task => {
    let card = document.createElement("div");
    card.className = "item-card";

    let title = document.createElement("p");
    title.textContent =
      (task.done ? "✓ " : "") + task.name;

    let deadline = document.createElement("p");
    deadline.textContent = task.deadline
      ? "Deadline: " + task.deadline
      : "No deadline";

    let complete = document.createElement("button");
    complete.textContent = task.done ? "Undo" : "Complete";

    complete.onclick = () => {
      task.done = !task.done;
      saveData();
    };

    let remove = document.createElement("button");
    remove.textContent = "Delete";

    remove.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveData();
    };

    card.append(title, deadline, complete, remove);
    list.appendChild(card);
  });
}

// CALENDAR
function showCalendarTasks() {
  let date = document.getElementById("calendarDate").value;
  let results = document.getElementById("calendarResults");

  if (!date) {
    alert("Please select a date.");
    return;
  }

  results.innerHTML = "";

  let matchingSchedules = schedules.filter(s => s.date === date);
  let matchingTasks = tasks.filter(t => t.deadline === date);

  let heading = document.createElement("h3");
  heading.textContent = "Activities for " + date;
  results.appendChild(heading);

  [...matchingSchedules.map(s => ({
    text: s.subject + " (" + s.start + " - " + s.end + ")"
  })), ...matchingTasks.map(t => ({
    text: "Task: " + t.name
  }))].forEach(entry => {
    let p = document.createElement("p");
    p.textContent = entry.text;
    results.appendChild(p);
  });

  if (!matchingSchedules.length && !matchingTasks.length) {
    let p = document.createElement("p");
    p.textContent = "No activities scheduled.";
    results.appendChild(p);
  }
}

// PROFILE
function saveProfile() {
  let name = document.getElementById("studentName").value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  localStorage.setItem("studentName", name);

  document.getElementById("welcomeText").textContent =
    "Welcome, " + name + "!";

  document.getElementById("profileMessage").textContent =
    "Profile saved successfully!";
}

// LANGUAGE
function toggleLanguage() {
  language = language === "en" ? "tl" : "en";

  document.getElementById("languageBtn").textContent =
    language === "en" ? "EN" : "TL";

  document.getElementById("welcomeText").textContent =
    language === "en" ? "Welcome, Student!" : "Maligayang pagdating, Mag-aaral!";

  document.querySelector(".quote-card h3").textContent =
    language === "en" ? "Today's Motivation" : "Inspirasyon Ngayon";

  document.getElementById("quote").textContent =
    language === "en"
      ? "Small steps every day lead to big achievements."
      : "Ang maliliit na hakbang araw-araw ay nagdadala sa malaking tagumpay.";

  document.getElementById("prayer").textContent =
    language === "en"
      ? "Lord, guide my mind, strengthen my focus, and help me understand what I am about to learn. Amen."
      : "Panginoon, gabayan Mo ang aking isipan, palakasin ang aking pokus, at tulungan akong maunawaan ang aking pag-aaralan. Amen.";

  localStorage.setItem("language", language);
}

// INITIALIZE APP
function initializeApp() {
  let name = localStorage.getItem("studentName");

  if (name) {
    document.getElementById("studentName").value = name;
    document.getElementById("welcomeText").textContent =
      "Welcome, " + name + "!";
  }

  let savedLanguage = localStorage.getItem("language");

  if (savedLanguage === "tl") {
    language = "en";
    toggleLanguage();
  }

  updateDashboard();
  resetTimer();
}

initializeApp();
function generateStudySchedule() {
  const subject = document.getElementById("genSubject").value.trim();
  const topic = document.getElementById("genTopic").value.trim();
  const deadline = document.getElementById("genDeadline").value;
  const priority = document.getElementById("genPriority").value;
  const hours = Number(document.getElementById("genHours").value);

  if (!subject || !topic || !deadline || !hours) {
    alert("Please complete all fields.");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(deadline + "T00:00:00");

  if (dueDate < today) {
    alert("Please choose a future submission date.");
    return;
  }

  if (hours < 1 || hours > 12) {
    alert("Enter between 1 and 12 study hours.");
    return;
  }

  const priorityHours = {
    high: 2,
    medium: 1.5,
    low: 1
  };

  const studyHours = Math.min(hours, priorityHours[priority]);

  const schedule = {
    id: Date.now(),
    subject,
    topic,
    date: deadline,
    priority,
    hours: studyHours,
    completed: false
  };

  let schedules = JSON.parse(
    localStorage.getItem("schedules") || "[]"
  );

  schedules.push(schedule);

  localStorage.setItem("schedules", JSON.stringify(schedules));

  document.getElementById("generatedSchedule").innerHTML = `
    <h3>Your Suggested Study Plan</h3>
    <p><b>Subject:</b> ${subject}</p>
    <p><b>Topic:</b> ${topic}</p>
    <p><b>Study Duration:</b> ${studyHours} hour(s)</p>
    <p><b>Deadline:</b> ${deadline}</p>
    <p><b>Priority:</b> ${priority.toUpperCase()}</p>
    <p>Remember to take short breaks between study sessions!</p>
  `;

  alert("Your study plan has been saved!");
}