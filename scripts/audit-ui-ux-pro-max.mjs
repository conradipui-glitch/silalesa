import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173/silalesa/';
const browser = await chromium.launch({ headless: true });
const findings = [];

function add(severity, rule, message, data) {
  findings.push({ severity, rule, message, data });
}

async function goto(page) {
  const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  assert.equal(response?.status(), 200);
}

async function checkViewport(label, viewport, { touch = false } = {}) {
  const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1 });
  const page = await context.newPage();
  await goto(page);

  const dims = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: innerWidth }));
  if (dims.scrollWidth > dims.width + 2) add('critical', 'horizontal-scroll', label + ': horizontal overflow', dims);

  const overlaps = await page.evaluate(() => {
    const pairs = [
      ['[data-qa="hero-copy"]', '[data-qa="hero-media"]', 'hero copy/media'],
      ['[data-qa="header-logo"]', '[data-qa="header-nav"]', 'header logo/nav'],
      ['[data-qa="header-nav"]', '[data-qa="header-actions"]', 'header nav/actions'],
      ['[data-qa="header-logo"]', '[data-qa="header-actions"]', 'header logo/actions'],
    ];
    const out = [];
    for (const [aSel,bSel,name] of pairs) {
      const a=document.querySelector(aSel), b=document.querySelector(bSel);
      if (!a || !b) continue;
      const sa=getComputedStyle(a), sb=getComputedStyle(b);
      if (sa.display==='none'||sb.display==='none') continue;
      const ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();
      const x=Math.min(ar.right,br.right)-Math.max(ar.left,br.left);
      const y=Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top);
      if (x>1&&y>1) out.push({name,x:Math.round(x),y:Math.round(y)});
    }
    return out;
  });
  for (const item of overlaps) add('critical', 'layout-overlap', label + ': ' + item.name, item);

  if (touch) {
    const smallTargets = await page.locator('header a:visible, header button:visible, [data-qa="hero-copy"] a:visible, .fixed.bottom-0 a:visible').evaluateAll((els) =>
      els.map((el) => {
        const r=el.getBoundingClientRect();
        return { text:(el.textContent||el.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,80), w:Math.round(r.width), h:Math.round(r.height), tag:el.tagName };
      }).filter((x)=>x.w<44||x.h<44)
    );
    for (const item of smallTargets) add('critical', 'touch-target-size', label + ': target below 44x44', item);
  }

  const headings = await page.locator('main h1, main h2, main h3, main h4, main h5, main h6').evaluateAll((els) =>
    els.filter((el)=>getComputedStyle(el).display!=='none').map((el)=>({level:Number(el.tagName.slice(1)), text:(el.textContent||'').trim().slice(0,80)}))
  );
  for (let i=1;i<headings.length;i++) {
    if (headings[i].level > headings[i-1].level + 1) add('critical','heading-hierarchy', label + ': skipped heading level', {from:headings[i-1],to:headings[i]});
  }

  const imageIssues = await page.locator('img').evaluateAll((els) => els.filter((img)=>!img.hasAttribute('alt')).map((img)=>img.getAttribute('src')));
  for (const src of imageIssues) add('critical','alt-text',label + ': image missing alt',src);

  const tinyBody = await page.locator('main p, main li').evaluateAll((els) =>
    els.filter((el)=>{
      const s=getComputedStyle(el), r=el.getBoundingClientRect();
      return s.display!=='none' && r.width>0 && r.height>0 && parseFloat(s.fontSize)<16 && (el.textContent||'').trim().length>20;
    }).slice(0,12).map((el)=>({text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100),fontSize:getComputedStyle(el).fontSize}))
  );
  if (tinyBody.length) add('medium','readable-font-size',label + ': body copy below 16px',tinyBody);

  await context.close();
}

async function checkKeyboard() {
  const context = await browser.newContext({ viewport:{width:1280,height:800} });
  const page = await context.newPage();
  await goto(page);

  await page.keyboard.press('Tab');
  const skip = page.locator('a[href="#main"]');
  if (!(await skip.isVisible())) add('critical','skip-links','Skip link is not visible on focus');

  const focusables = page.locator('a[href], button:not([disabled])');
  const count = Math.min(await focusables.count(), 12);
  for (let i=0;i<count;i++) {
    const el=focusables.nth(i);
    await el.focus();
    const focusStyle=await el.evaluate((node)=>{
      const s=getComputedStyle(node);
      return {outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineColor:s.outlineColor};
    });
    if (focusStyle.outlineStyle==='none'||parseFloat(focusStyle.outlineWidth)<2) add('critical','focus-states','Focusable element lacks >=2px visible outline',{index:i,style:focusStyle,text:(await el.innerText().catch(()=>'' )).slice(0,60)});
  }
  await context.close();
}

async function checkMobileDialog() {
  const context = await browser.newContext({ viewport:{width:375,height:812}, isMobile:true, hasTouch:true, deviceScaleFactor:2 });
  const page = await context.newPage();
  await goto(page);
  const burger=page.locator('header button[aria-controls="construction-mobile-menu"]');
  await burger.click();
  const dialog=page.locator('#construction-mobile-menu');
  const firstFocused=await page.evaluate(()=>document.activeElement?.closest('#construction-mobile-menu')!==null);
  if(!firstFocused) add('critical','focus-management','Mobile menu does not move focus into dialog');
  for(let i=0;i<12;i++) await page.keyboard.press('Tab');
  const escaped=await page.evaluate(()=>document.activeElement?.closest('#construction-mobile-menu')===null);
  if(escaped) add('high','focus-management','Keyboard focus can escape the modal mobile menu');
  await page.keyboard.press('Escape');
  const returned=await burger.evaluate((el)=>document.activeElement===el);
  if(!returned) add('high','focus-management','Focus is not returned to menu trigger after Escape');
  await context.close();
}

async function checkReducedMotion() {
  const context=await browser.newContext({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  const page=await context.newPage();
  await goto(page);
  const state=await page.locator('.reveal').first().evaluate((el)=>{
    const s=getComputedStyle(el);
    return {transitionDuration:s.transitionDuration,transform:s.transform,opacity:s.opacity,scroll:getComputedStyle(document.documentElement).scrollBehavior};
  });
  if(state.transitionDuration!=='0s'||state.transform!=='none'||state.opacity!=='1'||state.scroll!=='auto') add('critical','reduced-motion','Reduced motion preference not fully respected',state);
  await context.close();
}

async function checkContrast() {
  const context=await browser.newContext({ viewport:{width:1440,height:900} });
  const page=await context.newPage();
  await goto(page);
  const failures=await page.evaluate(() => {
    const parse=(value)=>{
      const m=value.match(/rgba?\(([^)]+)\)/);
      if(!m)return null;
      const parts=m[1].replaceAll(',',' ').split(/\s+/).filter(Boolean).map(Number);
      return {r:parts[0],g:parts[1],b:parts[2],a:Number.isFinite(parts[3])?parts[3]:1};
    };
    const comp=(fg,bg)=>({r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a),a:1});
    const lum=(c)=>{
      const f=(v)=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
      return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);
    };
    const ratio=(a,b)=>{const x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+0.05)/(lo+0.05)};
    const out=[];
    const nodes=[...document.querySelectorAll('main span, main p, footer span, footer p, footer h3, footer a, header a')];
    for(const el of nodes){
      const text=(el.textContent||'').trim().replace(/\s+/g,' ');
      if(!text)continue;
      const s=getComputedStyle(el), r=el.getBoundingClientRect();
      const size=parseFloat(s.fontSize), weight=parseInt(s.fontWeight)||400;
      if(s.display==='none'||s.visibility==='hidden'||r.width<1||r.height<1||size>18.66)continue;
      let bgEl=el, bg=null, uncertain=false;
      while(bgEl&&bgEl!==document.documentElement){
        const bs=getComputedStyle(bgEl);
        if(bs.backgroundImage!=='none'){uncertain=true;break}
        const c=parse(bs.backgroundColor);
        if(c&&c.a>=0.99){bg=c;break}
        bgEl=bgEl.parentElement;
      }
      if(!bg||uncertain)continue;
      let fg=parse(s.color);
      if(!fg)continue;
      if(fg.a<1)fg=comp(fg,bg);
      const cr=ratio(fg,bg);
      const threshold=(size>=18.66||(size>=14&&weight>=700))?3:4.5;
      if(cr+0.01<threshold)out.push({text:text.slice(0,90),ratio:Number(cr.toFixed(2)),threshold,size,weight,color:s.color,background:getComputedStyle(bgEl).backgroundColor});
    }
    return out.slice(0,20);
  });
  if(failures.length)add('critical','color-contrast','Visible small text below WCAG contrast threshold',failures);
  await context.close();
}

try {
  await checkViewport('small-phone-375',{width:375,height:812},{touch:true});
  await checkViewport('tablet-768',{width:768,height:1024},{touch:true});
  await checkViewport('landscape-844x390',{width:844,height:390},{touch:true});
  await checkViewport('desktop-1440',{width:1440,height:900});
  await checkKeyboard();
  await checkMobileDialog();
  await checkReducedMotion();
  await checkContrast();

  console.log('UI_UX_PRO_MAX_AUDIT_START');
  for (const f of findings) console.log(JSON.stringify(f));
  console.log('UI_UX_PRO_MAX_AUDIT_SUMMARY', JSON.stringify({
    critical:findings.filter((f)=>f.severity==='critical').length,
    high:findings.filter((f)=>f.severity==='high').length,
    medium:findings.filter((f)=>f.severity==='medium').length,
    total:findings.length,
  }));
  if(findings.some((f)=>f.severity==='critical')) process.exitCode=2;
} finally {
  await browser.close();
}
