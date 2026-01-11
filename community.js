
/**
 * PlaceReady Community Forum - Vanilla JS Module
 * Handles interactions for posting, filtering, and viewing answers.
 */

// Mock Data
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    title: 'How deep do Google interviews go into DP?',
    desc: 'I am comfortable with basic Knapsack and LCS. Should I focus more on Bitmask DP and Digit DP for intern roles?',
    section: 'DSA',
    author: 'Rahul Sharma',
    role: 'Junior',
    time: '2 hours ago',
    answers: [
      {
        id: 'a1',
        author: 'Ishita Roy',
        role: 'Verified Senior',
        company: 'Amazon',
        text: 'For intern roles, standard DP is enough. Google focuses more on your ability to optimize recursion and identifying the state. Digit DP is rarely asked for interns unless you are targeting very high-end roles.',
        time: '1 hour ago'
      }
    ]
  },
  {
    id: 'q2',
    title: 'Is React still the king for placements?',
    desc: 'I see a lot of companies asking for Next.js or even Svelte. Should I stick to learning React internals or diversify my portfolio?',
    section: 'Web Dev',
    author: 'Aman Verma',
    role: 'Junior',
    time: '5 hours ago',
    answers: [
      {
        id: 'a2',
        author: 'Priya Malhotra',
        role: 'Verified Senior',
        company: 'Microsoft',
        text: 'Learn React internals. If you know React deeply, Next.js is a weekend effort. Most big tech companies still rely on React/Angular for their core products.',
        time: '4 hours ago'
      }
    ]
  }
];

// UI References
const questionsFeed = document.getElementById('questionsFeed');
const questionForm = document.getElementById('questionForm');
const submitBtn = document.getElementById('submitBtn');
const qTitle = document.getElementById('qTitle');
const qSection = document.getElementById('qSection');
const qDesc = document.getElementById('qDesc');
const formFeedback = document.getElementById('formFeedback');
const filterPills = document.querySelectorAll('.filter-pill');

// Global State
let currentFilter = 'All';

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  // Simulate loading
  setTimeout(() => {
    renderQuestions();
  }, 1000);

  // Event Listeners
  setupFormValidation();
  setupFilters();
});

/**
 * Rendering Logic
 */
function renderQuestions() {
  const filtered = currentFilter === 'All' 
    ? MOCK_QUESTIONS 
    : MOCK_QUESTIONS.filter(q => q.section === currentFilter);

  if (filtered.length === 0) {
    questionsFeed.innerHTML = `
      <div class="text-center py-20 bg-white rounded-[48px] border-4 border-dashed border-slate-100">
        <div class="text-6xl mb-6 grayscale opacity-20">🔍</div>
        <h3 class="text-2xl font-black text-slate-300">No discussions found in ${currentFilter}</h3>
        <p class="text-slate-400 font-bold mt-2">Be the first to start a thread here!</p>
      </div>
    `;
    return;
  }

  questionsFeed.innerHTML = filtered.map(q => `
    <div class="question-card bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]" id="card-${q.id}">
      <div class="p-10 md:p-14">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-200 uppercase">
              ${q.author.charAt(0)}
            </div>
            <div>
              <h4 class="font-black text-slate-900 leading-none mb-1">${q.author}</h4>
              <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">${q.role} • ${q.time}</p>
            </div>
          </div>
          <div class="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            ${q.section}
          </div>
        </div>

        <h3 class="text-3xl font-black text-slate-800 leading-tight tracking-tight mb-4">
          ${q.title}
        </h3>
        <p class="text-slate-500 font-medium leading-relaxed text-lg mb-8">
          ${q.desc}
        </p>

        <button 
          onclick="toggleAnswers('${q.id}')"
          class="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all"
        >
          <span id="btn-text-${q.id}">${q.answers.length > 0 ? `View ${q.answers.length} Answers` : 'Be the first to reply'}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div class="answer-container bg-slate-50/50 border-t border-slate-100">
        <div class="p-10 md:p-14 space-y-8">
          ${q.answers.map(ans => `
            <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex items-start gap-8">
              <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0">
                ${ans.author.charAt(0)}
              </div>
              <div class="flex-grow">
                <p class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                   <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                   ${ans.role} • ${ans.author}
                   <span class="text-slate-300 ml-2">@ ${ans.company}</span>
                </p>
                <p class="text-slate-600 font-medium leading-relaxed text-lg">
                  ${ans.text}
                </p>
              </div>
            </div>
          `).join('')}

          <!-- Reply Box -->
          <div class="reply-box rounded-[32px] p-2 flex flex-col md:flex-row items-center gap-2">
            <input 
              type="text" 
              placeholder="Provide verified guidance..." 
              class="w-full bg-transparent px-8 py-5 font-bold text-slate-800 outline-none placeholder:text-slate-400"
              id="reply-input-${q.id}"
            >
            <button 
              onclick="submitReply('${q.id}')"
              class="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              Post Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Interactions
 */
function toggleAnswers(id) {
  const card = document.getElementById(`card-${id}`);
  const btnText = document.getElementById(`btn-text-${id}`);
  const isExpanded = card.classList.toggle('expanded');
  
  if (isExpanded) {
    btnText.innerText = 'Collapse Discussion';
  } else {
    const q = MOCK_QUESTIONS.find(item => item.id === id);
    btnText.innerText = q.answers.length > 0 ? `View ${q.answers.length} Answers` : 'Be the first to reply';
  }
}

function submitReply(id) {
  const input = document.getElementById(`reply-input-${id}`);
  const text = input.value.trim();
  
  if (!text) return;

  // Fake success feedback
  const btn = input.nextElementSibling;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="success-check">✓</span> Sent`;
  btn.classList.add('bg-emerald-600');
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('bg-emerald-600');
    input.value = '';
    alert('Mock Answer Submitted! In a real app, this would update the feed via backend.');
  }, 1500);
}

/**
 * Form Handling
 */
function setupFormValidation() {
  const inputs = [qTitle, qSection, qDesc];
  
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const isValid = qTitle.value.trim() && qSection.value && qDesc.value.trim();
      submitBtn.disabled = !isValid;
    });
  });

  questionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate API call
    submitBtn.innerText = 'Publishing...';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Mock addition to local array
      const newQ = {
        id: 'q' + Date.now(),
        title: qTitle.value,
        desc: qDesc.value,
        section: qSection.value,
        author: 'Jason Miller',
        role: 'Junior',
        time: 'Just now',
        answers: []
      };
      
      MOCK_QUESTIONS.unshift(newQ);
      renderQuestions();

      // Reset Form
      questionForm.reset();
      submitBtn.innerText = 'Publish Inquiry';
      formFeedback.style.opacity = '1';
      
      setTimeout(() => {
        formFeedback.style.opacity = '0';
      }, 3000);
    }, 1200);
  });
}

/**
 * Filter Handling
 */
function setupFilters() {
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      
      // Animate feed change
      questionsFeed.style.opacity = '0';
      questionsFeed.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        renderQuestions();
        questionsFeed.style.opacity = '1';
        questionsFeed.style.transform = 'translateY(0)';
      }, 300);
    });
  });
}
