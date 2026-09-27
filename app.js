// ==== Элементы App Shell ====
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach((btn) => btn.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    if (page === 'home') initNotes();
  } catch (err) {
    contentDiv.innerHTML =
      '<p class="is-center text-error">Ошибка загрузки страницы.</p>';
    console.error(err);
  }
}

homeBtn.addEventListener('click', () => {
  setActiveButton('home-btn');
  loadContent('home');
});
aboutBtn.addEventListener('click', () => {
  setActiveButton('about-btn');
  loadContent('about');
});

// Стартовая страница
loadContent('home');

// ==== Логика заметок ====
function initNotes() {
  const form = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  const reminderForm = document.getElementById('reminder-form');
  const reminderText = document.getElementById('reminder-text');
  const reminderTime = document.getElementById('reminder-time');
  const list = document.getElementById('notes-list');

  if (!form || !list) return;

  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (!notes.length) {
      list.innerHTML = '<li class="is-center">Заметок пока нет</li>';
      return;
    }
    list.innerHTML = notes
      .map((note) => {
        let reminderInfo = '';
        if (note.reminder) {
          const date = new Date(note.reminder);
          reminderInfo = `<br><small>🔔 Напоминание: ${date.toLocaleString()}</small>`;
        }
        return `<li class="card" style="margin-bottom: 0.5rem; padding: 0.5rem;">
          ${note.text}${reminderInfo}
        </li>`;
      })
      .join('');
  }

  function addNote(text, reminderTimestamp = null) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const newNote = {
      id: Date.now(),
      text,
      reminder: reminderTimestamp,
      createdAt: new Date().toISOString(),
    };
    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();

    // Опционально: отправка на сервер через WebSocket
    if (typeof socket !== 'undefined' && socket) {
      socket.emit('newTask', newNote);
    }
  }

  // Обычная заметка
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addNote(text);
      input.value = '';
    }
  });

  // Заметка с напоминанием
  if (reminderForm) {
    reminderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = reminderText.value.trim();
      const time = reminderTime.value;
      if (!text || !time) return;
      const reminderTimestamp = new Date(time).getTime();
      if (reminderTimestamp <= Date.now()) {
        alert('Дата напоминания должна быть в будущем');
        return;
      }
      addNote(text, reminderTimestamp);
      reminderText.value = '';
      reminderTime.value = '';
    });
  }

  loadNotes();
}

// ==== Регистрация Service Worker ====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('SW зарегистрирован:', reg.scope))
      .catch((err) => console.error('Ошибка регистрации SW:', err));
  });
}