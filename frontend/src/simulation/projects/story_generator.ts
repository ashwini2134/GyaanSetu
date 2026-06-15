import type { DebugStep } from '../../interpreter';
import type { SimulationDefinition, StructuredData, Scene, SceneElement } from '../types';

/* ─── GENDER DETECTION ─── */

const FEMALE_NAMES = new Set([
  'maya','lakshanya','sophia','olivia','emma','ava','isabella','mia','charlotte','amelia',
  'harper','evelyn','abigail','emily','ella','avery','sofia','camila','aria','scarlett',
  'victoria','madison','luna','grace','chloe','penelope','layla','riley','zoey','nora',
  'lily','eleanor','hannah','lillian','addison','aubrey','ellie','stella','natalie','zoe',
  'sarah','jessica','ashley','amanda','jennifer','lisa','michelle','kimberly','amy',
  'angela','heather','stephanie','nicole','elizabeth','rebecca','kelly','mary','patricia',
  'taylor','diana','priya','ananya','shreya','neha','divya','kavya','isha','tanvi',
  'sita','radha','gita','usha','reema','pooja','nitya','kriti','bhavna','deepa',
  'jyoti','pallavi','swati','anjali','roshni','sneha','tara','kiran','ratna','meera',
  'lara','nina','tina','mona','zara','alexa','leah','jade','rose',
  'ivy','june','may','april','holly','fern','hazel','ruby','pearl',
]);

const MALE_NAMES = new Set([
  'rahul','arjun','john','david','michael','james','robert','william','richard','joseph',
  'thomas','chris','daniel','matthew','anthony','mark','donald','steven','paul','andrew',
  'joshua','kenneth','kevin','brian','george','timothy','ronald','edward','jason','jeffrey',
  'ryan','jacob','gary','nicholas','eric','jonathan','stephen','larry','justin','scott',
  'brandon','benjamin','samuel','raymond','gregory','alexander','frank','patrick','tyler',
  'aaron','nathan','harold','akshay','vijay','ajay','sanjay','ravi','deepak','manoj',
  'suresh','amit','sunil','vivek','anil','naveen','rajesh','mahesh','kishore','prakash',
  'harsha','venkat','srinivas','mohan','kumar','ganesh','ramesh','dinesh','siddharth',
  'pranav','aditya','vikram','karthik','narendra','balaji','murugan','saravanan','kavin',
  'vasanth','gokul','mohamed','ali','hassan','hussein','ahmed','omar','ibrahim','yusuf',
  'ismail','khalid','abdullah','saad','fahad','tariq','rashid','nasser','sultan','majid',
  'jamal','hadi','vishnu','shiva','indra','krishna','narayan','govind','madhav',
  'bob','jack','nick','tom','max','sam','oliver','harry','charlie','oscar',
  'leo','archie','henry','theo','sebastian','jackson','ethan','lucas','logan','mason',
  'jay','virat','dhoni','kohli','rohit','bumrah','ashwin','jadeja','dhawan','pant',
]);

function detectGender(name: string): 'female' | 'male' | 'neutral' {
  const first = name.trim().split(/\s+/)[0];
  const lower = first.toLowerCase();
  if (!lower || lower === 'your' || lower === 'character') return 'neutral';
  if (FEMALE_NAMES.has(lower)) return 'female';
  if (MALE_NAMES.has(lower)) return 'male';
  if (lower.endsWith('a') || lower.endsWith('e') || lower.endsWith('i') || lower.endsWith('y')) return 'female';
  if (lower.endsWith('n') || lower.endsWith('r') || lower.endsWith('sh') || lower.endsWith('k')) return 'male';
  return 'neutral';
}

/* ─── COLOR HELPERS ─── */

const COLOR_MAP: Record<string, string> = {
  red:'#ef4444', blue:'#3b82f6', green:'#22c55e', yellow:'#eab308',
  purple:'#a855f7', pink:'#ec4899', orange:'#f97316', teal:'#14b8a6',
  cyan:'#06b6d4', indigo:'#6366f1', violet:'#8b5cf6', fuchsia:'#d946ef',
  rose:'#f43f5e', amber:'#f59e0b', lime:'#84cc16', emerald:'#10b981',
  sky:'#0ea5e9', slate:'#64748b', grey:'#6b7280', gray:'#6b7280',
  white:'#f1f5f9', black:'#1e293b', brown:'#92400e', navy:'#1e3a5f',
  gold:'#f59e0b', silver:'#94a3b8', coral:'#f97316', maroon:'#be123c',
  turquoise:'#14b8a6', lavender:'#c4b5fd', peach:'#fdba74', mint:'#a7f3d0',
};

const COLOR_KEYS = Object.keys(COLOR_MAP);

function hex(c: string | undefined): string {
  if (!c) return '#6366f1';
  const t = c.toLowerCase().trim();
  if (COLOR_MAP[t]) return COLOR_MAP[t];
  for (const k of COLOR_KEYS) { if (t.includes(k) || k.includes(t)) return COLOR_MAP[k]; }
  return '#6366f1';
}

function displayColorName(c: string | undefined): string {
  if (!c) return 'Blue';
  const t = c.trim();
  if (!t) return 'Blue';
  const l = t.toLowerCase();
  if (COLOR_MAP[l]) return t;
  for (const k of COLOR_KEYS) { if (l.includes(k)) return k[0].toUpperCase() + k.slice(1); }
  return t;
}

function radial(stops: string): string {
  return `radial-gradient(ellipse at 50% 40%, ${stops})`;
}

/* ─── UTILITY ─── */

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
}

function parseVariables(steps: DebugStep[]): Record<string, string> {
  return steps[steps.length - 1]?.variables || {};
}

/* ─── HOBBY IDENTIFICATION ─── */

function identifyHobby(hobby: string): string {
  const h = hobby.toLowerCase().trim();
  if (!h) return 'generic';
  if (/(paint|art(ist)?|sketch|canvas)/.test(h)) return 'painting';
  if (/(cod(e|ing)|program(ming)?|software|developer|computer|tech|ai|intelligence|data)/.test(h)) return 'coding';
  if (/(read(ing)?|book|library|novel|literature)/.test(h)) return 'reading';
  if (/(music|sing(ing)?|instrument|song|piano|guitar|drum)/.test(h)) return 'music';
  if (/(gam(e|ing)|video|console|esports)/.test(h)) return 'gaming';
  if (/(football|soccer|sport|ball|cricket|tennis|basketball|exercis(e|ing)|run(ning)?|swim(ming)?|gym|yoga|athlet)/.test(h)) return 'sports';
  if (/(writ(e|ing)|author|story|poem|journal|blog|novelist)/.test(h)) return 'writing';
  if (/(draw(ing)?|sketch(ing)?|illustrat(e|ing)|doodle)/.test(h)) return 'drawing';
  if (/(danc(e|ing)|ballet|hip.?hop|choreo)/.test(h)) return 'dancing';
  if (/(phot(ography|o)|camera|shoot(ing)?|picture)/.test(h)) return 'photography';
  if (/(cook(ing)?|bak(e|ing)|kitchen|food|chef|culinary)/.test(h)) return 'cooking';
  return 'generic';
}

/* ─── CONSISTENT CHARACTER ─── */

const CHAR = { skinTone: '#f5d0b8', hairColor: '#5c3a1e' };

/* ─── HOBBY SCENE BUILDERS ─── */

type HobbyBuilder = (c: string, gender: string, name: string, age: string) => SceneElement[];

const hobbyBuilders: Record<string, HobbyBuilder> = {

  painting: (c, gender) => [
    { id:'h-char', type:'character', x:28, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-easel', type:'object', x:62, y:44, motion:'slideInUp', delay:400, data:{objectType:'easel', size:3.8} },
    { id:'h-canvas', type:'object', x:62, y:44, motion:'fadeIn', delay:1000, data:{objectType:'canvasArt', color:c, size:3} },
    { id:'h-palette', type:'object', x:86, y:26, motion:'slideInRight', delay:600, data:{objectType:'palette', size:2} },
    { id:'h-p', type:'particles', x:44, y:34, motion:'fadeIn', delay:200, data:{count:24, color:c} },
  ],

  coding: (c, gender, name, age) => [
    { id:'h-laptop', type:'object', x:58, y:46, motion:'slideInUp', delay:400, data:{objectType:'computer', size:4} },
    { id:'h-char', type:'character', x:24, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:false, gender} },
    { id:'h-c1', type:'text', x:58, y:34, motion:'typewriter', delay:1000, data:{text:`  let name = "${truncate(name,14)}"`, color:'#22c55e', size:0.3} },
    { id:'h-c2', type:'text', x:58, y:40, motion:'typewriter', delay:1800, data:{text:`  let age = ${age || '?'}`, color:'#60a5fa', size:0.3} },
    { id:'h-c3', type:'text', x:58, y:46, motion:'typewriter', delay:2600, data:{text:'  console.log(name, age)', color:'#fbbf24', size:0.3} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:20, color:'#6366f1'} },
  ],

  reading: (c, gender) => [
    { id:'h-char', type:'character', x:32, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-b1', type:'object', x:62, y:46, motion:'slideInUp', delay:400, data:{objectType:'book', size:3.8} },
    { id:'h-b2', type:'object', x:80, y:38, motion:'slideInUp', delay:700, data:{objectType:'book', size:3} },
    { id:'h-b3', type:'object', x:90, y:28, motion:'slideInUp', delay:1000, data:{objectType:'book', size:2.2} },
    { id:'h-shelf', type:'object', x:78, y:52, motion:'fadeIn', delay:500, data:{objectType:'bookshelf', size:3.8} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:16, color:c} },
  ],

  music: (c, gender) => [
    { id:'h-inst', type:'object', x:60, y:48, motion:'slideInUp', delay:400, data:{objectType:'musicInstrument', size:3.8} },
    { id:'h-char', type:'character', x:32, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-n1', type:'object', x:78, y:22, motion:'bounce', delay:800, data:{objectType:'musicNote', size:2.2} },
    { id:'h-n2', type:'object', x:86, y:36, motion:'bounce', delay:1200, data:{objectType:'musicNote', size:1.8} },
    { id:'h-n3', type:'object', x:20, y:20, motion:'bounce', delay:1600, data:{objectType:'musicNote', size:1.5} },
    { id:'h-n4', type:'object', x:70, y:16, motion:'scaleIn', delay:2000, data:{objectType:'musicNote', size:1.2} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:18, color:'#f59e0b'} },
  ],

  gaming: (c, gender) => [
    { id:'h-mon', type:'object', x:62, y:44, motion:'slideInUp', delay:400, data:{objectType:'computer', size:3.8} },
    { id:'h-ctr', type:'object', x:40, y:62, motion:'slideInUp', delay:700, data:{objectType:'gameController', size:2.2} },
    { id:'h-char', type:'character', x:28, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:false, gender} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:24, color:'#ec4899'} },
  ],

  sports: (c, gender) => [
    { id:'h-stad', type:'object', x:66, y:36, motion:'slideInUp', delay:400, data:{objectType:'stadium', size:3.8} },
    { id:'h-bl1', type:'object', x:36, y:64, motion:'bounce', delay:800, data:{objectType:'football', size:2.8} },
    { id:'h-bl2', type:'object', x:74, y:72, motion:'slideInRight', delay:1200, data:{objectType:'football', size:2.2} },
    { id:'h-char', type:'character', x:26, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:20, color:'#22c55e'} },
  ],

  writing: (c, gender) => [
    { id:'h-char', type:'character', x:30, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-nb', type:'object', x:60, y:46, motion:'slideInUp', delay:400, data:{objectType:'sketchBook', size:3.2} },
    { id:'h-b', type:'object', x:82, y:40, motion:'slideInUp', delay:700, data:{objectType:'book', size:2.5} },
    { id:'h-pe', type:'object', x:46, y:32, motion:'fadeIn', delay:1000, data:{objectType:'pencil', size:2} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:16, color:'#fbbf24'} },
  ],

  drawing: (c, gender) => [
    { id:'h-sk', type:'object', x:60, y:48, motion:'slideInUp', delay:400, data:{objectType:'sketchBook', size:3.2} },
    { id:'h-pe', type:'object', x:44, y:32, motion:'fadeIn', delay:800, data:{objectType:'pencil', size:2.2} },
    { id:'h-sw', type:'object', x:86, y:28, motion:'slideInRight', delay:1000, data:{objectType:'colorSwatch', color:c, size:1.5} },
    { id:'h-char', type:'character', x:26, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:16, color:'#f97316'} },
  ],

  dancing: (c, gender) => [
    { id:'h-char', type:'character', x:50, y:44, motion:'slideInUp', delay:200, data:{...CHAR, size:4, shirtColor:c, waving:true, gender} },
    { id:'h-n1', type:'object', x:18, y:22, motion:'bounce', delay:600, data:{objectType:'musicNote', size:2.4} },
    { id:'h-n2', type:'object', x:82, y:20, motion:'bounce', delay:1000, data:{objectType:'musicNote', size:2} },
    { id:'h-n3', type:'object', x:50, y:14, motion:'bounce', delay:1400, data:{objectType:'musicNote', size:1.6} },
    { id:'h-n4', type:'object', x:32, y:12, motion:'scaleIn', delay:1800, data:{objectType:'musicNote', size:1.2} },
    { id:'h-n5', type:'object', x:70, y:14, motion:'scaleIn', delay:2200, data:{objectType:'musicNote', size:1.2} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:22, color:'#ec4899'} },
  ],

  photography: (c, gender) => [
    { id:'h-cam', type:'object', x:56, y:44, motion:'slideInUp', delay:400, data:{objectType:'computer', size:3.2} },
    { id:'h-char', type:'character', x:26, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:false, gender} },
    { id:'h-g1', type:'object', x:80, y:34, motion:'slideInRight', delay:1000, data:{objectType:'colorSwatch', color:c, size:1.5} },
    { id:'h-g2', type:'object', x:84, y:54, motion:'slideInRight', delay:1200, data:{objectType:'colorSwatch', color:'#f59e0b', size:1.2} },
    { id:'h-g3', type:'object', x:76, y:66, motion:'slideInRight', delay:1400, data:{objectType:'colorSwatch', color:'#22c55e', size:1} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:18, color:'#0ea5e9'} },
  ],

  cooking: (c, gender) => [
    { id:'h-char', type:'character', x:30, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-b1', type:'object', x:60, y:48, motion:'slideInUp', delay:400, data:{objectType:'book', size:3.2} },
    { id:'h-b2', type:'object', x:80, y:42, motion:'slideInUp', delay:700, data:{objectType:'book', size:2.5} },
    { id:'h-pe', type:'object', x:56, y:30, motion:'fadeIn', delay:1000, data:{objectType:'pencil', size:2} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:16, color:'#f97316'} },
  ],
};

function genericHobby(c: string, gender: string): SceneElement[] {
  return [
    { id:'h-char', type:'character', x:32, y:50, motion:'slideInLeft', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
    { id:'h-t1', type:'object', x:62, y:46, motion:'slideInUp', delay:400, data:{objectType:'book', size:3.2} },
    { id:'h-t2', type:'object', x:80, y:40, motion:'slideInUp', delay:700, data:{objectType:'pencil', size:2} },
    { id:'h-t3', type:'object', x:58, y:26, motion:'slideInUp', delay:1000, data:{objectType:'sketchBook', size:2.5} },
    { id:'h-p', type:'particles', x:50, y:30, motion:'fadeIn', delay:200, data:{count:18, color:c} },
  ];
}

const HOBBY_BG: Record<string, string> = {
  painting:'#140f0c', coding:'#0f0d1a', reading:'#0e0c14',
  music:'#120e14', gaming:'#140e10', sports:'#0c140f',
  writing:'#140f0c', drawing:'#140f0c', dancing:'#120e14',
  photography:'#0e1214', cooking:'#140c0a', generic:'#0e0e0e',
};

/* ─── SCENE BUILDER ─── */

function scenesFromDetails(d: { name?: string; age?: string; color?: string; hobby?: string }): Scene[] {
  const rawColor = d.color || '';
  const c = hex(rawColor);
  const dispColor = displayColorName(rawColor);
  const name = d.name || 'Your Character';
  const age = d.age || '';
  const hobby = (d.hobby || '').trim() || 'creating';
  const gender = detectGender(name);
  const hobbyKey = identifyHobby(hobby);
  const hbg = HOBBY_BG[hobbyKey] || HOBBY_BG.generic;
  const builder = hobbyBuilders[hobbyKey] || genericHobby;
  const ageLabel = age ? `${age} Years Old` : '';

  return [
    /* ══════ SCENE 1: STORYBOOK OPENING ══════ */
    {
      id:'storybook',
      background: radial('#6366f120 0%, #312e8130 35%, #060a10 75%'),
      duration: 3000,
      elements: [
        { id:'s-book', type:'object', x:50, y:46, motion:'pageOpen', delay:200, data:{objectType:'storyBook', size:5.5} },
        { id:'s-title', type:'text', x:50, y:22, motion:'fadeIn', delay:1200, data:{text:`${truncate(name,24)}'s Story`, color:'#f1f5f9', size:1.1} },
        { id:'s-sub', type:'text', x:50, y:30, motion:'fadeIn', delay:1600, data:{text:'Every great story starts with you.', color:'#94a3b8', size:0.45} },
        { id:'s-p1', type:'particles', x:50, y:40, motion:'fadeIn', delay:1800, data:{count:30, color:'#a5b4fc'} },
        { id:'s-p2', type:'particles', x:30, y:50, motion:'fadeIn', delay:2200, data:{count:14, color:'#6366f1'} },
        { id:'s-p3', type:'particles', x:70, y:50, motion:'fadeIn', delay:2500, data:{count:14, color:'#818cf8'} },
      ],
      narration: `${name}'s Story`,
    },

    /* ══════ SCENE 2: CHARACTER INTRODUCTION ══════ */
    {
      id:'intro',
      background: radial(`${c}35 0%, ${c}15 30%, #0b0f16 70%`),
      duration: 3500,
      elements: [
        { id:'i-shelf', type:'object', x:88, y:40, motion:'fadeIn', delay:200, data:{objectType:'bookshelf', size:3} },
        { id:'i-char', type:'character', x:50, y:45, motion:'slideInLeft', delay:400, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
        { id:'i-title', type:'text', x:50, y:16, motion:'fadeIn', delay:1200, data:{text:`Meet ${truncate(name,24)}`, color:'#f1f5f9', size:0.85} },
        { id:'i-name', type:'object', x:50, y:74, motion:'bounce', delay:1700, data:{objectType:'nameBadge', label:truncate(name,20), size:1} },
        { id:'i-age', type:'text', x:50, y:82, motion:'fadeIn', delay:2200, data:{text:ageLabel || 'Every journey begins', color:'#94a3b8', size:0.5} },
        { id:'i-p1', type:'particles', x:50, y:35, motion:'fadeIn', delay:800, data:{count:24, color:c} },
        { id:'i-p2', type:'particles', x:25, y:50, motion:'fadeIn', delay:1200, data:{count:10, color:c} },
        { id:'i-p3', type:'particles', x:75, y:50, motion:'fadeIn', delay:1500, data:{count:10, color:c} },
      ],
      narration: age ? `Meet ${name}, ${age} years old` : `Meet ${name}`,
    },

    /* ══════ SCENE 3: AGE CELEBRATION ══════ */
    {
      id:'age',
      background: radial('#fbbf2420 0%, #f59e0b15 25%, #78350f25 50%, #060a10 80%'),
      duration: 4500,
      elements: [
        { id:'a-cake', type:'object', x:65, y:56, motion:'slideInUp', delay:200, data:{objectType:'birthdayCake', size:3.5} },
        { id:'a-char', type:'character', x:26, y:50, motion:'slideInLeft', delay:300, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
        { id:'a-number', type:'text', x:58, y:28, motion:'bounce', delay:800, data:{text:age, color:'#fbbf24', size:2.8} },
        { id:'a-cal', type:'object', x:82, y:22, motion:'slideInRight', delay:1200, data:{objectType:'calendar', size:2} },
        { id:'a-label', type:'object', x:50, y:82, motion:'fadeIn', delay:2000, data:{objectType:'ageBadge', label:ageLabel, size:1} },
        { id:'a-cf1', type:'particles', x:50, y:20, motion:'fadeIn', delay:400, data:{count:30, color:'#fbbf24'} },
        { id:'a-cf2', type:'particles', x:25, y:30, motion:'fadeIn', delay:600, data:{count:18, color:'#ef4444'} },
        { id:'a-cf3', type:'particles', x:75, y:30, motion:'fadeIn', delay:800, data:{count:18, color:'#3b82f6'} },
      ],
      narration: ageLabel,
    },

    /* ══════ SCENE 4: COLOR WORLD ══════ */
    {
      id:'color',
      background: radial(`${c}75 0%, ${c}35 25%, ${c}15 50%, #060a10 85%`),
      duration: 3800,
      elements: [
        { id:'co-char', type:'character', x:50, y:48, motion:'slideInUp', delay:200, data:{...CHAR, size:3.5, shirtColor:c, waving:false, gender} },
        { id:'co-p1', type:'particles', x:50, y:45, motion:'fadeIn', delay:400, data:{count:50, color:c} },
        { id:'co-p2', type:'particles', x:20, y:35, motion:'fadeIn', delay:700, data:{count:24, color:c} },
        { id:'co-p3', type:'particles', x:80, y:35, motion:'fadeIn', delay:1000, data:{count:24, color:c} },
        { id:'co-p4', type:'particles', x:35, y:70, motion:'fadeIn', delay:1300, data:{count:14, color:c} },
        { id:'co-p5', type:'particles', x:65, y:70, motion:'fadeIn', delay:1600, data:{count:14, color:c} },
      ],
      narration: dispColor,
    },

    /* ══════ SCENE 5: HOBBY PERFORMANCE ══════ */
    {
      id:'hobby',
      background: radial(`${c}25 0%, ${hbg} 50%, #060a10 85%`),
      duration: 7000,
      elements: builder(c, gender, name, age),
      narration: `${name} loves ${hobby.toLowerCase()}`,
    },

    /* ══════ SCENE 6: FINAL SUMMARY ══════ */
    {
      id:'final',
      background: radial(`${c}35 0%, ${c}12 35%, #060a10 75%`),
      duration: 5500,
      elements: [
        { id:'f-title', type:'text', x:50, y:12, motion:'fadeIn', delay:300, data:{text:`${truncate(name,24)}'s Story`, color:'#f1f5f9', size:0.8} },
        { id:'f-char', type:'character', x:72, y:44, motion:'scaleIn', delay:600, data:{...CHAR, size:3.5, shirtColor:c, waving:true, gender} },
        { id:'f-code-1', type:'text', x:26, y:30, motion:'typewriter', delay:1200, data:{text:`  name = "${truncate(name,16)}"`, color:'#22c55e', size:0.4} },
        { id:'f-code-2', type:'text', x:26, y:38, motion:'typewriter', delay:2000, data:{text:`  age = ${age || '?'}`, color:'#60a5fa', size:0.4} },
        { id:'f-code-3', type:'text', x:26, y:46, motion:'typewriter', delay:2800, data:{text:`  color = "${dispColor}"`, color:'#fbbf24', size:0.4} },
        { id:'f-code-4', type:'text', x:26, y:54, motion:'typewriter', delay:3600, data:{text:`  hobby = "${truncate(hobby,14)}"`, color:'#f472b6', size:0.4} },
        { id:'f-gen', type:'text', x:50, y:84, motion:'fadeIn', delay:4400, data:{text:'Generated from your code', color:'#64748b', size:0.4} },
        { id:'f-p1', type:'particles', x:50, y:50, motion:'fadeIn', delay:700, data:{count:28, color:'#fbbf24'} },
        { id:'f-p2', type:'particles', x:25, y:35, motion:'fadeIn', delay:1000, data:{count:14, color:c} },
        { id:'f-p3', type:'particles', x:75, y:35, motion:'fadeIn', delay:1300, data:{count:14, color:c} },
      ],
      narration: `This is ${name}'s story.`,
    },
  ];
}

/* ─── SIMULATION API ─── */

function parse(steps: DebugStep[]): StructuredData {
  const vars = parseVariables(steps);
  return {
    type:'story_generator',
    entities:[{ id:'character', type:'character', name:vars.name || 'Your Character', attributes:{ age:vars.age||'', color:vars.color||'', hobby:vars.hobby||'' } }],
    events:[],
    metadata:vars as unknown as Record<string, unknown>,
  };
}

function build(data: StructuredData): Scene[] {
  const e = data.entities[0];
  const a = e?.attributes || {};
  return scenesFromDetails({ name:e?.name, age:a.age, color:a.color, hobby:a.hobby });
}

function preview(): Scene[] {
  return scenesFromDetails({});
}

export const storyGeneratorSim: SimulationDefinition = { id:'story_generator', parse, build, preview };
