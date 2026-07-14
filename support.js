class Component extends DCLogic {
        constructor(props) {
          super(props);
          this.state = {
            screen: 'home', ceremony: null, step: 0,
            fam: { contact: '', phone: '', address: '', note: '' },
            mem: { gender: '男', calType: 'lunar', year: '', month: '', day: '', shichen: '' },
            qty: {}, suixi: '', last5: '', receipt: '',
            famContact: '', famPhone: '', apeace: '', awealth: ''
          };
          this.STEPS = ['intro', 'basic', 'birth', 'items', 'pay', 'done'];

          this.attendPeaceOpts = [
            { v: 'p_y', label: '能親自到場' },
            { v: 'p_n', label: '無法親自到場' },
            { v: 'p_x', label: '無報名此燈別' }
          ];
          this.attendWealthOpts = [
            { v: 'w_y', label: '能親自到場' },
            { v: 'w_n', label: '無法親自到場' },
            { v: 'w_x', label: '無報名此燈別' }
          ];
        }

        f(n) { return '$' + Number(n).toLocaleString('en-US'); }

        rawGroups(c) {
          if (c === 'lighting') return [{ title: '', items: [
            { id: 'l_jie', name: '祭解', desc: '補運祭解，化解流年不順', price: 1000, unlimited: true },
            { id: 'l_sp', name: '小平安燈', desc: '內含祭解，祈求平安順遂', price: 1800, quota: 286, taken: 0 },
            { id: 'l_bp', name: '大平安燈', desc: '內含祭解，闔家平安、福運亨通', price: 12000, quota: 12, taken: 0 },
            { id: 'l_sc', name: '小財神燈', desc: '招財納福', price: 1800, quota: 126, taken: 0 },
            { id: 'l_bc', name: '大財神燈', desc: '財源廣進、事業興隆', price: 15000, quota: 66, taken: 0 },
            { id: 'l_ys', name: '藥師燈', desc: '內含祭解，消災延壽、身體健康', price: 15000, quota: 36, taken: 0 }
          ]}];
          if (c === 'pudu') return [{ title: '', items: [
            { id: 'p_zan', name: '贊普', desc: '總壇贊普，功德圓滿', price: 2000, unlimited: true },
            { id: 'p_jia', name: '報恩家普', desc: '以家庭為單位普施（可多筆）', price: 1200, unlimited: true },
            { id: 'p_chao', name: '薦拔超渡', desc: '超薦歷代祖先、嬰靈（可多筆）', price: 600, unlimited: true },
            { id: 'p_jiu', name: '救罪法懺', desc: '禮懺解冤（可多筆）', price: 800, unlimited: true },
            { id: 'p_en', name: '恩親法懺', desc: '報答親恩', price: 800, unlimited: true },
            { id: 'p_sui', name: '隨喜功德', desc: '隨喜金額，量力而為', price: 0, custom: true, unlimited: true }
          ]}];
          const twelve = ['西華金母斗', '無極老母斗', '觀世音菩薩斗', '廣澤尊王斗', '真武大帝玄天斗', '開漳聖王斗', '九天玄女斗', '地母元君斗', '文財神斗', '武財神斗', '關聖帝君斗', '天上聖母斗'];
          return [
            { title: '五福祥運斗', note: '名額有限', items: [
              { id: 'd_yu', name: '玉皇至尊禮斗', desc: '至尊斗首', price: 6000, quota: 1, taken: 0 },
              { id: 'd_ds', name: '大勢至菩薩禮斗', price: 3600, quota: 2, taken: 1 },
              { id: 'd_wd', name: '五斗星君禮斗', price: 3600, quota: 2, taken: 0 },
              { id: 'd_sg', name: '三官大帝財斗', price: 3600, quota: 3, taken: 1 },
              { id: 'd_wl', name: '五路財神財斗', price: 3600, quota: 3, taken: 2 }
            ]},
            { title: '十二神尊斗', note: '每斗位限 6 名', items: twelve.map((n, i) => ({ id: 'd12_' + i, name: n, price: 1800, quota: 6, taken: 0 })) },
            { title: '特殊斗首', note: '福祿貴人斗、魁星斗不限名額', items: [
              { id: 'd_gz', name: '玉皇三公主斗首', desc: '本殿主祀，尊榮斗首', price: 12000, quota: 1, taken: 1 },
              { id: 'd_fgz', name: '玉皇三公主副斗首', price: 6000, quota: 2, taken: 0 },
              { id: 'd_fl', name: '福祿貴人斗', desc: '招貴人、添福祿', price: 1200, unlimited: true },
              { id: 'd_kx', name: '魁星斗', desc: '文昌利試，金榜題名', price: 600, unlimited: true }
            ]}
          ];
        }

        buildGroups() {
          const c = this.state.ceremony; if (!c) return [];
          const qty = this.state.qty;
          const single = c === 'lighting';
          const locks = {};
          if (single) {
            const sp = qty['l_sp'] > 0, bp = qty['l_bp'] > 0, sc = qty['l_sc'] > 0, bc = qty['l_bc'] > 0, ys = qty['l_ys'] > 0;
            if (sp || bp || ys) locks['l_jie'] = '已內含祭解，免勾選';
            if (bp) locks['l_sp'] = '已選大平安燈';
            if (sp) locks['l_bp'] = '已選小平安燈';
            if (bc) locks['l_sc'] = '已選大財神燈';
            if (sc) locks['l_bc'] = '已選小財神燈';
          }
          return this.rawGroups(c).map(g => ({
            title: g.title || '', note: g.note || '', hasTitle: !!g.title,
            items: g.items.map(it => {
              const q = qty[it.id] || 0;
              const remain = it.unlimited ? null : (it.quota - it.taken);
              const isFull = !it.unlimited && remain <= 0;
              const maxAdd = it.unlimited ? 99 : remain;
              const lock = locks[it.id] || null;
              const disabled = isFull || !!lock;
              const sel = it.custom ? (Number(this.state.suixi) > 0) : (q > 0);
              const statusLabel = lock ? lock : (it.unlimited ? '不限名額' : (isFull ? '已額滿' : ('剩餘 ' + remain + ' 名')));
              const statusColor = lock ? '#9A8564' : (it.unlimited ? '#8A7A55' : (isFull ? '#B23B34' : (remain <= 10 ? '#C6871B' : '#4E7A4E')));
              return {
                id: it.id, name: it.name, desc: it.desc || '',
                isCustom: !!it.custom,
                priceLabel: it.custom ? '隨喜' : this.f(it.price),
                remainLabel: statusLabel,
                remainStyle: 'font-size:13px; font-weight:700; color:' + statusColor,
                isFull, qty: q, qtyLabel: String(q), selected: sel,
                showStepper: sel && !it.custom && !single,
                checkMark: sel ? '✓' : '',
                checkSty: 'flex:none; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; margin-top:2px; color:' + (sel ? '#FFF9ED' : '#C9BB9B') + '; background:' + (sel ? '#B23B34' : 'transparent') + '; border:1.5px solid ' + (sel ? '#B23B34' : '#D8C79E'),
                cardStyle: 'display:flex; flex-direction:column; gap:0px; padding:16px 18px; border-radius:18px; border:1.5px solid ' + (sel ? '#B23B34' : '#E7DBC4') + '; background:' + (sel ? '#FDF4EF' : '#FFFCF4') + '; box-shadow:' + (sel ? '0 8px 22px rgba(178,59,52,0.13)' : '0 1px 2px rgba(60,49,40,0.04)') + '; opacity:' + (disabled ? '0.5' : '1') + '; transition:all .18s ease;',
                onToggle: disabled ? (() => {}) : (() => this.toggleItem(it.id)),
                onInc: () => this.incItem(it.id, maxAdd),
                onDec: () => this.decItem(it.id)
              };
            })
          }));
        }

        toggleItem(id) {
          const q = { ...this.state.qty };
          q[id] = q[id] ? 0 : 1;
          if (this.state.ceremony === 'lighting' && q[id] && (id === 'l_sp' || id === 'l_bp' || id === 'l_ys')) q['l_jie'] = 0;
          this.setState({ qty: q });
        }
        incItem(id, max) { const q = { ...this.state.qty }; q[id] = Math.min((q[id] || 0) + 1, max); this.setState({ qty: q }); }
        decItem(id) { const q = { ...this.state.qty }; q[id] = Math.max((q[id] || 0) - 1, 0); this.setState({ qty: q }); }

        selection() {
          const c = this.state.ceremony; const out = []; let total = 0;
          if (c) this.rawGroups(c).forEach(g => g.items.forEach(it => {
            if (it.custom) { const a = Number(this.state.suixi) || 0; if (a > 0) { out.push({ name: it.name, qtyLabel: '', subLabel: this.f(a) }); total += a; } return; }
            const q = this.state.qty[it.id] || 0;
            if (q > 0) { out.push({ name: it.name, qtyLabel: q > 1 ? ('× ' + q) : '', subLabel: this.f(it.price * q) }); total += it.price * q; }
          }));
          return { list: out, total };
        }

        stepKey() { return this.STEPS[this.state.step]; }
        canNext() {
          const k = this.stepKey(); const s = this.state;
          if (k === 'basic') return !!(s.fam.contact.trim() && s.fam.phone.trim().length >= 8);
          if (k === 'birth') return !!(s.mem.year && s.mem.month && s.mem.day && s.mem.shichen);
          if (k === 'items') {
            if (this.selection().total <= 0) return false;
            if (s.ceremony === 'lighting') return !!(s.apeace && s.awealth && s.famContact.trim() && s.famPhone.trim().length >= 8);
            return true;
          }
          if (k === 'pay') return s.last5.trim().length === 5;
          return true;
        }

        scrollTop() { if (this.panelEl) this.panelEl.scrollTop = 0; }
        openCer(key) { this.setState({ screen: 'flow', ceremony: key, step: 0 }); requestAnimationFrame(() => this.scrollTop()); }
        goHome() { this.setState({ screen: 'home', ceremony: null, step: 0, qty: {}, suixi: '', last5: '', receipt: '', famContact: '', famPhone: '', apeace: '', awealth: '', fam: { contact: '', phone: '', address: '', note: '' }, mem: { gender: '男', calType: 'lunar', year: '', month: '', day: '', shichen: '' } }); }
        next() {
          const i = this.state.step;
          if (i >= this.STEPS.length - 1) return;
          if (!this.canNext()) return;
          const ni = i + 1; const patch = { step: ni };
          if (this.STEPS[ni] === 'done') {
            patch.receipt = 'R2026' + String(Math.floor(Math.random() * 90000) + 10000);
            
            // 將資料同步送往 Google Sheets
            const payload = {
              ...this.state,
              receipt: patch.receipt,
              totalAmt: this.selection().total
            };
            fetch('https://script.google.com/macros/s/AKfycbx9U6T5oRl1VkhiJXE59jW_kudSWobhaW9LBr7wIZ18GbExDmRxtIMf_rdLi4hYOCqy6g/exec', {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify(payload)
            }).catch(err => console.log('Google Sheets Sync Error:', err));
          }
          this.setState(patch); requestAnimationFrame(() => this.scrollTop());
        }
        back() { if (this.state.step > 0) { this.setState({ step: this.state.step - 1 }); requestAnimationFrame(() => this.scrollTop()); } else this.goHome(); }

        setFam(k, v) { this.setState({ fam: { ...this.state.fam, [k]: v } }); }
        setMem(k, v) { this.setState({ mem: { ...this.state.mem, [k]: v } }); }

        segSty(active) { const base = 'flex:1; padding:14px 0; border-radius:12px; font-size:16px; font-weight:600; cursor:pointer; transition:all .15s ease; '; return active ? base + 'border:1.5px solid #B23B34; background:#B23B34; color:#FFF9ED;' : base + 'border:1.5px solid #E6DAC2; background:#FFFCF4; color:#6E6355;'; }

        renderVals() {
          const s = this.state; const cer = CEREMONIES[s.ceremony] || {};
          const k = this.stepKey();
          const sel = this.selection();
          const stepTitles = { intro: '法會介紹', basic: '基本資料', birth: '生辰資料', items: cer.itemsTitle || '選擇項目', pay: '確認與匯款', done: '報名完成' };
          const progLabels = ['介紹', '資料', '生辰', '選項', '付款'];
          const cur = s.step;
          const progress = progLabels.map((label, i) => {
            const state = cur > i ? 'done' : (cur === i ? 'now' : 'todo');
            return { label, bar: state === 'todo' ? '#E2D4B6' : '#B23B34', color: state === 'now' ? '#B23B34' : (state === 'done' ? '#A8823C' : '#B3A88F'), weight: state === 'now' ? '700' : '500' };
          });
          const primaryLabels = { intro: '開始報名', basic: '下一步', birth: '下一步', items: '前往付款', pay: '確認送出', done: '' };
          const can = this.canNext();
          const isLighting = s.ceremony === 'lighting';
          const monthOptions = s.mem.calType === 'lunar' ? MONTHS_LUNAR : MONTHS_SOLAR;

          const radioVM = (opts, curVal, setter) => opts.map(o => ({
            label: o.label, selected: curVal === o.v,
            rowStyle: 'display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:12px; border:1.5px solid ' + (curVal === o.v ? '#B23B34' : '#E6DAC2') + '; background:' + (curVal === o.v ? '#FDF4EF' : '#FFFCF4') + '; cursor:pointer;',
            dotStyle: 'flex:none; width:22px; height:22px; border-radius:50%; border:2px solid ' + (curVal === o.v ? '#B23B34' : '#D8C79E') + '; display:flex; align-items:center; justify-content:center;',
            dotInner: 'width:11px; height:11px; border-radius:50%; background:' + (curVal === o.v ? '#B23B34' : 'transparent') + ';',
            onSelect: () => setter(o.v)
          }));
          const primaryStyle = 'width:100%; padding:16px; border:none; border-radius:14px; font-size:17px; font-weight:700; cursor:' + (can ? 'pointer' : 'not-allowed') + '; background:' + (can ? '#B23B34' : '#D8CBB0') + '; color:' + (can ? '#FFF9ED' : '#F6EFE1') + '; transition:all .15s ease;';

          return {
            inFlow: s.screen === 'flow', inClosed: s.screen === 'closed',
            isIntro: k === 'intro', isBasic: k === 'basic', isBirth: k === 'birth', isItems: k === 'items', isPay: k === 'pay', isDone: k === 'done',
            showFooter: k !== 'done', showFooterTotal: (k === 'items' || k === 'pay'), showProgress: k !== 'done',
            cerName: cer.name, cerSub: cer.sub, cerPeriod: cer.period, cerPlace: cer.place, cerDesc: cer.desc, cerYear: cer.year || '',
            itemsTitle: cer.itemsTitle, itemsNote: cer.itemsNote,
            isLighting, notLighting: !isLighting,
            bank: BANK_INFO[s.ceremony] || BANK_INFO.pudu,
            attendPeaceVM: radioVM(this.attendPeaceOpts, s.apeace, (v) => this.setState({ apeace: v })),
            attendWealthVM: radioVM(this.attendWealthOpts, s.awealth, (v) => this.setState({ awealth: v })),
            famContact: s.famContact, famPhone: s.famPhone,
            onFamContact: (e) => this.setState({ famContact: e.target.value }),
            onFamPhone: (e) => this.setState({ famPhone: e.target.value }),
            stepTitle: stepTitles[k], progress,
            primaryLabel: primaryLabels[k], primaryStyle,
            groups: this.buildGroups(),
            selList: sel.list, totalLabel: this.f(sel.total),
            countLabel: sel.list.length > 0 ? (sel.list.length + ' 項') : '尚未選擇',
            years: ROC_YEARS, months: monthOptions, days: DAYS, shichens: SHICHENS,
            fam: s.fam, mem: s.mem, suixi: s.suixi, last5: s.last5, receipt: s.receipt,
            doneName: s.fam.contact || '—',
            gMaleSty: this.segSty(s.mem.gender === '男'), gFemaleSty: this.segSty(s.mem.gender === '女'),
            cLunarSty: this.segSty(s.mem.calType === 'lunar'), cSolarSty: this.segSty(s.mem.calType === 'solar'),
            openLighting: () => this.openCer('lighting'), openPudu: () => this.openCer('pudu'), openLidou: () => this.openCer('lidou'),
            showClosedDemo: () => this.setState({ screen: 'closed' }),
            goHome: () => this.goHome(), next: () => this.next(), back: () => this.back(), onPrimary: () => this.next(),
            setPanel: (el) => { this.panelEl = el; },
            onContact: (e) => this.setFam('contact', e.target.value), onPhone: (e) => this.setFam('phone', e.target.value),
            onAddress: (e) => this.setFam('address', e.target.value), onNote: (e) => this.setFam('note', e.target.value),
            gMale: () => this.setMem('gender', '男'), gFemale: () => this.setMem('gender', '女'),
            cLunar: () => this.setMem('calType', 'lunar'), cSolar: () => this.setMem('calType', 'solar'),
            onYear: (e) => this.setMem('year', e.target.value), onMonth: (e) => this.setMem('month', e.target.value),
            onDay: (e) => this.setMem('day', e.target.value), onShichen: (e) => this.setMem('shichen', e.target.value),
            onSuixi: (e) => this.setState({ suixi: (e.target.value || '').replace(/[^0-9]/g, '') }),
            onLast5: (e) => this.setState({ last5: (e.target.value || '').replace(/[^0-9]/g, '').slice(0, 5) })
          };
        }
      }
    