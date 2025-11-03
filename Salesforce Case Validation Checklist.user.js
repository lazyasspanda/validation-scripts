// ==UserScript==
// @name         Salesforce Case Validation Checklist
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Cloud-integrated validation checklist with manager dashboard
// @author       Pratik Chabria
// @match        https://dealeron.lightning.force.com/*
// @match        https://*.lightning.force.com/*
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?domain=salesforce.com
// @updateURL    https://raw.githubusercontent.com/lazyasspanda/validation-scripts/main/Salesforce%20Case%20Validation%20Checklist.user.js
// @downloadURL  https://raw.githubusercontent.com/lazyasspanda/validation-scripts/main/Salesforce%20Case%20Validation%20Checklist.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) return;
    if (window.location.pathname.includes('/resource/') || window.location.pathname.includes('/RichText') || window.location.search.includes('E2CP__RichText')) return;

    console.log('[*] Validation Checklist v7.1 Loaded');

    let currentURL = window.location.href;
    let checklistInitialized = false;

    const CLOUD_CONFIG = {
        googleWebhookUrl: 'https://script.google.com/macros/s/AKfycbwIygHN8Dvh4uYNYqBOdhEST9snk5kXh_BcfumOgvznTtsebZVeiXpJAOOhkhKjB8ns/exec'
    };

    function init() {
        if (checklistInitialized || window.self !== window.top) return;
        checklistInitialized = true;
        createChecklist();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setInterval(() => {
        if (window.self !== window.top || window.location.href === currentURL) return;
        currentURL = window.location.href;
        document.getElementById('validationSidebar')?.remove();
        document.getElementById('validationTrigger')?.remove();
        checklistInitialized = false;
        init();
    }, 1000);

    function createChecklist() {
        if (window.self !== window.top) return;

        const colors = {
            brand: '#19325d', brandDark: '#0e1d38', brandLight: '#2a4a8d',
            orange: '#fb741c', orangeLight: '#ff8c42', white: '#FFFFFF',
            neutral1: '#F3F3F3', neutral2: '#ECEBEA', neutral3: '#DDDBDA',
            neutral5: '#706E6B', neutral6: '#3E3E3C', neutral7: '#181818',
            success: '#2ecc71', successLight: '#27ae60',
            error: '#e74c3c', errorLight: '#c0392b', teal: '#06A59A'
        };

        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .validation-content::-webkit-scrollbar { width: 6px; }
            .validation-content::-webkit-scrollbar-track { background: ${colors.neutral1}; }
            .validation-content::-webkit-scrollbar-thumb { background: ${colors.brand}; border-radius: 3px; }
            .confetti-particle { position: fixed; width: 8px; height: 8px; background: ${colors.brand}; opacity: 0; z-index: 99999; pointer-events: none; animation: confettiFall 3s ease-out forwards; }
            @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        `;
        document.head.appendChild(styleSheet);

        const triggerBar = document.createElement('div');
        triggerBar.id = 'validationTrigger';
        triggerBar.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 6px;"><div style="font-size: 20px;">&#9658;</div><div style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;">VALIDATION</div></div>`;
        triggerBar.style.cssText = `position: fixed; top: 50%; right: 0; transform: translateY(-50%); width: 40px; height: 130px; background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); cursor: pointer; z-index: 9999; border-radius: 10px 0 0 10px; box-shadow: -4px 0 20px rgba(25, 50, 93, 0.4); color: ${colors.white}; transition: all 0.3s ease; border: 2px solid ${colors.brandLight}; border-right: none;`;
        
        triggerBar.addEventListener('mouseenter', () => { triggerBar.style.transform = 'translateY(-50%) translateX(-6px)'; });
        triggerBar.addEventListener('mouseleave', () => { triggerBar.style.transform = 'translateY(-50%)'; });

        const drawer = document.createElement('div');
        drawer.id = 'validationSidebar';
        drawer.style.cssText = `position: fixed; top: 0; right: -460px; width: 460px; height: 100%; background: ${colors.white}; box-shadow: -6px 0 40px rgba(0, 0, 0, 0.3); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; color: ${colors.neutral7}; display: flex; flex-direction: column;`;

        const header = document.createElement('div');
        header.style.cssText = `background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); padding: 12px 20px 0 20px; position: relative;`;
        header.innerHTML = `<button id="closeDrawer" style="position: absolute; top: 8px; right: 12px; background: ${colors.white}; border: none; width: 28px; height: 28px; border-radius: 50%; font-size: 18px; cursor: pointer; color: ${colors.brand}; font-weight: bold;">&#10005;</button><div style="text-align: center; margin-bottom: 12px;"><h2 style="margin: 0 0 3px 0; font-size: 18px; font-weight: 800; color: ${colors.white};">Validation Hub</h2><p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.9);">Cloud Enabled</p></div><div style="display: flex; gap: 0; background: ${colors.brandDark}; border-radius: 6px 6px 0 0; overflow: hidden;"><button id="tabChecklist" style="flex: 1; padding: 12px; background: ${colors.white}; border: none; color: ${colors.brand}; font-weight: 700; font-size: 12px; cursor: pointer;">Checklist</button><button id="tabRecords" style="flex: 1; padding: 12px; background: ${colors.brandDark}; border: none; color: ${colors.white}; font-weight: 700; font-size: 12px; cursor: pointer;">Records</button></div>`;

        const contentContainer = document.createElement('div');
        contentContainer.className = 'validation-content';
        contentContainer.style.cssText = `flex: 1; overflow-y: auto; padding: 14px 20px; background: ${colors.neutral1};`;

        const checklistContent = document.createElement('div');
        checklistContent.id = 'checklistContent';

        const statsBadge = document.createElement('div');
        statsBadge.id = 'statsBadge';
        statsBadge.style.cssText = `background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); padding: 12px; border-radius: 10px; margin-bottom: 12px; color: ${colors.white}; text-align: center;`;
        statsBadge.innerHTML = `<div style="font-size: 11px; font-weight: 700; opacity: 0.9;">Validation Streak</div><div id="streakCount" style="font-size: 22px; font-weight: 900;">0</div>`;

        const quoteSection = document.createElement('div');
        quoteSection.style.cssText = `background: ${colors.white}; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${colors.brand};`;
        quoteSection.innerHTML = `<p id="funQuote" style="margin: 0; font-style: italic; font-size: 12px; color: ${colors.neutral6};">"Quality is not an act, it is a habit."</p>`;

        const form = document.createElement('form');
        form.id = 'validationForm';

        form.appendChild(createCard('Employee Name', `<input type="text" id="employeeNameInput" placeholder="Your full name" required style="width: 100%; padding: 11px; border: 2px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 600; box-sizing: border-box;">`, colors));
        form.appendChild(createCard('Case Number', `<input type="text" id="caseNumberInput" placeholder="e.g., 01503616" required style="width: 100%; padding: 11px; border: 2px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 600; box-sizing: border-box; font-family: monospace;">`, colors));
        form.appendChild(createValidationSection(colors));
        form.appendChild(createCaseTypeSection(colors));
        form.appendChild(createDetailedSection(colors));

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.innerHTML = 'Complete & Save';
        submitBtn.style.cssText = `width: 100%; padding: 14px; background: linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%); border: none; border-radius: 8px; color: ${colors.white}; font-size: 15px; font-weight: 900; cursor: pointer; margin-top: 14px; text-transform: uppercase;`;

        const timestampDisplay = document.createElement('div');
        timestampDisplay.id = 'timestampDisplay';
        timestampDisplay.style.cssText = `font-size: 10px; color: ${colors.neutral5}; text-align: center; margin-top: 10px; padding: 8px; background: ${colors.white}; border-radius: 6px;`;

        form.appendChild(submitBtn);
        form.appendChild(timestampDisplay);
        checklistContent.appendChild(statsBadge);
        checklistContent.appendChild(quoteSection);
        checklistContent.appendChild(form);

        const recordsContent = document.createElement('div');
        recordsContent.id = 'recordsContent';
        recordsContent.style.display = 'none';
        recordsContent.innerHTML = `<div style="text-align: center; padding: 16px 0;"><h3 style="margin: 0; font-size: 18px; color: ${colors.brand};">History</h3><p style="margin: 5px 0 0 0; font-size: 11px; color: ${colors.neutral5};">Your quality trail</p></div><div id="recordsList"></div>`;

        contentContainer.appendChild(checklistContent);
        contentContainer.appendChild(recordsContent);
        drawer.appendChild(header);
        drawer.appendChild(contentContainer);

        document.body.appendChild(triggerBar);
        document.body.appendChild(drawer);

        setupEventListeners(triggerBar, drawer, colors);
        updateStats(colors);
        loadRecords(colors);
    }

    function createCard(title, content, colors) {
        const card = document.createElement('div');
        card.style.cssText = `background: ${colors.white}; padding: 14px; border-radius: 8px; margin-bottom: 10px; border: 1px solid ${colors.neutral2};`;
        card.innerHTML = `<div style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: ${colors.brand};">${title}</div>${content}`;
        return card;
    }

    function createValidationSection(colors) {
        const section = document.createElement('div');
        section.innerHTML = createCard('Basic Items', `<div style="font-size: 11px; line-height: 1.7; margin-bottom: 12px;">✓ Subject Line<br>✓ Example URL<br>✓ Dealer ID<br>✓ Category<br>✓ Sub-Category</div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"><button type="button" class="yes-no-btn" data-group="basicValidation" data-value="yes" style="padding: 11px; border: 3px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 800; cursor: pointer;">YES</button><button type="button" class="yes-no-btn" data-group="basicValidation" data-value="no" style="padding: 11px; border: 3px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 800; cursor: pointer;">NO</button></div>`, colors).outerHTML;
        return section;
    }

    function createCaseTypeSection(colors) {
        const section = document.createElement('div');
        section.innerHTML = createCard('Case Type Verification', `<div style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">Have you made sure that:</div><div style="display: grid; gap: 8px;"><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="enterprise" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">Enterprise cases escalate to <strong>Enterprise queue</strong></span></label><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="gm" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">GM cases escalate to <strong>GM queue</strong></span></label><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="general" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">General Data Support escalate to <strong>General queue</strong></span></label><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="design" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">Design cases escalate to <strong>Design queue</strong></span></label><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="generalsupport" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">General Support escalate to <strong>General Support queue</strong></span></label><label style="display: flex; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer;"><input type="radio" name="caseTypeSelection" value="selfwork" class="case-type-radio" style="width: 16px; cursor: pointer;"><span style="font-size: 12px;">Self Work</span></label></div>`, colors).outerHTML;
        return section;
    }

    function createDetailedSection(colors) {
        const section = document.createElement('div');
        section.innerHTML = createCard('Detailed Items', `<div style="font-size: 11px; line-height: 1.7; margin-bottom: 12px;">✓ Request with attachments<br>✓ Approvals received<br>✓ Correct website<br>✓ Case reviewed<br>✓ Customer updated<br>✓ Case status correct<br>✓ System Edit updated<br>✓ Link added<br>✓ Screenshots added<br>✓ Email details<br>✓ OEM guidelines</div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"><button type="button" class="yes-no-btn" data-group="detailedValidation" data-value="yes" style="padding: 11px; border: 3px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 800; cursor: pointer;">YES</button><button type="button" class="yes-no-btn" data-group="detailedValidation" data-value="no" style="padding: 11px; border: 3px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; font-size: 13px; font-weight: 800; cursor: pointer;">NO</button></div>`, colors).outerHTML;
        return section;
    }

    function getAllRecords() {
        try {
            return JSON.parse(localStorage.getItem('validationRecords') || '[]');
        } catch (e) {
            return [];
        }
    }

    function updateStats(colors) {
        const streakCount = document.getElementById('streakCount');
        if (streakCount) streakCount.textContent = getAllRecords().length;
    }

    function toggleDrawer() {
        const drawer = document.getElementById('validationSidebar');
        if (drawer) drawer.style.right = drawer.style.right === '0px' ? '-460px' : '0px';
    }

    function switchTab(tab, colors) {
        const checklistContent = document.getElementById('checklistContent');
        const recordsContent = document.getElementById('recordsContent');
        const tabChecklist = document.getElementById('tabChecklist');
        const tabRecords = document.getElementById('tabRecords');

        if (tab === 'checklist') {
            checklistContent.style.display = 'block';
            recordsContent.style.display = 'none';
            tabChecklist.style.background = colors.white;
            tabChecklist.style.color = colors.brand;
            tabRecords.style.background = colors.brandDark;
            tabRecords.style.color = colors.white;
        } else {
            checklistContent.style.display = 'none';
            recordsContent.style.display = 'block';
            tabRecords.style.background = colors.white;
            tabRecords.style.color = colors.brand;
            tabChecklist.style.background = colors.brandDark;
            tabChecklist.style.color = colors.white;
            loadRecords(colors);
        }
    }

    function loadRecords(colors) {
        const recordsList = document.getElementById('recordsList');
        const records = getAllRecords();
        
        if (records.length === 0) {
            recordsList.innerHTML = `<div style="text-align: center; padding: 36px 16px; background: ${colors.white}; border-radius: 10px;"><p style="margin: 0; font-size: 14px; color: ${colors.neutral6};">No records yet</p></div>`;
        } else {
            recordsList.innerHTML = [...records].reverse().map((record, index) => `<div style="background: ${colors.white}; padding: 14px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${colors.brand};"><div style="font-size: 15px; font-weight: 900; color: ${colors.brand};">#${record.recordNumber}</div><div style="font-size: 11px; margin: 4px 0;"><strong>Emp:</strong> ${record.employeeName}</div><div style="font-size: 11px; margin: 4px 0;"><strong>Case:</strong> ${record.caseNumber}</div><div style="font-size: 11px; margin: 4px 0;"><strong>Type:</strong> ${record.caseTypeVerification}</div><div style="font-size: 10px; color: ${colors.neutral5}; margin-top: 6px;">${record.readableTime}</div></div>`).join('');
        }
    }

    function createConfetti(colors) {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-particle';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = [colors.brand, colors.success, colors.teal][Math.floor(Math.random() * 3)];
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    function syncToCloud(formData) {
        console.log('[*] Syncing to cloud...');
        GM_xmlhttpRequest({
            method: 'POST',
            url: CLOUD_CONFIG.googleWebhookUrl,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(formData),
            onload: () => console.log('[+] Cloud sync OK'),
            onerror: () => console.log('[!] Cloud sync failed')
        });
    }

    function setupEventListeners(triggerBar, drawer, colors) {
        triggerBar.addEventListener('click', toggleDrawer);
        document.getElementById('closeDrawer').addEventListener('click', toggleDrawer);
        document.getElementById('tabChecklist').addEventListener('click', () => switchTab('checklist', colors));
        document.getElementById('tabRecords').addEventListener('click', () => switchTab('records', colors));

        const funQuotes = [
            'Quality is not an act, it is a habit',
            'Excellence is doing ordinary things extraordinarily well',
            'The devil is in the details, but so is salvation',
            'Your work is your signature - make it count',
            'Attention to detail is the difference between good and great',
            'Do it right the first time, every time',
            'Quality means doing it right when no one is looking'
        ];

        let quoteIndex = 0;
        setInterval(() => {
            const funQuote = document.getElementById('funQuote');
            if (funQuote) {
                quoteIndex = (quoteIndex + 1) % funQuotes.length;
                funQuote.textContent = `"${funQuotes[quoteIndex]}"`;
            }
        }, 10000);

        document.querySelectorAll('.case-type-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.case-type-radio').forEach(r => {
                    const label = r.closest('label');
                    label.style.borderColor = colors.neutral3;
                    label.style.background = colors.white;
                });
                const label = e.target.closest('label');
                label.style.borderColor = colors.brand;
                label.style.background = `rgba(25, 50, 93, 0.05)`;
            });
        });

        document.querySelectorAll('.yes-no-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const group = btn.getAttribute('data-group');
                const value = btn.getAttribute('data-value');
                document.querySelectorAll(`.yes-no-btn[data-group="${group}"]`).forEach(b => {
                    b.style.background = colors.white;
                    b.style.borderColor = colors.neutral3;
                });
                btn.style.background = value === 'yes' ? colors.success : colors.error;
                btn.style.borderColor = value === 'yes' ? colors.success : colors.error;
                btn.style.color = colors.white;
                btn.setAttribute('data-selected', value);
            });
        });

        function updateTimestamp() {
            const ts = document.getElementById('timestampDisplay');
            if (ts) ts.textContent = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        updateTimestamp();
        setInterval(updateTimestamp, 1000);

        const form = document.getElementById('validationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const empName = document.getElementById('employeeNameInput').value.trim();
                const caseNum = document.getElementById('caseNumberInput').value.trim();
                const basicSel = document.querySelector('.yes-no-btn[data-group="basicValidation"][data-selected]');
                const caseTypeSel = document.querySelector('.case-type-radio:checked');
                const detailedSel = document.querySelector('.yes-no-btn[data-group="detailedValidation"][data-selected]');

                if (!empName || !caseNum || !basicSel || !caseTypeSel || !detailedSel) {
                    alert('Please complete all fields!');
                    return;
                }

                const recordNumber = getAllRecords().length + 1;
                const formData = {
                    employeeName: empName,
                    caseNumber: caseNum,
                    timestamp: new Date().toISOString(),
                    readableTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    basicValidation: basicSel.getAttribute('data-value') === 'yes' ? 'Yes' : 'No',
                    caseTypeVerification: caseTypeSel.value.toUpperCase(),
                    detailedValidation: detailedSel.getAttribute('data-value') === 'yes' ? 'Yes' : 'No',
                    recordNumber: recordNumber,
                    verificationHash: 'VERIFIED_' + Date.now()
                };

                // Save locally
                const records = getAllRecords();
                records.push(formData);
                localStorage.setItem('validationRecords', JSON.stringify(records));
                console.log('[+] Record saved:', recordNumber);

                // Show confetti & alert
                createConfetti(colors);
                alert(`✓ Record #${recordNumber} saved!\n\nSyncing to cloud...`);
                
                // Reset form
                form.reset();
                document.querySelectorAll('.yes-no-btn').forEach(btn => {
                    btn.style.background = colors.white;
                    btn.style.borderColor = colors.neutral3;
                    btn.style.color = colors.neutral7;
                    btn.removeAttribute('data-selected');
                });
                document.querySelectorAll('.case-type-radio').forEach(radio => {
                    const label = radio.closest('label');
                    label.style.borderColor = colors.neutral3;
                    label.style.background = colors.white;
                });
                
                updateStats(colors);
                switchTab('records', colors);
                
                // Close drawer after 1 second
                setTimeout(() => toggleDrawer(), 1000);
                
                // Sync cloud in background
                syncToCloud(formData);
            });
        }
    }
})();
