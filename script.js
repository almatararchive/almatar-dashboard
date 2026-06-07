/**
 * Dashboard - Script
 * All functionality: page navigation, editable rows, localStorage persistence,
 * stats calculation, student filtering, CSV export.
 */

// ===== PAGE NAVIGATION ======
const pageMeta = {
  dashboard: ['لوحة التحكم', 'متابعة المهام والإحصائيات'],
  students: ['المتفوقون', 'قائمة الطلاب المتفوقين'],
  timeline: ['الجدول الزمني', 'خطة التحضير وبرنامج الحفل'],
  budget: ['الميزانية', 'إدارة المصروفات والتمويل'],
  team: ['الفريق', 'أعضاء الفريق والرعاة'],
  program: ['برنامج الحفل', 'السكربت والتجهيزات'],
  tips: ['نصائح وطوارئ', 'أسرار النجاح وخطة الطوارئ'],
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });

  var pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(function (n) {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + id + "'")) {
      n.classList.add('active');
    }
  });

  document.getElementById('page-title').textContent = pageMeta[id][0];
  document.getElementById('page-sub').textContent = pageMeta[id][1];
  updateStats();
}

// ===== SIDEBAR TOGGLE (mobile) =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== ROW CONFIGURATIONS =====
const rowConfigs = {
  tasks: {
    cols: [
      { type: 'text', ph: 'اسم المهمة' },
      { type: 'text', ph: 'المسؤول' },
      { type: 'text', ph: 'الموعد' },
      { type: 'select', opts: ['لم تبدأ', 'جارية', 'مكتملة', 'متأخرة'], colors: ['gray', 'blue', 'green', 'red'] },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  urgent: {
    cols: [
      { type: 'text', ph: 'الأولوية' },
      { type: 'text', ph: 'المسؤول' },
      { type: 'text', ph: 'الموعد' },
      { type: 'select', opts: ['عاجل', 'مهم', 'عادي'], colors: ['red', 'gold', 'gray'] },
    ]
  },
  students: {
    cols: [
      { type: 'text', ph: 'اسم الطالب' },
      { type: 'select', opts: ['ابتدائي', 'متوسط', 'ثانوي'], colors: ['gold', 'blue', 'green'] },
      { type: 'text', ph: 'الصف / الفصل' },
      { type: 'select', opts: ['ذكر', 'أنثى'], colors: ['blue', 'red'] },
      { type: 'number', ph: '%' },
      { type: 'text', ph: 'نوع التميز' },
      { type: 'select', opts: ['لم يستلم', 'جاهز', 'مستلم'], colors: ['gray', 'gold', 'green'] },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  prep: {
    cols: [
      { type: 'text', ph: 'اليوم' },
      { type: 'text', ph: 'التاريخ' },
      { type: 'text', ph: 'المهمة الرئيسية' },
      { type: 'text', ph: 'المسؤول' },
      { type: 'number', ph: '0' },
      { type: 'select', opts: ['لم تبدأ', 'جارية', 'مكتملة', 'متأخرة'], colors: ['gray', 'blue', 'green', 'red'] },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  'program-time': {
    cols: [
      { type: 'text', ph: 'الوقت' },
      { type: 'text', ph: 'الفقرة' },
      { type: 'text', ph: 'المدة' },
      { type: 'text', ph: 'المسؤول' },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  budget: {
    cols: [
      { type: 'text', ph: 'اسم البند' },
      { type: 'number', ph: '0' },
      { type: 'number', ph: '0' },
      { type: 'text', ph: 'طريقة التوفير' },
    ]
  },
  funding: {
    cols: [
      { type: 'text', ph: 'المصدر' },
      { type: 'number', ph: '0' },
      { type: 'select', opts: ['لم يبدأ', 'جارٍ', 'مكتمل'], colors: ['gray', 'gold', 'green'] },
    ]
  },
  expenses: {
    cols: [
      { type: 'text', ph: 'التاريخ' },
      { type: 'text', ph: 'البيان' },
      { type: 'number', ph: '0' },
    ]
  },
  team: {
    cols: [
      { type: 'text', ph: 'الاسم الكامل' },
      { type: 'text', ph: 'الدور' },
      { type: 'text', ph: '05xxxxxxxx' },
      { type: 'text', ph: 'المهمة الرئيسية' },
      { type: 'select', opts: ['نشط', 'غائب', 'احتياطي'], colors: ['green', 'red', 'gray'] },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  workers: {
    cols: [
      { type: 'text', ph: 'الدور' },
      { type: 'number', ph: '1' },
      { type: 'text', ph: 'طريقة التوظيف' },
      { type: 'number', ph: '0' },
      { type: 'text', ph: 'المهام' },
    ]
  },
  contacts: {
    cols: [
      { type: 'text', ph: 'الجهة أو الاسم' },
      { type: 'text', ph: 'نوع الدعم' },
      { type: 'text', ph: 'رقم التواصل' },
      { type: 'text', ph: 'المبلغ أو الدعم' },
      { type: 'select', opts: ['لم يتواصل', 'تم التواصل', 'وافق', 'اعتذر'], colors: ['gray', 'blue', 'green', 'red'] },
    ]
  },
  script: {
    cols: [
      { type: 'text', ph: 'اسم الفقرة' },
      { type: 'textarea', ph: 'النص أو المحتوى...' },
      { type: 'text', ph: 'المدة' },
      { type: 'text', ph: 'المقدم' },
    ]
  },
  supplies: {
    cols: [
      { type: 'text', ph: 'اسم العنصر' },
      { type: 'text', ph: 'الكمية' },
      { type: 'select', opts: ['لم يُجهَّز', 'جارٍ', 'جاهز'], colors: ['gray', 'gold', 'green'] },
      { type: 'text', ph: 'المسؤول' },
      { type: 'text', ph: 'ملاحظة' },
    ]
  },
  tips: {
    cols: [
      { type: 'text', ph: 'النصيحة' },
      { type: 'textarea', ph: 'التفاصيل...' },
      { type: 'select', opts: ['عالية', 'متوسطة', 'عادية'], colors: ['red', 'gold', 'gray'] },
    ]
  },
  emergency: {
    cols: [
      { type: 'text', ph: 'المشكلة المحتملة' },
      { type: 'text', ph: 'الحل الفوري' },
      { type: 'text', ph: 'المسؤول' },
    ]
  }
};

var rowCounters = {};

// ===== ADD ROW =====
function addRow(tbodyId, type, data) {
  var tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  var cfg = rowConfigs[type];
  if (!cfg) return;
  if (!rowCounters[tbodyId]) rowCounters[tbodyId] = 0;
  rowCounters[tbodyId]++;
  var num = rowCounters[tbodyId];

  var tr = document.createElement('tr');
  tr.dataset.type = type;

  // Row number
  var tdNum = document.createElement('td');
  tdNum.innerHTML = '<span style="padding:0 14px;color:var(--text-muted);font-size:12px">' + num + '</span>';
  tr.appendChild(tdNum);

  cfg.cols.forEach(function (col, i) {
    var td = document.createElement('td');
    if (col.type === 'select') {
      var sel = document.createElement('select');
      sel.className = 'cell';
      col.opts.forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
      });
      if (data && data[i] !== undefined) sel.value = data[i];
      sel.addEventListener('change', function () { updateStats(); saveData(); });
      td.appendChild(sel);
    } else if (col.type === 'textarea') {
      var ta = document.createElement('textarea');
      ta.className = 'cell';
      ta.placeholder = col.ph || '';
      ta.rows = 2;
      ta.style.minHeight = '60px';
      if (data && data[i] !== undefined) ta.value = data[i];
      ta.addEventListener('input', function () { updateStats(); saveData(); });
      td.appendChild(ta);
    } else {
      var inp = document.createElement('input');
      inp.type = col.type === 'number' ? 'number' : 'text';
      inp.className = 'cell';
      inp.placeholder = col.ph || '';
      if (col.type === 'number') { inp.min = 0; }
      if (data && data[i] !== undefined) inp.value = data[i];
      inp.addEventListener('input', function () { updateStats(); saveData(); });
      td.appendChild(inp);
    }
    tr.appendChild(td);
  });

  // Delete button
  var tdDel = document.createElement('td');
  var delBtn = document.createElement('button');
  delBtn.className = 'icon-btn delete';
  delBtn.textContent = '✕';
  delBtn.title = 'حذف الصف';
  delBtn.onclick = function () { tr.remove(); updateStats(); saveData(); };
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  tbody.appendChild(tr);
  updateStats();

  // Focus first input
  var first = tr.querySelector('input,select,textarea');
  if (first) first.focus();
}

// ===== UPDATE STATISTICS =====
function updateStats() {
  // Students
  var sRows = document.querySelectorAll('#students-body tr');
  var total = sRows.length, ibt = 0, mwt = 0, than = 0;
  sRows.forEach(function (r) {
    var sel = r.querySelectorAll('select')[0];
    if (sel) {
      if (sel.value === 'ابتدائي') ibt++;
      else if (sel.value === 'متوسط') mwt++;
      else if (sel.value === 'ثانوي') than++;
    }
  });
  setText('st-total', total);
  setText('st-ibt', ibt);
  setText('st-mwt', mwt);
  setText('st-than', than);
  setText('stat-total', total);

  // Tasks
  var tRows = document.querySelectorAll('#tasks-body tr');
  var done = 0, late = 0;
  tRows.forEach(function (r) {
    var sel = r.querySelectorAll('select')[0];
    if (sel) {
      if (sel.value === 'مكتملة') done++;
      if (sel.value === 'متأخرة') late++;
    }
  });
  setText('stat-tasks', done + '/' + tRows.length);
  setText('stat-urgent', late);

  // Budget
  var planned = 0, actual = 0;
  document.querySelectorAll('#budget-body tr').forEach(function (r) {
    var inps = r.querySelectorAll('input[type=number]');
    if (inps[0]) planned += parseFloat(inps[0].value) || 0;
    if (inps[1]) actual += parseFloat(inps[1].value) || 0;
  });
  var funding = 0;
  document.querySelectorAll('#funding-body tr').forEach(function (r) {
    var inp = r.querySelector('input[type=number]');
    if (inp) funding += parseFloat(inp.value) || 0;
  });
  var expenses = 0;
  document.querySelectorAll('#expenses-body tr').forEach(function (r) {
    var inp = r.querySelector('input[type=number]');
    if (inp) expenses += parseFloat(inp.value) || 0;
  });
  setText('budget-total', planned);
  setText('budget-spent', expenses);
  setText('budget-remain', planned - expenses);
  setText('stat-budget', planned);
  setText('budget-planned-total', planned);
  setText('budget-actual-total', actual);
  setText('funding-total', funding);
  setText('expenses-total', expenses);
}

function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}

// ===== STUDENT FILTER =====
function filterStudents() {
  var q = document.getElementById('student-search').value;
  var stage = document.getElementById('stage-filter').value;
  var shield = document.getElementById('shield-filter').value;
  document.querySelectorAll('#students-body tr').forEach(function (r) {
    var cells = r.querySelectorAll('input,select');
    var name = '', stg = '', sh = '';
    if (cells[0]) name = cells[0].value;
    if (cells[1]) stg = cells[1].value;
    if (cells[6]) sh = cells[6].value;
    var show = name.includes(q) && (!stage || stg === stage) && (!shield || sh === shield);
    r.style.display = show ? '' : 'none';
  });
}

// ===== SAVE / LOAD (localStorage) =====
function saveData() {
  var data = {};
  var tableIds = [
    'tasks-body', 'urgent-body', 'students-body', 'prep-body', 'program-body',
    'budget-body', 'funding-body', 'expenses-body', 'team-body', 'workers-body',
    'contacts-body', 'script-body', 'supplies-body', 'tips-body', 'emergency-body'
  ];
  tableIds.forEach(function (id) {
    data[id] = [];
    document.querySelectorAll('#' + id + ' tr').forEach(function (tr) {
      var type = tr.dataset.type;
      var vals = [];
      tr.querySelectorAll('input,select,textarea').forEach(function (el) {
        vals.push(el.value);
      });
      data[id].push({ type: type, vals: vals });
    });
  });
  try { localStorage.setItem('ceremony_data', JSON.stringify(data)); } catch (e) {}
}

function loadData() {
  try {
    var raw = localStorage.getItem('ceremony_data');
    if (!raw) return;
    var data = JSON.parse(raw);
    Object.entries(data).forEach(function (_ref) {
      var id = _ref[0], rows = _ref[1];
      rows.forEach(function (r) {
        if (r.type) addRow(id, r.type, r.vals);
      });
    });
  } catch (e) {}
}

// ===== EXPORT CSV =====
function exportCSV() {
  var students = [];
  document.querySelectorAll('#students-body tr').forEach(function (tr, i) {
    var vals = [];
    tr.querySelectorAll('input,select,textarea').forEach(function (el) {
      vals.push(el.value);
    });
    students.push((i + 1) + ',' + vals.join(','));
  });
  var header = 'الرقم,الاسم,المرحلة,الصف,الجنس,المعدل,التميز,الدرع,ملاحظة';
  var csv = '\uFEFF' + header + '\n' + students.join('\n');
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'المتفوقون.csv';
  a.click();
}

// ===== INIT =====
loadData();
updateStats();
