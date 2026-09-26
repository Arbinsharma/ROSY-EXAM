let db=window.ROSY_DATA||{}, selectedClass=localStorage.getItem('rosy.class')||'9';
let timer=null,timerSeconds=1500,quizState=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const storage=(k,v)=>v===undefined?localStorage.getItem(k):(localStorage.setItem(k,v),v);

const i18n={
 en:{personalStudentSpace:'PERSONAL STUDENT SPACE',welcomeTitle:'Welcome to Rosy.',welcomeText:'Your routine is only the beginning. Learn, play, track progress and make every study session count.',enterRosy:'Enter Rosy →',goodToSeeYou:'GOOD TO SEE YOU',chooseClass:'Choose your class',chooseClassText:'Your quizzes, subjects and study dashboard will adapt to it.',home:'Home',dailyChallenge:'Daily Challenge',classQuiz:'Class Quiz',examPlanner:'Exam Planner',examPrep:'Exam Prep',studyBooks:'Study Books',teachers:'Teacher Finder',focusMode:'Focus Mode',aboutMe:'About Me',contact:'Contact',settings:'Settings',changeClass:'Choose Another Class',studentDashboard:'STUDENT DASHBOARD',todayLabel:'TODAY',upcomingExams:'Upcoming Exams'},
 ne:{personalStudentSpace:'विद्यार्थीको व्यक्तिगत स्पेस',welcomeTitle:'Rosy मा स्वागत छ।',welcomeText:'तपाईंको रुटिन सुरुवात मात्र हो। सिक्नुहोस्, क्विज खेल्नुहोस्, प्रगति ट्र्याक गर्नुहोस् र पढाइलाई प्रभावकारी बनाउनुहोस्।',enterRosy:'Rosy खोल्नुहोस् →',goodToSeeYou:'तपाईंलाई देखेर खुसी लाग्यो',chooseClass:'आफ्नो कक्षा छान्नुहोस्',chooseClassText:'तपाईंको क्विज, विषय र अध्ययन ड्यासबोर्ड कक्षाअनुसार बदलिनेछ।',home:'गृहपृष्ठ',dailyChallenge:'दैनिक चुनौती',classQuiz:'कक्षा क्विज',examPlanner:'परीक्षा योजना',examPrep:'परीक्षा तयारी',studyBooks:'पढाइका पुस्तक',teachers:'शिक्षक खोजी',focusMode:'फोकस मोड',aboutMe:'मेरो बारेमा',contact:'सम्पर्क',settings:'सेटिङ',changeClass:'अर्को कक्षा छान्नुहोस्',studentDashboard:'विद्यार्थी ड्यासबोर्ड',todayLabel:'आज',upcomingExams:'आगामी परीक्षा'}
};
let lang=storage('rosy.lang')||'en';
function tr(k){return i18n[lang]?.[k]||i18n.en[k]||k}
function applyLanguage(){document.documentElement.lang=lang==='ne'?'ne':'en';$$('[data-i18n]').forEach(el=>el.textContent=tr(el.dataset.i18n));$('#langBtn').textContent=lang==='en'?'ने':'EN';}

const subjectMap={
 '10':['Mathematics','English','Nepali','Science','Social Studies','Optional Mathematics','Computer'],
 '9':['Mathematics','Optional Mathematics','Science','English','Nepali','Social Studies','Computer'],
 '8':['Mathematics','English','Nepali','Science','Social Studies','Health & Physical Education','Computer'],
 '7':['Mathematics','English','Nepali','Science','Social Studies','Health & Physical Education','Computer'],
 '6':['Mathematics','English','Nepali','Science','Social Studies','Health & Physical Education','Computer'],
 '5':['Mathematics','English','Nepali','Science & Environment','Social Studies','Health & Physical Education','Computer'],
 '4':['Mathematics','English','Nepali','Science & Environment','Social Studies','Health & Physical Education'],
 '3':['Mathematics','English','Nepali','Science & Environment','Social Studies','Creative Arts'],
 '2':['Mathematics','English','Nepali','Science & Environment','Social Studies','Creative Arts'],
 '1':['Mathematics','English','Nepali','Our Environment','Creative Arts','Health'],
 'ukg':['English','Nepali','Mathematics','Our Environment','Creative Activities'],
 'lkg':['English','Nepali','Mathematics','Our Environment','Creative Activities'],
 'nursery':['English','Nepali','Numbers','Our Environment','Creative Activities']
};
const unitTemplates={
 Mathematics:['Number Sense','Operations','Fractions & Decimals','Geometry','Measurement','Patterns & Algebra','Data & Probability'],
 English:['Reading','Vocabulary','Grammar','Writing','Speaking & Listening'],
 Nepali:['पठन','शब्दभण्डार','व्याकरण','लेखन','अभिव्यक्ति'],
 Science:['Living Things','Matter & Materials','Energy','Earth & Environment','Health & Safety'],
 'Social Studies':['Family & Community','Civic Life','Geography','History & Culture','Our Responsibilities'],
 'Optional Mathematics':['Algebra','Geometry','Trigonometry','Statistics','Problem Solving'],
 Computer:['Computer Basics','Digital Safety','Files & Data','Internet Skills','Problem Solving'],
 'Health & Physical Education':['Personal Health','Nutrition','Physical Fitness','Safety','Healthy Habits'],
 'Science & Environment':['Living World','Matter','Energy','Environment','Health'],
 'Our Environment':['My Family','My School','Nature Around Us','Safety','Community'],
 'Creative Arts':['Lines & Shapes','Colour','Craft','Music & Rhythm','Creative Expression'],
 Health:['Healthy Body','Food & Hygiene','Safety','Movement','Good Habits'],
 Numbers:['Counting','Shapes','Comparing','Simple Operations','Patterns'],
 'Creative Activities':['Drawing','Colouring','Music','Movement','Making Things']
};
function subjectsForClass(){return subjectMap[selectedClass]||['Mathematics','English','Nepali','Science','Social Studies'];}
function unitsFor(subject){
 const exact=db.chapters?.[selectedClass]?.[subject];
 if(exact?.length && !exact[0].startsWith('Use the official'))return exact;
 return unitTemplates[subject]||['Unit 1','Unit 2','Unit 3','Unit 4','Unit 5'];
}

// Small, class-aware question bank. Grade 9 uses the verified unit names supplied in the project data.
function questionBank(cls,subject,unit){
 const level=Number(cls)||5;
 const q=[];
 const add=(question,options,answer,explain='')=>q.push({question,options,answer,explain});
 if(subject==='Mathematics'){
  if(unit==='Sets') {add('Which symbol means “belongs to”?',['∈','⊂','∪','∅'],0,'∈ means an element belongs to a set.');add('A set with no elements is called…',['Universal set','Empty set','Finite set','Equal set'],1,'The empty set has no elements.');}
  else if(unit==='Profit and Loss'){add('If cost price is 100 and selling price is 120, the profit is…',['10','15','20','25'],2);add('Profit percent is calculated on…',['Selling price','Cost price','Marked price only','Tax'],1);}
  else if(unit==='Fractions & Decimals'){add('Which is equal to 0.5?',['1/2','1/3','2/5','3/5'],0);add('3/4 as a decimal is…',['0.25','0.5','0.75','1.25'],2);}
  else {add(`In ${unit}, which habit helps solve problems accurately?`,['Read the question carefully','Skip units','Guess immediately','Ignore working'],0,'Careful reading is a reliable first step.');add(`Which approach is useful in ${unit}?`,['Show working','Hide steps','Change the question','Avoid checking'],0);}
 } else if(subject==='English'){
  if(unit==='Grammar'){add('Choose the correct sentence.',['She go to school.','She goes to school.','She going school.','She gone school.'],1);add('The past tense of “go” is…',['goed','gone','went','going'],2);}
  else if(unit==='Vocabulary'){add('A synonym of “rapid” is…',['slow','quick','quiet','weak'],1);add('An antonym of “ancient” is…',['old','historic','modern','early'],2);}
  else {add(`What should you do first when reading a ${unit} text?`,['Understand the main idea','Memorize every word','Skip the title','Ignore context'],0);add('Which improves clear writing?',['Organized ideas','Random sentences','No punctuation','Only long words'],0);}
 } else if(subject==='Nepali'){
  add(`'${unit}' अभ्यास गर्दा कुन कुरा उपयोगी हुन्छ?`,['पाठ बुझेर पढ्ने','अर्थ नहेर्ने','सबै कुरा अनुमान गर्ने','प्रश्न छोड्ने'],0);add('सही लेखाइका लागि कुन कुरा महत्त्वपूर्ण छ?',['हिज्जे र विरामचिह्न','केवल लामो शब्द','चित्र मात्र','उत्तर नजाँच्ने'],0);
 } else if(subject==='Science' || subject==='Science & Environment'){
  if(unit==='Energy'){add('Which form of energy helps us see?',['Light','Sound','Chemical','Gravitational'],0);add('Plants mainly use which energy source for photosynthesis?',['Solar energy','Sound energy','Wind only','Magnetic energy'],0);}
  else if(unit==='Living Things'){add('The basic unit of life is the…',['Atom','Cell','Tissue','Organ'],1);add('Plants make food mainly in their…',['Roots','Leaves','Flowers','Seeds'],1);}
  else {add(`Which is a good scientific habit in ${unit}?`,['Observe and record evidence','Guess without checking','Ignore evidence','Copy every answer'],0);add('A fair experiment should change…',['Many variables at once','One main variable','Nothing','The result'],1);}
 } else if(subject==='Social Studies'){
  add(`Which skill is useful when studying ${unit}?`,['Compare evidence and viewpoints','Memorize without context','Ignore sources','Avoid questions'],0);add('A responsible citizen should…',['Respect rights and responsibilities','Ignore rules','Damage public property','Spread rumors'],0);
 } else if(subject==='Optional Mathematics'){
  add(`Which skill is central to ${unit}?`,['Logical problem solving','Guessing','Skipping steps','Ignoring definitions'],0);add('When solving mathematics, checking the final answer can…',['Catch mistakes','Make work impossible','Remove understanding','Change the question'],0);
 } else if(subject==='Computer'){
  add('Which is safer online?',['Using unique strong passwords','Sharing passwords publicly','Opening every unknown link','Using the same password everywhere'],0);add('A file is usually stored on a…',['Storage device','Keyboard key','Speaker only','Mouse pad'],0);
 } else {
  add(`Which is a useful way to learn ${unit}?`,['Practice a little and review','Never practise','Only guess','Skip examples'],0);add('A good study session should have…',['A clear small goal','No goal','Constant distractions','No break ever'],0);
 }
 // class-specific difficulty nudge
 if(level<=3) add('What should you do when a question feels hard?',['Ask, think, and try again','Give up immediately','Close the book','Skip learning forever'],0);
 else add('If you make a mistake, the best learning move is to…',['Check why and try again','Hide it','Repeat without thinking','Stop studying'],0);
 return q.slice(0,3);
}

function buildClasses(){const g=$('#classGrid'),s=$('#defaultClass');g.innerHTML=db.classes.map(c=>`<button type="button" data-c="${esc(c.id)}"><b>${esc(c.name.replace('Grade ','').replace('Nursery','N').replace('UKG','U'))}</b><small>${esc(c.name)}</small></button>`).join('');s.innerHTML=db.classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');s.value=selectedClass;$$('[data-c]').forEach(b=>b.onclick=()=>choose(b.dataset.c));}
function choose(id){selectedClass=id;storage('rosy.class',id);$('#classModal').classList.add('hidden');$('#welcome').classList.add('hidden');$('#app').classList.remove('hidden');renderAll();closeMenu();toast(`${db.classes.find(c=>c.id===id)?.name||'Class'} selected ✨`);}
function state(date){const a=new Date(),b=new Date(date+'T00:00:00'),t=new Date(a.getFullYear(),a.getMonth(),a.getDate()),d=Math.round((b-t)/86400000);return d<0?'completed':d===0?'today':d===1?'tomorrow':'upcoming'}
function days(date){const a=new Date(),b=new Date(date+'T00:00:00'),t=new Date(a.getFullYear(),a.getMonth(),a.getDate());return Math.round((b-t)/86400000)}
function fmt(d){return new Intl.DateTimeFormat(lang==='ne'?'ne-NP':'en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(d+'T00:00:00'))}
function list(){return db.exams.filter(e=>e.classId===selectedClass).sort((a,b)=>a.date.localeCompare(b.date))}
function card(e){const s=state(e.date),d=days(e.date),label=s==='completed'?'Completed':s==='today'?'EXAM TODAY':s==='tomorrow'?'Tomorrow':`${d} Days Left`;return `<article class="exam-card ${s==='completed'?'completed':''}"><div class="meta">${fmt(e.date)}</div><h3>${esc(e.subject)}</h3><div class="meta">${esc(e.time)}</div><span class="status ${s==='today'?'today-status':''}">${label}</span><button class="notify-exam ghost" data-exam="${esc(e.id)}" type="button">${storage('notify.'+e.id)==='1'?'🔔 Alerts on':'🔔 Notify me'}</button></article>`}
function renderHome(){const cls=db.classes.find(c=>c.id===selectedClass),all=list(),up=all.filter(e=>state(e.date)!=='completed'),next=up[0];const now=new Date(),h=now.getHours();const part=h<12?'morning':h<17?'afternoon':'evening';$('#homeGreeting').textContent=`Good ${part}, Arbin 👋`;$(`#classLabel`).textContent=`${cls?.name||''} · Your personal study cockpit.`;$('#navClass').textContent=cls?.name||'';$('#today').textContent=new Intl.DateTimeFormat(lang==='ne'?'ne-NP':'en-US',{month:'short',day:'numeric',year:'numeric'}).format(now);$('#dateLarge').textContent=new Intl.DateTimeFormat(lang==='ne'?'ne-NP':'en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(now);
 $('#nextExam').innerHTML=next?`<div><p class="eyebrow">NEXT EXAM · ${esc(cls?.name||'').toUpperCase()}</p><h2>${esc(next.subject)}</h2><p class="muted">${fmt(next.date)} · ${esc(next.time)}</p><button class="primary smallbtn" data-page="prep" type="button">Prepare for this →</button></div><div class="days">${days(next.date)===0?'TODAY':days(next.date)===1?'1 DAY':days(next.date)+' DAYS'}</div>`:`<div><h2>No upcoming exams</h2><p class="muted">Your visible routine is complete.</p></div>`;
 $('#upcoming').innerHTML=up.slice(0,4).map(card).join('')||`<div class="empty glass">No upcoming exams.</div>`;bindNotifyButtons();updateXP();}
function renderPlanner(){const f=$('#filter').value,l=list().filter(e=>f==='all'||state(e.date)===f);$('#allExams').innerHTML=l.map(card).join('')||`<div class="empty glass">No exams match this filter.</div>`;bindNotifyButtons();}
function bindNotifyButtons(){$$('.notify-exam').forEach(b=>b.onclick=()=>toggleExamNotification(b.dataset.exam));}
async function toggleExamNotification(id){const ok=await ensureNotification();if(!ok)return;const on=storage('notify.'+id)==='1';storage('notify.'+id,on?'0':'1');renderHome();renderPlanner();updateNotifyDot();toast(on?'Exam alert removed':'Exam alert enabled 🔔');}
async function ensureNotification(){if(!('Notification' in window)){toast('This browser does not support notifications.');return false}if(Notification.permission==='granted')return true;const p=await Notification.requestPermission();if(p!=='granted'){toast('Notification permission was not granted.');return false}return true;}
async function testNotification(){const ok=await ensureNotification();if(!ok){toast('Try Rosy on HTTPS or localhost for browser notifications.');return}try{new Notification('Rosy test notification 🔔',{body:'It works! Rosy can remind you about exams on this device.',icon:'assets/profile.jpg'});toast('Test notification sent 🔔')}catch(e){toast('Notification could not be shown here. Try HTTPS/localhost.')}}
function renderTeachers(){const q=($('#teacherSearch')?.value||'').trim().toLowerCase(),rows=(db.teachers||[]).filter(t=>!q||t.name.toLowerCase().includes(q));$('#teacherCount').textContent=`${rows.length} found`;$('#teacherResults').innerHTML=rows.map(t=>`<article class="teacher-card glass"><div class="avatar">${esc(t.name.slice(0,1))}</div><div><h3>${esc(t.name)}</h3><p class="meta">${esc(t.department||'Teacher')} · ${esc(t.jobType||'')}</p><strong>${esc(t.phone||'No number supplied')}</strong></div><div class="teacher-actions">${t.phone?`<a class="ghost" href="tel:${esc(t.phone)}">Call</a><a class="ghost" target="_blank" rel="noopener" href="https://wa.me/977${esc(t.phone)}">WhatsApp</a>`:''}</div></article>`).join('')||`<div class="empty glass">No matching teacher found.</div>`;}
function renderPrep(){const sub=$('#prepSubject'),subs=subjectsForClass();sub.innerHTML=subs.map(x=>`<option>${esc(x)}</option>`).join('');updateChapters();}
function updateChapters(){const sub=$('#prepSubject').value,chs=unitsFor(sub),saved=JSON.parse(storage('rosy.studied.'+selectedClass+'.'+sub)||'[]');$('#chapterGrid').innerHTML=chs.map(c=>`<label class="chapter ${saved.includes(c)?'checked':''}"><input type="checkbox" value="${esc(c)}" ${saved.includes(c)?'checked':''}> <span>${esc(c)}</span></label>`).join('');let book=(db.resources?.[selectedClass]||[]).find(x=>x.subject.toLowerCase()===sub.toLowerCase());$('#bookLink').href=book?.url||db.resources?.all||'#';$$('#chapterGrid input').forEach(x=>x.onchange=()=>x.parentElement.classList.toggle('checked',x.checked));}
function finishPrep(){const sub=$('#prepSubject').value,sel=$$('#chapterGrid input:checked').map(x=>x.value);storage('rosy.studied.'+selectedClass+'.'+sub,JSON.stringify(sel));$('#marksCard').classList.remove('hidden');$('#prepResult').classList.add('hidden');gainXP(sel.length?10:2);toast(sel.length?`${sel.length} chapter${sel.length>1?'s':''} saved 📚`:'Prep skipped — you can still quiz yourself');}
function finishMarks(m){const sub=$('#prepSubject').value,sel=JSON.parse(storage('rosy.studied.'+selectedClass+'.'+sub)||'[]');$('#marksCard').classList.add('hidden');$('#prepResult').classList.remove('hidden');$('#prepResult').innerHTML=`<div class="result-inner"><p class="eyebrow">PREP PLAN READY</p><h2>${sel.length} unit${sel.length!==1?'s':''} · ${m} marks</h2><p class="muted">Start with the selected units, then take the matching class quiz. Your choices are saved on this device.</p><div class="progressbar"><span style="width:${Math.min(100,sel.length*14)}%"></span></div><button class="primary smallbtn" data-page="quiz" type="button">Take a class quiz →</button></div>`;gainXP(8);}
function buildBooks(){const grid=$('#booksGrid'),arr=db.resources?.[selectedClass]||[];grid.innerHTML=arr.length?arr.map(b=>`<a class="book-card glass" target="_blank" rel="noopener" href="${esc(b.url)}"><span>📖</span><b>${esc(b.subject)}</b><strong>${esc(b.title)}</strong><small>Official CDC resource ↗</small></a>`).join(''):`<div class="empty glass">Use the official CDC catalogue to find the current textbook set for this class. Rosy does not invent official chapter names.</div>`;}
function renderQuizControls(){const s=$('#quizSubject'),c=$('#quizChapter');s.innerHTML=subjectsForClass().map(x=>`<option>${esc(x)}</option>`).join('');c.innerHTML=unitsFor(s.value).map(x=>`<option>${esc(x)}</option>`).join('');}
function startQuiz(){const subject=$('#quizSubject').value,unit=$('#quizChapter').value,questions=questionBank(selectedClass,subject,unit);quizState={subject,unit,questions,index:0,score:0};paintQuestion();}
function paintQuestion(){const q=quizState?.questions[quizState.index];if(!q)return;$('#quizArea').innerHTML=`<div class="quiz-progress"><span>Question ${quizState.index+1}/${quizState.questions.length}</span><div><i style="width:${(quizState.index/quizState.questions.length)*100}%"></i></div></div><article class="question-card"><p class="eyebrow">${esc(quizState.subject)} · ${esc(quizState.unit)}</p><h2>${esc(q.question)}</h2><div class="answers">${q.options.map((o,i)=>`<button type="button" data-answer="${i}">${esc(o)}</button>`).join('')}</div></article>`;$$('[data-answer]').forEach(b=>b.onclick=()=>answerQuiz(Number(b.dataset.answer)));}
function answerQuiz(i){const q=quizState.questions[quizState.index],correct=i===q.answer;$$('[data-answer]').forEach((b,n)=>{b.disabled=true;b.classList.toggle('correct',n===q.answer);b.classList.toggle('wrong',n===i&&i!==q.answer)});if(correct){quizState.score++;gainXP(5);toast('Correct! +5 XP ✨')}else toast('Not quite — check the explanation.');const exp=document.createElement('div');exp.className='answer-explain';exp.innerHTML=`<b>${correct?'Correct!':'Keep learning.'}</b> ${esc(q.explain||'Review the unit and try again.')}`;$('#quizArea').appendChild(exp);setTimeout(()=>{quizState.index++;quizState.index<quizState.questions.length?paintQuestion():finishQuiz()},650);}
function finishQuiz(){const total=quizState.questions.length,score=quizState.score,percent=Math.round(score/total*100);gainXP(10);$('#quizArea').innerHTML=`<div class="quiz-result"><div class="score-orb">${percent}%</div><p class="eyebrow">QUIZ COMPLETE</p><h2>${score}/${total} correct</h2><p class="muted">${percent>=80?'Strong session. Keep the streak moving.':percent>=50?'Good start. Review the missed unit and retry.':'Use the chapter again, then give it another shot.'}</p><button id="retryQuiz" class="primary" type="button">Try again →</button></div>`;$('#retryQuiz').onclick=startQuiz;storage('rosy.quiz.'+selectedClass+'.'+quizState.subject+'.'+quizState.unit,String(percent));updateXP();}
function challengeKey(){return new Date().toISOString().slice(0,10)}
function renderChallenge(){const done=storage('rosy.challenge.'+challengeKey())==='1',seed=(new Date().getDate()+Number(selectedClass.replace(/\D/g,'')||1))%3;const tasks=[['🎯','Speed Round','Take a 3-question class quiz.','Open Class Quiz'],['📚','Study Sprint','Mark one chapter as studied in Exam Prep.','Open Exam Prep'],['⏱','Focus Sprint','Complete a focus session for at least 60 seconds.','Open Focus Mode']];const t=tasks[seed];$('#dailyChallengeCard').innerHTML=`<div class="challenge-icon">${t[0]}</div><p class="eyebrow">TODAY ONLY</p><h2>${t[1]}</h2><p class="lead muted">${t[2]}</p><button id="challengeAction" class="primary" type="button">${done?'Completed ✓':t[3]+' →'}</button><button id="challengeClaim" class="ghost" type="button" ${done?'disabled':''}>${done?'XP claimed':'Claim +20 XP'}</button>`;$('#challengeAction').onclick=()=>{if(done)return;if(seed===0)show('quiz');else if(seed===1)show('prep');else show('focus')};$('#challengeClaim').onclick=()=>{if(storage('rosy.challenge.'+challengeKey())==='1')return;storage('rosy.challenge.'+challengeKey(),'1');gainXP(20);markStreak(true);renderChallenge();toast('Daily challenge complete! +20 XP 🏆')};$('#challengeStreak').textContent=Number(storage('rosy.streak.count')||0);$('#challengeXP').textContent=(Number(storage('rosy.xp')||0))+' XP';}
function updateXP(){const xp=Number(storage('rosy.xp')||0),level=xp%100;$('#xpFill').style.width=level+'%';$('#xpLabel').textContent=`${xp} XP`;$('#challengeXP').textContent=xp+' XP';$('#streakCount').textContent=`${Number(storage('rosy.streak.count')||0)} day${Number(storage('rosy.streak.count')||0)!==1?'s':''} 🔥`;}
function gainXP(n){storage('rosy.xp',String(Number(storage('rosy.xp')||0)+n));updateXP();}
function markStreak(force=false){const today=new Date().toISOString().slice(0,10),last=storage('rosy.streak.last');let count=Number(storage('rosy.streak.count')||0);if(last===today&&!force){ }else if(last){const diff=(new Date(today)-new Date(last))/86400000;if(diff<=1)count=Math.max(1,count+1);else count=1;storage('rosy.streak.count',String(count));storage('rosy.streak.last',today);}else{count=1;storage('rosy.streak.count','1');storage('rosy.streak.last',today);}updateXP();}
function show(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));closeMenu();window.scrollTo({top:0,behavior:document.body.classList.contains('motion-reduced')?'auto':'smooth'});if(id==='teachers')renderTeachers();if(id==='prep')renderPrep();if(id==='books')buildBooks();if(id==='quiz')renderQuizControls();if(id==='challenge')renderChallenge();}
function openGreeting(){const now=new Date(),h=now.getHours(),part=h<12?'morning':h<17?'afternoon':'evening';$('#greetingTitle').textContent=`Good ${part}, Arbin 👋`;$('#greetingText').textContent=part==='morning'?'Ready to make today count?':part==='afternoon'?'Still time for one useful win today.':'A short study win before you log off?';$('#greetingMissionText').textContent='Complete one class quiz or daily challenge and earn XP.';$('#greetingModal').classList.remove('hidden');}
function closeMenu(){$('#nav').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false');}
function toggleMenu(e){e?.stopPropagation();const open=$('#nav').classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',String(open));}
function updateNotifyDot(){const on=list().some(e=>storage('notify.'+e.id)==='1');$('#notifyDot').classList.toggle('on',on);}
function updateClock(){if(!$('#clock'))return;$('#clock').textContent=storage('rosy.clock')==='false'?'':new Intl.DateTimeFormat(lang==='ne'?'ne-NP':'en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'}).format(new Date())}
function applySettings(){document.body.classList.toggle('light',storage('rosy.theme')==='light');document.body.classList.toggle('motion-reduced',storage('rosy.motion')==='reduced');document.body.classList.toggle('motion-high',storage('rosy.motion')==='high');if($('#theme'))$('#theme').value=storage('rosy.theme')||'dark';if($('#motion'))$('#motion').value=storage('rosy.motion')||'normal';if($('#showClock'))$('#showClock').checked=storage('rosy.clock')!=='false';if($('#alerts'))$('#alerts').checked=storage('rosy.alerts')!=='false';updateClock();}
function toast(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200)}
function renderAll(){renderHome();renderPlanner();renderPrep();buildBooks();renderTeachers();renderQuizControls();renderChallenge();updateNotifyDot();markStreak();updateClock();}
function bind(){
 $('#welcomeStart').onclick=()=>{localStorage.setItem('rosy.welcomed','1');$('#welcome').classList.add('hidden');$('#app').classList.remove('hidden');openGreeting();};
 $('#greetingContinue').onclick=()=>{$('#greetingModal').classList.add('hidden');if(!storage('rosy.class'))$('#classModal').classList.remove('hidden');};
 $$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).classList.add('hidden'));
 $('#closeClass').onclick=()=>$('#classModal').classList.add('hidden');$('#changeClass').onclick=()=>{$('#classModal').classList.remove('hidden');closeMenu()};
 $('#menuBtn').onclick=toggleMenu;$('#navClose').onclick=closeMenu;$('#homeBtn').onclick=()=>show('home');
 $('#langBtn').onclick=()=>{lang=lang==='en'?'ne':'en';storage('rosy.lang',lang);applyLanguage();renderAll();toast(lang==='ne'?'नेपाली सक्रिय भयो 🇳🇵':'English enabled 🇬🇧');};
 $('#notifyBtn').onclick=async()=>{await ensureNotification();show('planner');};
 $('#filter').onchange=renderPlanner;$('#teacherSearch').oninput=renderTeachers;$('#prepSubject').onchange=updateChapters;$('#finishPrep').onclick=finishPrep;$('#skipPrep').onclick=()=>{toast('Prep skipped — return anytime');show('home')};$('#skipMarks').onclick=()=>{$('#marksCard').classList.add('hidden');toast('Marks target skipped')};
 $$('.marks button').forEach(b=>b.onclick=()=>finishMarks(b.dataset.marks));$('#startQuiz').onclick=startQuiz;$('#startTimer').onclick=startTimer;$('#resetTimer').onclick=resetTimer;
 $('#theme').onchange=e=>{storage('rosy.theme',e.target.value);applySettings()};$('#motion').onchange=e=>{storage('rosy.motion',e.target.value);applySettings()};$('#showClock').onchange=e=>{storage('rosy.clock',e.target.checked);updateClock()};$('#defaultClass').onchange=e=>choose(e.target.value);$('#alerts').onchange=e=>{storage('rosy.alerts',e.target.checked);toast(e.target.checked?'Exam alerts enabled':'Exam alerts disabled')};$('#enableNotifications').onclick=enableNotifications;$('#enableNotifications2').onclick=enableNotifications;$('#testNotification').onclick=testNotification;
 $$('.page,[data-page]').forEach(()=>{});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b){e.preventDefault();show(b.dataset.page);return}if($('#nav').classList.contains('open')&&!e.target.closest('#nav')&&!e.target.closest('#menuBtn'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();$('#greetingModal').classList.add('hidden');$('#classModal').classList.add('hidden')}});
 setInterval(updateClock,1000);setInterval(checkExamAlerts,60000);
}
async function enableNotifications(){const ok=await ensureNotification();if(ok){storage('rosy.alerts','true');$('#alerts').checked=true;toast('Browser notifications enabled 🔔');checkExamAlerts();}}
function checkExamAlerts(){if(storage('rosy.alerts')==='false'||!('Notification'in window)||Notification.permission!=='granted')return;const key=new Date().toISOString().slice(0,10);list().filter(e=>days(e.date)>=0&&days(e.date)<=1).forEach(e=>{if(storage('notify.'+e.id)==='1'&&storage('sent.'+e.id+'.'+key)!=='1'){try{new Notification(`Rosy Exam Alert: ${e.subject}`,{body:days(e.date)===0?'EXAM TODAY':`Exam tomorrow · ${e.time}`,icon:'assets/profile.jpg'});storage('sent.'+e.id+'.'+key,'1')}catch(e){}}});}
function startTimer(){if(timer){clearInterval(timer);timer=null;$('#startTimer').textContent='Start';$('#focusStatus').textContent='Paused — come back when ready.';return}$('#startTimer').textContent='Pause';$('#focusStatus').textContent='Focus sprint running…';timer=setInterval(()=>{timerSeconds--;paintTimer();if(timerSeconds<=0){clearInterval(timer);timer=null;$('#startTimer').textContent='Start';$('#focusStatus').textContent='Sprint complete 🎉';gainXP(15);toast('Focus sprint complete! +15 XP');}},1000)}
function resetTimer(){if(timer){clearInterval(timer);timer=null}timerSeconds=1500;paintTimer();$('#startTimer').textContent='Start';$('#focusStatus').textContent='Ready when you are.'}
function paintTimer(){$('#timer').textContent=`${String(Math.floor(timerSeconds/60)).padStart(2,'0')}:${String(timerSeconds%60).padStart(2,'0')}`}
function init(){buildClasses();bind();applyLanguage();applySettings();renderAll();paintTimer();if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});if(!storage('rosy.welcomed')){$('#welcome').classList.remove('hidden');}else{$('#welcome').classList.add('hidden');$('#app').classList.remove('hidden');openGreeting();}}
init();
