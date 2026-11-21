const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");
const COL=["#38bdf8","#a78bfa","#fbbf24","#34d399","#fb7185"];
/* ---------- LESSONS ---------- */
const L=[
{e:"📁",t:"Repository (repo)",p:"A project folder that remembers every change anyone ever made, who made it, and when. GitHub stores the shared copy in the cloud.",a:"Think Google Docs ‘version history’, but for a whole project.",c:"git init   # or create a repo on GitHub"},
{e:"⬇️",t:"Clone",p:"Download a full copy of the cloud repo onto your laptop so you can work on it.",a:"Photocopying the entire project binder to take home.",c:"git clone https://github.com/acme/shop.git"},
{e:"🌿",t:"Branch",p:"A safe side-lane of the project. You can experiment or add tests there without touching the main, working version (called main).",a:"A parallel universe: break things freely, main stays safe.",c:"git checkout -b qa-login",lab:1},
{e:"📦",t:"Stage & Commit",p:"Staging = choose which files go in the box. Commit = seal the box with a label. Each commit is a saved snapshot you can return to.",a:"Packing a parcel (add), then taping it shut and writing a label (commit).",c:'git add login.spec.js\ngit commit -m "Add login test"'},
{e:"🚀",t:"Push",p:"Upload your commits to GitHub so teammates (and robots) can see them. Until you push, your work exists only on your laptop.",a:"Posting the sealed parcel to the team’s warehouse.",c:"git push origin qa-login"},
{e:"🚧",t:"Pull Request (PR)",p:"A request: ‘Please review my branch and merge it into main.’ Teammates read the Files Changed diff (green = added, red = removed). As QA you are a gatekeeper: catch bugs here, before customers do.",a:"A checkpoint guard who inspects every parcel before it enters main.",c:"git fetch origin pull/42/head:pr-42\ngit switch pr-42"},
{e:"🔀",t:"Merge",p:"Once a PR is approved, its branch is combined into main. Git makes a ‘merge commit’ that joins the two timelines.",a:"Two rivers joining into one.",c:"git merge qa-login",lab:1},
{e:"🤖",t:"CI/CD & GitHub Actions",p:"A robot that automatically runs tests every time code is pushed, a PR opens, or on a schedule (e.g. nightly). Green ✔ = safe. Red ✘ = look at the logs and the screenshot artifact, then file a bug.",a:"A tireless night-shift tester that photographs every failure.",c:"# .github/workflows/nightly.yml  (see the CI/CD tab)",ci:1}];
/* ---------- CI FILES ---------- */
const FILES=[
{n:".github/workflows/nightly.yml",w:"The robot’s instructions. Runs on a nightly schedule or when you press ‘Run workflow’ (workflow_dispatch), runs the tests, and uploads screenshots only when something fails.",c:`name: Nightly Tests
on:
  schedule:
    - cron: '0 2 * * *'     # every night 02:00 UTC
  workflow_dispatch:         # manual "Run workflow" button
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()        # only when tests fail
        with:
          name: test-failure-screenshot
          path: test-results/`},
{n:".github/workflows/pr-check.yml",w:"The Quality Gate. Runs tests on every Pull Request; mark it ‘required’ in branch protection so a red PR can’t merge.",c:`name: PR Check
on:
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test`},
{n:"playwright.config.js",w:"Tells Playwright how to run: where tests live, retries, and to keep a screenshot when a test fails.",c:`// @ts-check
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://example.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});`},
{n:"tests/login.spec.js",w:"A tiny sample test. Replace the URL and selectors with your app’s.",c:`const { test, expect } = require('@playwright/test');

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'qa@example.com');
  await page.fill('#password', 'secret123');
  await page.click('#login-button');
  await expect(page.locator('h1')).toHaveText('Welcome');
});`},
{n:"package.json",w:"Lists the tools. ‘npm ci’ in the workflow installs exactly these.",c:`{
  "name": "shop-qa-tests",
  "version": "1.0.0",
  "scripts": { "test": "playwright test" },
  "devDependencies": { "@playwright/test": "^1.48.0" }
}`}];
/* ---------- PUZZLES ---------- */
const M=[
{tab:"1 · Git basics",story:"A developer built a Login Page. Clone the project, create a test branch, stage your test file, commit, and push to GitHub.",steps:[
{l:"git clone",c:"blue",p:"Download the project to your laptop.",h:"A local copy comes first.",e:"Not yet! Every command needs a project folder on your laptop, so clone first.",o:["$ git clone https://github.com/acme/shop.git","Cloning into 'shop'...","Receiving objects: 100% (128/128), done."]},
{l:"git checkout -b qa-login",c:"blue",p:"Create your safe branch.",h:"Make your safe lane before changing anything.",e:"Create the branch after cloning but BEFORE saving changes, so main stays clean.",o:["$ git checkout -b qa-login","Switched to a new branch 'qa-login'"]},
{l:"git add login.spec.js",c:"amber",p:"Put the test file in the box.",h:"Choose files before sealing.",e:"Staging picks files for your next save. Be on your own branch first, or you’d pack files on main!",o:["$ git add login.spec.js","(staged)"]},
{l:'git commit -m "Add login test"',c:"emerald",p:"Seal the box with a label.",h:"Seal after staging.",e:"A commit seals what’s staged. Nothing staged yet = nothing to seal.",o:['$ git commit -m "Add login test"',"[qa-login 3f9a1c2] Add login test"]},
{l:"git push origin qa-login",c:"purple",p:"Upload the branch to GitHub.",h:"Last step: post the box.",e:"Push uploads commits. You have none yet, so commit first.",o:["$ git push origin qa-login","* [new branch] qa-login -> qa-login"]}]},
{tab:"2 · Pull Requests",story:"Sam opened PR #42 (Checkout Button). Fetch his branch, switch to it, inspect the diff, and catch the bug before it merges into main.",steps:[
{l:"git fetch origin pull/42/head:pr-42",c:"purple",p:"Download Sam’s PR as branch pr-42.",h:"Bring Sam’s code to your laptop.",e:"You can’t switch to code that isn’t on your laptop. Fetch first.",o:["$ git fetch origin pull/42/head:pr-42","* [new ref] refs/pull/42/head -> pr-42"]},
{l:"git switch pr-42",c:"blue",p:"Move onto Sam’s branch.",h:"Switch after fetching.",e:"pr-42 doesn’t exist locally until you fetch it.",o:["$ git switch pr-42","Switched to branch 'pr-42'"]},
{l:'Inspect "Files Changed" Diff',c:"amber",p:"Read what was added/removed.",h:"Review once you’re on the branch.",e:"Review comes after you have the code. Fetch and switch first.",o:["Opening Files Changed... +14 -3","Flag the bug below!"]}]},
{tab:"3 · CI/CD robot",story:"Nightly tests turned RED. Trigger a manual run, watch the runner, read the failure logs, and download the screenshot artifact.",steps:[
{l:"Trigger: workflow_dispatch",c:"purple",p:"Press ‘Run workflow’ to wake the robot.",h:"Nothing runs until triggered.",e:"The robot sleeps until triggered. Start the workflow first.",o:["▶ 'Nightly Tests' triggered manually"]},
{l:"Step: npx playwright test",c:"blue",p:"The robot runs all browser tests.",h:"Trigger, then run tests.",e:"Tests run only after the workflow starts.",o:["$ npx playwright test","  11 passed","  ✘ 1 failed: checkout.spec.js › pay button"]},
{l:"Inspect Console Error Log",c:"rose",p:"Read why the test failed.",h:"Logs exist after tests ran.",e:"No logs until tests have run.",o:["Error: expect(locator).toBeEnabled()","  Locator: #pay-button   Received: disabled","  at checkout.spec.js:18"]},
{l:"Download: test-failure-screenshot.png",c:"amber",p:"Grab the robot’s photo of the failure.",h:"Screenshots are saved on failure.",e:"The screenshot exists once a test fails. Run tests and read logs first.",o:["⬇ test-failure-screenshot.png (84 KB)","Click the file to open it!"]}]}];
const PERM=[[2,4,0,3,1],[2,0,1],[3,1,0,2]];
const DIFF=[["c","  function CheckoutButton({ cart }) {"],["c","    const total = sum(cart);"],["d","-   disabled={cart.length === 0}"],["a","+   disabled={false}"],["a","+   onClick={() => pay(total)}"],["c","    return <button>Pay</button>;"]];
/* ---------- STATE ---------- */
const newG=()=>({c:[{id:1,b:"main",p:[]},{id:2,b:"main",p:[1]},{id:3,b:"main",p:[2]}],br:{main:3},lanes:["main"],cur:"main",nid:4,new:0,log:[],msg:"Welcome! You have a project with 3 commits on main. Try the buttons."});
const S={tab:"learn",card:0,seen:new Set([0]),G:newG(),file:0,ci:{n:0,fail:true},copied:"",pm:0,pl:[[],[],[]],term:[[],[],[]],bug:false,art:false,hint:false,modal:false,msg:{t:"info",x:"Click a block (or drag it into the tower) in the right order."},shake:false,dm:"",last:-1};
const pdone=i=>S.pl[i].length==M[i].steps.length&&(i==0||(i==1&&S.bug)||(i==2&&S.art));
/* ---------- GRAPH ---------- */
function reach(G,id){const s=new Set,st=[id];while(st.length){const x=st.pop();if(s.has(x))continue;s.add(x);G.c.find(c=>c.id==x).p.forEach(q=>st.push(q))}return s}
function graph(G,extra=""){const P=c=>({x:G.c.indexOf(c)*54+34,y:G.lanes.indexOf(c.b)*58+52});
 const W=G.c.length*54+80,H=G.lanes.length*58+56;let e="",n="",t="";
 G.c.forEach(c=>{const b=P(c);c.p.forEach((q,k)=>{const a=P(G.c.find(x=>x.id==q));e+=`<path class="${c.id==G.new?"edge":""}" d="M${a.x} ${a.y}C${a.x+27} ${a.y} ${b.x-27} ${b.y} ${b.x} ${b.y}" fill="none" stroke="${COL[G.lanes.indexOf(c.b)%5]}" stroke-width="3" ${k?'stroke-dasharray="6 4"':""} opacity=".9"/>`});
  n+=`<circle class="${c.id==G.new?"node":""}" cx="${b.x}" cy="${b.y}" r="11" fill="${COL[G.lanes.indexOf(c.b)%5]}" stroke="#0b1020" stroke-width="3"/>${c.p.length>1?`<text x="${b.x}" y="${b.y+4}" font-size="11" text-anchor="middle" fill="#0b1020">⑂</text>`:""}`});
 const seen={};Object.keys(G.br).forEach(k=>{const c=G.c.find(x=>x.id==G.br[k]),b=P(c),o=seen[c.id]=(seen[c.id]||0)+1,y=b.y-20-(o-1)*20,w=k.length*7+(k==G.cur?46:16),cur=k==G.cur;
  t+=`<g><rect x="${b.x-w/2}" y="${y-13}" width="${w}" height="17" rx="8" fill="${cur?"#fff":"#1e293b"}" stroke="${COL[G.lanes.indexOf(k)%5]}"/><text x="${b.x}" y="${y}" font-size="11" text-anchor="middle" fill="${cur?"#0b1020":"#e2e8f0"}" class="mono">${cur?"HEAD → ":""}${esc(k)}</text></g>`});
 return `<div class="overflow-x-auto"><svg width="${Math.max(W,300)}" height="${H}">${e}${n}${t}${extra}</svg></div>`}
function tip(G){const o=Object.keys(G.br).filter(b=>b!="main");if(!o.length)return"Step 1 → create a branch (e.g. qa-login). Watch a new lane split off main.";
 const unm=o.filter(b=>!reach(G,G.br.main).has(G.br[b]));if(G.cur!="main"&&G.br[G.cur]==G.br.main)return"Step 2 → click Commit to add a snapshot on your branch. main doesn’t move!";
 if(G.cur!="main")return"Step 3 → switch back to main, then merge your branch into it.";if(unm.length)return"Step 4 → on main, merge “"+unm[0]+"”. The dashed line shows the two histories joining.";return"🎉 Merged! Try another branch, or switch and commit on two branches at once."}
function lab(a,v){const G=S.G,L=G.log;
 const add=(b,p)=>{G.c.push({id:G.nid,b,p});G.new=G.nid;G.br[b]=G.nid++};
 if(a=="commit"){add(G.cur,[G.br[G.cur]]);L.push(`$ git commit -m "work #${G.nid-1}"   (on ${G.cur})`);G.msg=`A new snapshot was added to ${G.cur}. Only this branch moved forward.`}
 if(a=="branch"){v=v.trim().replace(/[^\w\/-]/g,"-")||"qa-login";if(G.br[v]){G.msg=`Branch "${v}" already exists — pick another name.`}else{G.br[v]=G.br[G.cur];G.lanes.push(v);G.cur=v;G.new=0;L.push(`$ git checkout -b ${v}`);G.msg=`"${v}" now points at the same commit as before. Nothing is copied — it’s just a new label that moves when you commit.`}}
 if(a=="switch"&&v){G.cur=v;G.new=0;L.push(`$ git switch ${v}`);G.msg=`HEAD (“where you are”) is now on ${v}.`}
 if(a=="merge"&&v){if(reach(G,G.br[G.cur]).has(G.br[v])){G.msg=`Already up to date — ${G.cur} already contains everything from ${v}.`}else{add(G.cur,[G.br[G.cur],G.br[v]]);L.push(`$ git merge ${v}   (into ${G.cur})`);G.msg=`Merged! The ⑂ commit has two parents: it joins ${v}’s work into ${G.cur}.`}}
 if(a=="reset")S.G=newG();render()}
/* ---------- PIPELINE ---------- */
const ST=[["⚡","Trigger","push / PR / schedule"],["🤖","Runner boots","fresh Linux machine"],["🧪","Tests run","npx playwright test"],["📜","Logs","why it failed"],["🖼","Artifact","screenshot to download"]];
function pipe(n,fail){return `<div class="grid grid-cols-5 gap-1 text-center text-[11px]">${ST.map((s,i)=>{const on=i<n,run=i==n-1&&n<5;const bad=fail&&i>=2&&on;return `<div class="rounded-lg border p-2 ${on?(bad?"border-rose-500 bg-rose-950":"border-emerald-500 bg-emerald-950/50"):"border-slate-700 bg-slate-900 opacity-60"} ${on?"pop":""}"><div class="text-2xl ${run&&i==1?"bot":""}">${s[0]}</div><b>${s[1]}</b><div class="text-slate-400">${s[2]}</div></div>`}).join("")}</div>
 <div class="mt-2 text-center text-sm">${n>=3?(fail?'<span class="text-rose-300">✘ Build FAILED — 1 test red</span>':'<span class="text-emerald-300">✔ Build passed — safe to merge</span>'):'<span class="text-slate-400">waiting…</span>'}</div>`}
/* ---------- PAGES ---------- */
const CAP=["Every change is stored as a step in history, so nothing is ever lost.","Clone copies everything from GitHub to your laptop once. After that you work locally.","qa-login grows on its own lane while main stays untouched.","git add moves a file into the box, git commit seals it as a permanent snapshot.","Push sends your sealed commits up to GitHub so the team can see them.","The PR page shows the diff. You decide: approve, or request changes.","The dashed line is the merge: qa-login’s work joins main in one new commit.","Push → robot runs tests → green means safe, red means read the logs."];
function lviz(i){const box=(t,b)=>`<div class="rounded-lg bg-slate-800 border border-slate-600 p-2 text-center text-xs">${t}<br><b>${b}</b></div>`;
 const m3=[{id:1,b:"main",p:[]},{id:2,b:"main",p:[1]},{id:3,b:"main",p:[2]}];let v="";
 if(i==0)v=`<div class="grid grid-cols-2 gap-3 text-xs"><div class="mono bg-black rounded-lg p-3">📁 shop/<br>├─ 📄 login.html<br>├─ 📄 cart.js<br>└─ 🧪 tests/</div><div class="space-y-1">${["Sam: Add cart page","Ana: Fix login bug","QA: Add login test"].map((t,k)=>`<div class="pop rounded bg-slate-800 px-2 py-1" style="animation-delay:${k*.35}s">🕘 ${t}</div>`).join("")}</div></div>`;
 if(i==1)v=`<div class="grid grid-cols-3 items-center text-center">${box("☁️ GitHub","shop repo")}<div class="text-2xl overflow-hidden"><span class="mvr">📦</span></div>${box("💻 Your laptop","shop/ copy")}</div>`;
 if(i==2)v=graph({c:[...m3,{id:4,b:"qa-login",p:[3]},{id:5,b:"qa-login",p:[4]}],br:{main:3,"qa-login":5},lanes:["main","qa-login"],cur:"qa-login",new:4});
 if(i==3)v=`<div class="grid grid-cols-5 items-center text-center text-xs gap-1">${box("📝 Working","login.spec.js")}<div><span class="mvr">📄</span><div class="mono text-amber-300">git add</div></div>${box("📥 Staged","in the box")}<div><span class="mvr">🔒</span><div class="mono text-emerald-300">git commit</div></div>${box("✅ Commit","3f9a1c2")}</div>`;
 if(i==4)v=`<div class="grid grid-cols-3 items-center text-center">${box("💻 Laptop","commit 3f9a1c2")}<div class="text-2xl overflow-hidden"><span class="mvr">🚀</span></div>${box("☁️ GitHub","qa-login ✔ new")}</div>`;
 if(i==5)v=`<div class="rounded-lg border border-slate-600 overflow-hidden text-xs"><div class="bg-slate-800 p-2">🔀 <b>PR #42</b> Checkout button · Sam → main</div><div class="mono bg-rose-950/60 text-rose-200 px-2">- disabled={cart.length === 0}</div><div class="mono bg-emerald-950/60 text-emerald-200 px-2">+ disabled={false}</div><div class="p-2 flex gap-2"><span class="px-2 py-1 rounded bg-emerald-700">✅ Approve</span><span class="px-2 py-1 rounded bg-rose-700 pl">🚫 Request changes</span></div></div>`;
 if(i==6)v=graph({c:[...m3,{id:4,b:"qa-login",p:[3]},{id:5,b:"qa-login",p:[4]},{id:6,b:"main",p:[3,5]}],br:{main:6,"qa-login":5},lanes:["main","qa-login"],cur:"main",new:6});
 if(i==7)v=pipe(5,true);
 return `<div class="text-xs text-slate-400 mb-2">🎬 Visualization</div>${v}<p class="text-sm text-sky-200 mt-2">${CAP[i]}</p>`}
function pLearn(){const c=L[S.card];S.seen.add(S.card);
 return `<div class="rounded-2xl bg-slate-800/70 border border-slate-700 p-5 pop">
 <div class="text-xs text-slate-400 mb-1">Lesson ${S.card+1} of ${L.length}</div><h2 class="text-2xl font-bold mb-2">${c.e} ${c.t}</h2>
 <p class="text-slate-200">${c.p}</p><p class="mt-2 text-sky-300 text-sm">💭 ${c.a}</p>
 <pre class="mono text-sm bg-black rounded-lg p-3 mt-3 text-emerald-300">${esc(c.c)}</pre>
 <div class="flex flex-wrap gap-2 mt-4">${c.lab?`<button data-a="tab" data-k="branch" class="px-3 py-1.5 rounded bg-violet-600 text-sm">🌿 See it in the Branch Lab</button>`:""}${c.ci?`<button data-a="tab" data-k="ci" class="px-3 py-1.5 rounded bg-violet-600 text-sm">🤖 Open the CI/CD tab</button>`:""}</div></div>
 <div class="mt-4 rounded-xl bg-slate-900 border border-slate-700 p-4 pop">${lviz(S.card)}</div>
 <div class="flex items-center justify-between mt-4"><button data-a="card" data-k="-1" ${S.card==0?"disabled":""} class="px-4 py-2 rounded bg-slate-700">← Back</button>
 <div class="flex gap-1">${L.map((_,i)=>`<button data-a="goto" data-k="${i}" class="w-3 h-3 rounded-full ${i==S.card?"bg-sky-400":S.seen.has(i)?"bg-emerald-500":"bg-slate-600"}"></button>`).join("")}</div>
 ${S.card<L.length-1?`<button data-a="card" data-k="1" class="px-4 py-2 rounded bg-sky-600">Next →</button>`:`<button data-a="tab" data-k="${S.seen.size==L.length?"branch":"learn"}" class="px-4 py-2 rounded bg-emerald-600">Watch it live →</button>`}</div>`}
function pBranch(){const G=S.G,o=Object.keys(G.br).filter(b=>b!=G.cur),op=o.map(b=>`<option>${esc(b)}</option>`).join("");
 return `<p class="text-slate-300 mb-3">Each dot is a commit. A branch is just a label pointing at one. Press the buttons and <b>watch lanes split and join</b>. Dashed lines = a merge.</p>
 <div class="rounded-xl bg-slate-900 border border-slate-700 p-3 min-h-[160px]">${graph(G)}</div>
 <div class="mt-3 rounded-lg border-l-4 border-sky-500 bg-slate-900 p-3 text-sm">🧑‍🏫 ${G.msg}<br><b class="text-amber-300">${tip(G)}</b></div>
 <div class="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
 <div class="rounded-xl bg-slate-800 p-3 space-y-2"><button data-a="lab" data-k="commit" class="w-full px-3 py-2 rounded bg-emerald-600">● Commit on <b>${esc(G.cur)}</b></button>
 <div class="flex gap-2"><input id="bn" placeholder="qa-login" class="flex-1 min-w-0 bg-slate-900 rounded px-2 mono"><button data-a="lab" data-k="branch" class="px-3 py-2 rounded bg-blue-600">🌿 New branch</button></div>
 <div class="flex gap-2"><select id="sw" class="flex-1 min-w-0 bg-slate-900 rounded px-2">${op}</select><button data-a="lab" data-k="switch" ${o.length?"":"disabled"} class="px-3 py-2 rounded bg-blue-600">Switch</button></div>
 <div class="flex gap-2"><select id="mg" class="flex-1 min-w-0 bg-slate-900 rounded px-2">${op}</select><button data-a="lab" data-k="merge" ${o.length?"":"disabled"} class="px-3 py-2 rounded bg-purple-600">🔀 Merge into ${esc(G.cur)}</button></div>
 <button data-a="lab" data-k="reset" class="px-3 py-1 rounded bg-slate-700">↺ Reset</button></div>
 <div class="rounded-xl bg-black p-3 mono text-xs h-48 overflow-auto"><div class="text-slate-500">● terminal</div>${G.log.map(l=>`<div class="text-emerald-300">${esc(l)}</div>`).join("")||'<div class="text-slate-600">commands appear here…</div>'}</div></div>`}
function pCI(){const f=FILES[S.file],c=S.ci;
 return `<p class="text-slate-300 mb-3"><b>CI/CD</b> = a robot that tests your code automatically. <b>GitHub Actions</b> reads a YAML file in <span class="mono text-amber-300">.github/workflows/</span>. Click through the pipeline:</p>
 <div class="rounded-xl bg-slate-900 border border-slate-700 p-3">${pipe(c.n,c.fail)}
 <div class="flex flex-wrap gap-2 mt-3 text-sm"><button data-a="ci" data-k="next" ${c.n>=5?"disabled":""} class="px-3 py-1.5 rounded bg-sky-600">▶ Next stage</button><button data-a="ci" data-k="reset" class="px-3 py-1.5 rounded bg-slate-700">↺</button>
 <label class="flex items-center gap-1 ml-auto"><input type="checkbox" data-a="ci" data-k="fail" ${c.fail?"checked":""}> a test fails</label></div>
 <p class="text-sm text-slate-300 mt-2">${["Press Next stage to start.","A push, a PR, a schedule or a manual click wakes the robot.","GitHub boots a clean machine and checks out your code.","Your tests run. If one fails the build goes red.","The logs show the exact error — read them first.","A screenshot is saved as an artifact: download it and attach it to your bug report."][c.n]}</p></div>
 <h3 class="font-bold mt-5 mb-2">📂 Sample files you need</h3>
 <div class="mono text-xs bg-slate-900 rounded-lg p-3 mb-2">your-repo/<br>├─ .github/workflows/nightly.yml<br>├─ .github/workflows/pr-check.yml<br>├─ tests/login.spec.js<br>├─ playwright.config.js<br>└─ package.json</div>
 <div class="flex flex-wrap gap-1 mb-2">${FILES.map((x,i)=>`<button data-a="file" data-k="${i}" class="mono text-xs px-2 py-1 rounded ${i==S.file?"bg-sky-600":"bg-slate-700"}">${x.n.split("/").pop()}</button>`).join("")}</div>
 <div class="rounded-xl border border-slate-700 overflow-hidden"><div class="flex justify-between bg-slate-800 px-3 py-2 text-sm"><span class="mono">${f.n}</span><button data-a="copy" class="px-2 rounded bg-slate-600">${S.copied==f.n?"✔ Copied":"📋 Copy"}</button></div>
 <p class="px-3 py-2 text-sm text-sky-200 bg-slate-900">${f.w}</p><pre class="mono text-xs p-3 bg-black text-slate-200 max-h-80">${esc(f.c)}</pre></div>`}
function blk(s,k,pl,fr){return `<div class="lego c-${s.c} mono ${fr?"snap":""}" ${pl?"":`draggable="true" data-a="blk" data-k="${k}"`}>${esc(s.l)}<div class="font-sans font-normal text-[11px] opacity-90">${s.p}</div></div>`}
function pPlay(){if(S.seen.size<L.length)return `<div class="rounded-2xl bg-slate-800 border border-slate-700 p-6 text-center"><div class="text-4xl">🔒</div><h2 class="text-xl font-bold my-2">Finish the lessons first</h2><p class="text-slate-300">Visit all ${L.length} lesson cards (${S.seen.size}/${L.length} done) to unlock the practice games.</p><button data-a="tab" data-k="learn" class="mt-4 px-4 py-2 rounded bg-sky-600">Go to lessons</button></div>`;
 const i=S.pm,m=M[i],p=S.pl[i],n=p.length,all=[0,1,2].every(pdone),nx=m.steps[n];
 const tray=PERM[i].filter(k=>!p.includes(k)).map(k=>blk(m.steps[k],k,0)).join(""),tw=p.map(k=>blk(m.steps[k],k,1,k==S.last)).join("");
 const col={ok:"border-emerald-500 text-emerald-200",err:"border-rose-500 text-rose-200",info:"border-sky-500 text-sky-200"}[S.msg.t];
 let vis="",ex="";
 if(i==0){const G={c:[{id:1,b:"main",p:[]},{id:2,b:"main",p:[1]},{id:3,b:"main",p:[2]}],br:{main:3},lanes:["main"],cur:"main",new:0};
  if(n>=2){G.lanes.push("qa-login");G.br["qa-login"]=3;G.cur="qa-login"}if(n>=4){G.c.push({id:4,b:"qa-login",p:[3]});G.br["qa-login"]=4;G.new=4}
  vis=`<div class="grid grid-cols-3 gap-2 text-center text-xs mb-2"><div class="rounded-lg bg-slate-800 p-2">☁️ GitHub<br>${n>=5?'<b class="pop text-emerald-300">qa-login ✔</b>':"main"}</div><div class="text-2xl">${n==1?"⬇️":n==3?"📦":n==4?"🔒":n>=5?"⬆️":"·"}</div><div class="rounded-lg bg-slate-800 p-2">💻 QA Laptop<br>${n>=1?"🗂 shop/":"empty"}${n>=3?" 📄":""}</div></div>`+(n>=1?graph(G):'<div class="text-slate-500 text-sm p-4">The laptop is empty…</div>')}
 if(i==1){const G={c:[{id:1,b:"main",p:[]},{id:2,b:"main",p:[1]},{id:3,b:"main",p:[2]}],br:{main:3},lanes:["main"],cur:"main",new:0};
  if(n>=1){G.lanes.push("pr-42");G.c.push({id:4,b:"pr-42",p:[3]},{id:5,b:"pr-42",p:[4]});G.br["pr-42"]=5;G.new=5}if(n>=2)G.cur="pr-42";
  vis=graph(G)+`<div class="mt-2 rounded-xl p-3 text-center text-sm ${S.bug?"bg-rose-950 border border-rose-500":"bg-slate-800"}">🚧 <b>Pull Request Gatekeeper</b><br>${S.bug?"🚫 Merge BLOCKED — Sam must fix the bug.":n>=3?'<span class="pl">Waiting for your review…</span>':"Nothing reaches main without review."}</div>`;
  if(n==3)ex=`<div class="mt-3 rounded-xl border border-slate-600 overflow-hidden"><div class="bg-slate-800 px-3 py-2 text-sm">🔍 CheckoutButton.jsx — <b>click the buggy line</b></div>${DIFF.map((d,k)=>`<div data-a="diff" data-k="${k}" class="diff-line mono text-xs px-3 py-1 whitespace-pre ${d[0]=="a"?"bg-emerald-950/60 text-emerald-200":d[0]=="d"?"bg-rose-950/60 text-rose-200":"text-slate-400"} ${S.bug&&k==3?"ring-2 ring-rose-500":""}">${esc(d[1])}</div>`).join("")}${S.dm?`<div class="p-3 text-sm ${S.bug?"bg-rose-950 text-rose-200":"bg-slate-800 text-amber-200"}">${S.dm}</div>`:""}</div>`}
 if(i==2){vis=pipe([0,1,3,4,5][n],n>=2);if(n==4)ex=`<button data-a="art" class="mt-3 w-full rounded-xl border ${S.art?"border-emerald-500":"border-amber-500 pl"} bg-slate-800 p-3 text-left text-sm">🖼 <b>test-failure-screenshot.png</b> ${S.art?"✔ opened":"— click to open"}</button>`}
 return `${all?`<div class="pop mb-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 p-4 text-center font-bold">🏆 QA Git Certified! You can clone, branch, review PRs and debug CI.</div>`:""}
 <div class="flex flex-wrap gap-2 mb-3">${M.map((x,k)=>`<button data-a="pm" data-k="${k}" class="px-3 py-1.5 rounded-lg text-sm border ${k==i?"bg-sky-600 border-sky-400":"border-slate-600 bg-slate-800"}">${pdone(k)?"✅ ":""}${x.tab}</button>`).join("")}</div>
 <div class="rounded-xl bg-slate-800/70 border border-slate-700 p-3 mb-3 text-sm">${m.story}</div>
 <div class="grid lg:grid-cols-2 gap-4"><section><div class="flex gap-2 mb-2"><button data-a="hint" class="px-3 py-1 rounded bg-slate-700 text-sm">💡 Hint</button><button data-a="reset" class="px-3 py-1 rounded bg-slate-700 text-sm">↺ Reset</button></div>
 ${S.hint&&nx?`<div class="mb-2 rounded border border-amber-500 text-amber-200 p-2 text-sm">💡 ${nx.h} Next: <span class="mono">${esc(nx.l)}</span></div>`:""}
 <div class="flex flex-wrap gap-x-3 pb-2 min-h-[48px]">${tray||'<span class="text-xs text-slate-500">All blocks used ✔</span>'}</div>
 <div id="drop" class="${S.shake?"shake":""} mt-1 min-h-[110px] rounded-xl border-2 border-dashed border-slate-600 p-3 space-y-1">${tw||'<span class="text-slate-500 text-sm">Drop or click blocks here…</span>'}</div>
 <div class="mt-3 rounded-lg border-l-4 ${col} bg-slate-900 p-3 text-sm">🧑‍🏫 <b>Mentor:</b> ${S.msg.x}</div>${ex}</section>
 <section><div class="rounded-xl bg-slate-900 border border-slate-700 p-3">${vis}</div><div id="term" class="mt-3 rounded-xl bg-black p-3 mono text-xs h-44 overflow-auto"><div class="text-slate-500">● terminal</div>${S.term[i].map(l=>`<div class="${l[0]=="$"?"text-emerald-300":/✘|Error/.test(l)?"text-rose-300":"text-slate-300"}">${esc(l)}</div>`).join("")||'<span class="text-slate-600">waiting…</span>'}</div></section></div>`}
function modal(){return `<div data-a="close" class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"><div class="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full p-4 max-h-full overflow-auto" onclick="event.stopPropagation()"><div class="flex justify-between mb-2"><b class="mono text-sm">test-failure-screenshot.png</b><button data-a="close">✕</button></div>
 <div class="rounded-lg bg-white text-slate-800 p-4 text-sm"><div class="font-bold border-b pb-1 mb-3">🛒 Checkout</div>1 × Blue Sneakers — $59<div class="mt-3"><span class="inline-block px-4 py-2 rounded bg-slate-300 text-slate-500">Pay $59 (disabled)</span></div><div class="mt-3 p-2 rounded bg-red-100 text-red-700 text-xs">✘ Expected #pay-button to be enabled</div></div>
 <p class="text-sm mt-3 text-slate-300"><b>Why it matters:</b> a screenshot is proof. Attach it to your bug report with the test name, the log line <span class="mono text-rose-300">checkout.spec.js:18</span> and the run link, so developers see exactly what the robot saw.</p></div></div>`}
/* ---------- RENDER ---------- */
function render(){const T=[["learn","📖 1. Learn"],["branch","🌿 2. Branch Lab"],["ci","🤖 3. CI/CD"],["play","🧱 4. Practice"]];
 const pg={learn:pLearn,branch:pBranch,ci:pCI,play:pPlay}[S.tab]();
 document.getElementById("app").innerHTML=`<header class="mb-4"><div class="flex flex-wrap items-center justify-between gap-2"><h1 class="text-xl font-bold">🧱 Git & CI/CD Lab <span class="text-slate-400 text-sm font-normal">for QA beginners</span></h1><div class="text-xs text-slate-400">Lessons ${S.seen.size}/${L.length} · Games ${[0,1,2].filter(pdone).length}/3</div></div>
 <nav class="flex flex-wrap gap-2 mt-3">${T.map(t=>`<button data-a="tab" data-k="${t[0]}" class="px-3 py-1.5 rounded-lg text-sm border ${t[0]==S.tab?"bg-sky-600 border-sky-400":"border-slate-600 bg-slate-800"}">${t[1]}</button>`).join("")}</nav></header>${pg}${S.modal?modal():""}`;
 const t=document.getElementById("term");if(t)t.scrollTop=t.scrollHeight;S.shake=false}
function place(i,k){const m=M[i],p=S.pl[i];if(p.includes(k)||p.length==m.steps.length)return;
 if(k==p.length){p.push(k);S.term[i].push(...m.steps[k].o);S.last=k;const d=p.length==m.steps.length;S.msg={t:"ok",x:d?"🎉 Puzzle assembled! "+(i==1?"Now click the buggy line in the diff.":i==2?"Open the downloaded artifact.":"Your test is on GitHub."):"✅ Snap! "+m.steps[k].p}}
 else{S.shake=true;S.msg={t:"err",x:"🤔 "+m.steps[k].e}}S.hint=false;render()}
const A=document.getElementById("app");
A.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el)return;const a=el.dataset.a,k=el.dataset.k,i=S.pm;
 if(a=="tab"){S.tab=k;S.modal=false}else if(a=="card")S.card+=+k;else if(a=="goto")S.card=+k;
 else if(a=="lab")lab(k,k=="branch"?document.getElementById("bn").value:k=="switch"?document.getElementById("sw").value:document.getElementById("mg")?.value);
 else if(a=="ci"){if(k=="next")S.ci.n=Math.min(5,S.ci.n+1);else if(k=="reset")S.ci.n=0;else S.ci.fail=el.checked}
 else if(a=="file"){S.file=+k}
 else if(a=="copy"){const t=FILES[S.file];S.copied=t.n;try{navigator.clipboard.writeText(t.c)}catch(x){}}
 else if(a=="pm"){S.pm=+k;S.hint=false;S.msg={t:"info",x:"New puzzle! Snap blocks in the right order."}}
 else if(a=="blk")return place(i,+k);else if(a=="hint")S.hint=!S.hint;
 else if(a=="reset"){S.pl[i]=[];S.term[i]=[];S.last=-1;if(i==1){S.bug=false;S.dm=""}if(i==2)S.art=false;S.msg={t:"info",x:"Fresh start!"}}
 else if(a=="diff"){if(+k==3){S.bug=true;S.dm="🐞 Bug caught! <span class='mono'>disabled={false}</span> means the Pay button is never disabled, so an impatient double-click charges the customer twice. Merge blocked — leave a PR comment for Sam.";S.term[1].push("✘ Review: changes requested on PR #42")}else S.dm="Not that line. Look for a change that removes a safety check (hint: ‘disabled’)."}
 else if(a=="art"){S.modal=true;S.art=true}else if(a=="close")S.modal=false;
 render()});
A.addEventListener("dragstart",e=>{const el=e.target.closest("[data-a=blk]");if(el)e.dataTransfer.setData("text/plain",el.dataset.k)});
A.addEventListener("dragover",e=>{const d=e.target.closest("#drop");if(d){e.preventDefault();d.classList.add("drop-on")}});
A.addEventListener("drop",e=>{if(e.target.closest("#drop")){e.preventDefault();const k=e.dataTransfer.getData("text/plain");if(k!=="")place(S.pm,+k)}});
render();
