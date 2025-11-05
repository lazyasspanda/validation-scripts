// ==UserScript==
// @name         Salesforce Case Validation Checklist
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Cloud-integrated validation checklist with manager dashboard
// @author       Pratik Chabria
// @match        https://dealeron.lightning.force.com/*
// @match        https://*.lightning.force.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @updateURL    https://raw.githubusercontent.com/lazyasspanda/validation-scripts/raw/refs/heads/main/Salesforce%20Case%20Validation%20Checklist.user.js
// @downloadURL  https://raw.githubusercontent.com/lazyasspanda/validation-scripts/raw/refs/heads/main/Salesforce%20Case%20Validation%20Checklist.user.js
// @homepageURL  https://github.com/lazyasspanda/validation-scripts
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @icon         https://www.google.com/s2/favicons?domain=salesforce.com
// @run-at       document-start
// ==/UserScript==

(async () => {
  const currentVersion = '7.1';
  const versionUrl = 'https://raw.githubusercontent.com/pratikchabria/salesforce-case-validation/main/Salesforce-Case-Validation-Checklist.user.js';

  try {
    const response = await fetch(versionUrl);
    const text = await response.text();
    const match = text.match(/@version\s+([0-9.]+)/);
    const latestVersion = match ? match[1] : null;

    if (latestVersion && latestVersion !== currentVersion) {
      alert(`🚀 A new version (${latestVersion}) of the Validation Checklist is available! Please update from Tampermonkey.`);
    }
  } catch (err) {
    console.log('Update check failed:', err);
  }
})();

(function() {
    'use strict';

    if (window.self !== window.top) {
        console.log('[!] Validation Checklist: Running in iframe, exiting...');
        return;
    }

    if (window.location.pathname.includes('/resource/') ||
        window.location.pathname.includes('/RichText') ||
        window.location.search.includes('E2CP__RichText')) {
        console.log('[!] Validation Checklist: Resource/RichText URL detected, exiting...');
        return;
    }

    console.log('[*] Validation Checklist Script Loaded in main window');

    let currentURL = window.location.href;
    let checklistInitialized = false;

    const CLOUD_CONFIG = {
        provider: 'google',
        googleWebhookUrl: 'https://script.google.com/macros/s/AKfycbwIygHN8Dvh4uYNYqBOdhEST9snk5kXh_BcfumOgvznTtsebZVeiXpJAOOhkhKjB8ns/exec',
        webhookUrl: 'https://your-webhook-url.com/api/validation'
    };

    function init() {
        if (checklistInitialized) return;
        if (window.self !== window.top) return;
        console.log('[*] Initializing checklist...');
        checklistInitialized = true;
        createChecklist();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setInterval(() => {
        if (window.self !== window.top) return;
        if (window.location.href !== currentURL) {
            currentURL = window.location.href;
            console.log('[*] URL changed, reinitializing...');
            const existing = document.getElementById('validationSidebar');
            if (existing) existing.remove();
            const existingTrigger = document.getElementById('validationTrigger');
            if (existingTrigger) existingTrigger.remove();
            checklistInitialized = false;
            init();
        }
    }, 1000);

    function createChecklist() {
        if (window.self !== window.top) {
            console.log('[!] Attempted to create checklist in iframe, aborting...');
            return;
        }

        console.log('[*] Creating validation checklist...');

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
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            .validation-content::-webkit-scrollbar { width: 6px; }
            .validation-content::-webkit-scrollbar-track { background: ${colors.neutral1}; }
            .validation-content::-webkit-scrollbar-thumb { background: ${colors.brand}; border-radius: 3px; }
            .validation-content::-webkit-scrollbar-thumb:hover { background: ${colors.brandDark}; }
            .confetti-particle { position: fixed; width: 8px; height: 8px; background: ${colors.brand}; opacity: 0; z-index: 99999; pointer-events: none; animation: confettiFall 3s ease-out forwards; }
            @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        `;
        document.head.appendChild(styleSheet);

        const triggerBar = document.createElement('div');
        triggerBar.id = 'validationTrigger';
        triggerBar.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 6px;"><div style="font-size: 20px;">&#9658;</div><div style="writing-mode: vertical-rl; text-orientation: mixed; font-size: 10px; font-weight: 700; letter-spacing: 1.5px;">VALIDATION</div></div>`;
        triggerBar.style.cssText = `position: fixed; top: 50%; right: 0; transform: translateY(-50%); width: 40px; height: 130px; background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); cursor: pointer; z-index: 9999; border-radius: 10px 0 0 10px; box-shadow: -4px 0 20px rgba(25, 50, 93, 0.4); color: ${colors.white}; transition: all 0.3s ease; border: 2px solid ${colors.brandLight}; border-right: none;`;

        triggerBar.addEventListener('mouseenter', () => {
            triggerBar.style.transform = 'translateY(-50%) translateX(-6px)';
            triggerBar.style.boxShadow = `-6px 0 30px rgba(25, 50, 93, 0.6)`;
        });
        triggerBar.addEventListener('mouseleave', () => {
            triggerBar.style.transform = 'translateY(-50%)';
            triggerBar.style.boxShadow = `-4px 0 20px rgba(25, 50, 93, 0.4)`;
        });

        const drawer = document.createElement('div');
        drawer.id = 'validationSidebar';
        drawer.style.cssText = `position: fixed; top: 0; right: -460px; width: 460px; height: 100%; background: ${colors.white}; box-shadow: -6px 0 40px rgba(0, 0, 0, 0.3); transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; color: ${colors.neutral7}; display: flex; flex-direction: column;`;

        const header = document.createElement('div');
        header.style.cssText = `background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); padding: 12px 20px 0 20px; position: relative; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);`;
        header.innerHTML = `
            <button id="closeDrawer" style="position: absolute; top: 8px; right: 12px; background: ${colors.white}; border: none; width: 28px; height: 28px; border-radius: 50%; font-size: 18px; cursor: pointer; color: ${colors.brand}; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; z-index: 10;">&#10005;</button>
            <div style="text-align: center; margin-bottom: 12px;">
                <h2 style="margin: 0 0 3px 0; font-size: 18px; font-weight: 800; color: ${colors.white}; letter-spacing: -0.3px;">Validation Hub</h2>
                <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.9); font-weight: 500;">Cloud Enabled</p>
            </div>
            <div style="display: flex; gap: 0; background: ${colors.brandDark}; border-radius: 6px 6px 0 0; overflow: hidden;">
                <button id="tabChecklist" class="tab-btn" style="flex: 1; padding: 12px; background: ${colors.white}; border: none; color: ${colors.brand}; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.3s ease;"><div style="display: flex; align-items: center; justify-content: center; gap: 5px;"><span style="font-size: 14px;">&#9999;</span><span>Checklist</span></div></button>
                <button id="tabRecords" class="tab-btn" style="flex: 1; padding: 12px; background: ${colors.brandDark}; border: none; color: ${colors.white}; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.3s ease;"><div style="display: flex; align-items: center; justify-content: center; gap: 5px;"><span style="font-size: 14px;">&#128217;</span><span>Records</span></div></button>
            </div>
        `;

        const contentContainer = document.createElement('div');
        contentContainer.className = 'validation-content';
        contentContainer.style.cssText = `flex: 1; overflow-y: auto; padding: 14px 20px; background: ${colors.neutral1};`;

        const checklistContent = document.createElement('div');
        checklistContent.id = 'checklistContent';
        checklistContent.style.display = 'block';

        const statsBadge = document.createElement('div');
        statsBadge.id = 'statsBadge';
        statsBadge.style.cssText = `background: linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%); padding: 12px; border-radius: 10px; margin-bottom: 12px; color: ${colors.white}; box-shadow: 0 4px 12px rgba(25, 50, 93, 0.3); text-align: center;`;
        statsBadge.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; gap: 10px;"><div style="font-size: 28px;">&#127996;</div><div><div style="font-size: 11px; font-weight: 700; opacity: 0.9;">Validation Streak</div><div id="streakCount" style="font-size: 22px; font-weight: 900;">0</div></div></div>`;

        const quoteSection = document.createElement('div');
        quoteSection.id = 'quoteSection';
        quoteSection.style.cssText = `background: ${colors.white}; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${colors.brand}; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);`;
        quoteSection.innerHTML = `<div style="display: flex; gap: 10px; align-items: center;"><div id="quoteEmoji" style="font-size: 28px; flex-shrink: 0;">✎</div><div style="flex: 1;"><p id="funQuote" style="margin: 0; font-style: italic; font-size: 12px; line-height: 1.5; color: ${colors.neutral6};">"Quality is not an act, it is a habit."</p></div></div>`;

        const form = document.createElement('form');
        form.id = 'validationForm';

        form.appendChild(createCompactCard('&#128100; Employee Name', `<input type="text" id="employeeNameInput" placeholder="Your full name" required style="width: 100%; padding: 11px; border: 2px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; color: ${colors.neutral7}; font-size: 13px; font-weight: 600; box-sizing: border-box; transition: all 0.3s ease;">`, colors));
        form.appendChild(createCompactCard('&#128282; Case Number', `<input type="text" id="caseNumberInput" placeholder="e.g., 01503616" required style="width: 100%; padding: 11px; border: 2px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; color: ${colors.neutral7}; font-size: 13px; font-weight: 600; box-sizing: border-box; transition: all 0.3s ease; font-family: 'Courier New', monospace;">`, colors));
        form.appendChild(createValidationSection(colors));
        form.appendChild(createCaseTypeSection(colors));
        form.appendChild(createDetailedSection(colors));

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.id = 'submitBtn';
        submitBtn.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; gap: 8px;"><span style="font-size: 18px;" id="submitIcon">&#128680;</span><span id="submitText">Complete & Save</span><span style="font-size: 18px;">&#9900;</span></div>`;
        submitBtn.style.cssText = `width: 100%; padding: 14px; background: linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%); border: none; border-radius: 8px; color: ${colors.white}; font-size: 15px; font-weight: 900; cursor: pointer; margin-top: 14px; box-shadow: 0 5px 15px rgba(46, 132, 74, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;`;
        submitBtn.addEventListener('mouseenter', () => { submitBtn.style.transform = 'translateY(-2px)'; submitBtn.style.boxShadow = `0 7px 20px rgba(46, 132, 74, 0.6)`; });
        submitBtn.addEventListener('mouseleave', () => { submitBtn.style.transform = 'translateY(0)'; submitBtn.style.boxShadow = `0 5px 15px rgba(46, 132, 74, 0.4)`; });

        const timestampDisplay = document.createElement('div');
        timestampDisplay.id = 'timestampDisplay';
        timestampDisplay.style.cssText = `font-size: 10px; color: ${colors.neutral5}; text-align: center; margin-top: 10px; font-family: 'Courier New', monospace; padding: 8px; background: ${colors.white}; border-radius: 6px; border: 1px solid ${colors.neutral2};`;

        form.appendChild(submitBtn);
        form.appendChild(timestampDisplay);

        checklistContent.appendChild(statsBadge);
        checklistContent.appendChild(quoteSection);
        checklistContent.appendChild(form);

        const recordsContent = createCompactRecordsContent(colors);

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

    function createCompactCard(title, content, colors) {
        const card = document.createElement('div');
        card.style.cssText = `background: ${colors.white}; padding: 14px; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); border: 1px solid ${colors.neutral2};`;
        card.innerHTML = `<div style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: ${colors.brand};">${title}</div>${content}`;
        return card;
    }

    function createValidationSection(colors) {
        const section = document.createElement('div');
        section.id = 'validationSection';
        section.innerHTML = createCompactCard('&#128269; Basic Items', `<div style="background: linear-gradient(135deg, ${colors.neutral1} 0%, ${colors.white} 100%); padding: 12px; border-radius: 7px; border: 2px solid ${colors.brand};"><div style="display: grid; gap: 6px; margin-bottom: 12px;">${['&#128222; Subject Line', '&#128279; Example URL', '&#127965; Dealer ID', '&#128193; Category', '&#128275; Sub-Category'].map(item => `<div style="display: flex; align-items: center; gap: 8px; padding: 7px; background: ${colors.white}; border-radius: 5px; font-size: 12px; font-weight: 500;">${item}</div>`).join('')}</div><div style="padding-top: 10px; border-top: 2px solid ${colors.neutral2};"><div style="font-size: 12px; font-weight: 700; margin-bottom: 8px; text-align: center;">All completed?</div><div style="display: grid; grid-template-columns: 1fr; gap: 8px;">${createCompactYesNoBtn('basicValidation', 'yes', colors)}</div></div></div>`, colors).outerHTML;
        return section;
    }

    function createCaseTypeSection(colors) {
        const section = document.createElement('div');
        section.id = 'caseTypeSection';
        section.innerHTML = createCompactCard('&#128221; Case Type Verification', `<div style="background: linear-gradient(135deg, ${colors.neutral1} 0%, ${colors.white} 100%); padding: 12px; border-radius: 7px; border: 2px solid ${colors.teal};"><div style="font-size: 13px; font-weight: 700; margin-bottom: 10px; color: ${colors.neutral7};">Have you made sure that:</div><div style="display: grid; gap: 8px;">
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="enterprise" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Enterprise cases are escalated to <strong>Enterprise queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="gm" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Data Support GM cases are escalated to <strong>GM queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="general" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">General Data Support cases are escalated to <strong>General Data Support queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="design" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Design-related cases are escalated to <strong>Design queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="generalsupport" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">General Support-related cases are escalated to <strong>General Support queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="escalation" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Escalation-related cases are escalated to <strong>Escalation Queue (IT/Dev)</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="inventory" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Inventory Support-related cases are escalated to <strong>Inventory Support queue</strong></span></label>
<label style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: ${colors.white}; border-radius: 6px; border: 2px solid ${colors.neutral3}; cursor: pointer; transition: all 0.3s ease;"><input type="radio" name="caseTypeSelection" value="selfwork" class="case-type-radio" style="width: 16px; height: 16px; cursor: pointer; accent-color: ${colors.brand}; margin-top: 2px; flex-shrink: 0;"><span style="font-size: 12px; font-weight: 600; line-height: 1.4;">Self Work</span></label>
</div></div>`, colors).outerHTML;
        return section;
    }

    function createDetailedSection(colors) {
        const section = document.createElement('div');
        section.id = 'detailedSection';
        section.innerHTML = createCompactCard('&#128221; Detailed Items', `<div style="background: linear-gradient(135deg, ${colors.neutral1} 0%, ${colors.white} 100%); padding: 12px; border-radius: 7px; border: 2px solid ${colors.brand};"><div style="font-size: 11px; line-height: 1.7; color: ${colors.neutral6}; margin-bottom: 12px;">&#10003; Read request with attachments<br>&#10003; Correct website<br>&#10003; Approvals received<br>&#10003; Followed all OEM guidelines / Compliance<br>&#10003; Case reviewed<br>&#10003; Customer updated for delays<br>&#10003; Refresher Link added<br>&#10003; Screenshots added<br>&#10003; Email details added (Summary of Request/Incident)<br>&#10003; System Edit updated<br>&#10003; Case status (Confirmation/Input)</div><div style="padding-top: 10px; border-top: 2px solid ${colors.neutral2};"><div style="font-size: 12px; font-weight: 700; margin-bottom: 8px; text-align: center;">All completed?</div><div style="display: grid; grid-template-columns: 1fr; gap: 8px;">${createCompactYesNoBtn('detailedValidation', 'yes', colors)}</div></div></div>`, colors).outerHTML;
        return section;
    }

    function createCompactYesNoBtn(group, value, colors) {
        const isYes = value === 'yes';
        return `<button type="button" class="yes-no-btn" data-group="${group}" data-value="${value}" style="padding: 11px; border: 3px solid ${colors.neutral3}; border-radius: 7px; background: ${colors.white}; color: ${colors.neutral7}; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.3s ease;">${isYes ? '&#10003; YES' : '&#10005; NO'}</button>`;
    }

    function createCompactRecordsContent(colors) {
        const recordsContent = document.createElement('div');
        recordsContent.id = 'recordsContent';
        recordsContent.style.display = 'none';
        recordsContent.innerHTML = `<div style="text-align: center; padding: 16px 0; margin-bottom: 14px;"><div style="font-size: 42px;">&#128217;</div><h3 style="margin: 0; font-size: 18px; font-weight: 900; color: ${colors.brand};">History</h3><p style="margin: 5px 0 0 0; font-size: 11px; color: ${colors.neutral5};">Your quality trail</p></div><div id="recordsList"></div>`;
        return recordsContent;
    }

    function updateStats(colors) {
        const streakCount = document.getElementById('streakCount');
        if (streakCount) {
            const count = getAllRecords().length;
            streakCount.textContent = count;
        }
    }

    function toggleDrawer() {
        const drawer = document.getElementById('validationSidebar');
        if (drawer) {
            drawer.style.right = drawer.style.right === '0px' ? '-460px' : '0px';
        }
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

    function getAllRecords() {
        try {
            const recordsJSON = localStorage.getItem('validationRecords');
            return recordsJSON ? JSON.parse(recordsJSON) : [];
        } catch (e) {
            console.log('[!] Error reading records:', e);
            return [];
        }
    }

    function loadRecords(colors) {
        const recordsList = document.getElementById('recordsList');
        if (!recordsList) return;

        try {
            const records = getAllRecords();
            if (records.length === 0) {
                recordsList.innerHTML = `<div style="text-align: center; padding: 36px 16px; background: ${colors.white}; border-radius: 10px; border: 3px dashed ${colors.neutral3};"><div style="font-size: 56px; opacity: 0.5;">&#128680;</div><p style="margin: 0; font-size: 14px; font-weight: 700; color: ${colors.neutral6};">No records yet</p><p style="margin: 6px 0 0 0; font-size: 11px; color: ${colors.neutral5};">Start your quality trail!</p></div>`;
            } else {
                const sortedRecords = [...records].sort((a, b) => b.recordNumber - a.recordNumber);
                recordsList.innerHTML = sortedRecords.map((record, index) => `<div style="background: ${colors.white}; padding: 14px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${colors.brand}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); animation: slideIn 0.3s ease-out ${index * 0.04}s both;"><div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;"><div><div style="font-size: 15px; font-weight: 900; color: ${colors.brand}; margin-bottom: 3px;">#${record.recordNumber} ${index === 0 ? '&#11088;' : ''}</div><div style="font-size: 10px; color: ${colors.neutral5}; font-weight: 600;">${record.readableTime}</div></div></div><div style="font-size: 12px; margin-bottom: 6px; padding: 8px; background: ${colors.neutral1}; border-radius: 5px;"><strong style="color: ${colors.brand};">Emp:</strong> <span style="font-weight: 700; font-size: 11px;">${record.employeeName}</span></div><div style="font-size: 12px; margin-bottom: 6px; padding: 8px; background: ${colors.neutral1}; border-radius: 5px;"><strong style="color: ${colors.brand};">Case:</strong> <span style="font-family: monospace; font-weight: 700; font-size: 11px;">${record.caseNumber}</span></div><div style="font-size: 11px; color: ${colors.neutral6}; margin-bottom: 5px;"><strong>Basic:</strong> <span style="color: ${record.basicValidation === 'Yes' ? colors.success : colors.error}; font-weight: 700;">${record.basicValidation}</span></div><div style="font-size: 11px; color: ${colors.neutral6}; margin-bottom: 5px;"><strong>Case Type:</strong> <span style="color: ${colors.success}; font-weight: 700;">${record.caseTypeVerification}</span></div><div style="font-size: 11px; color: ${colors.neutral6};"><strong>Detailed:</strong> <span style="color: ${record.detailedValidation === 'Yes' ? colors.success : colors.error}; font-weight: 700;">${record.detailedValidation}</span></div></div>`).join('');
            }
        } catch (e) {
            console.log('[!] Error loading records:', e);
            recordsList.innerHTML = '<p style="color: red;">Error loading records</p>';
        }
    }

    function createConfetti(colors) {
        const confettiColors = [colors.brand, colors.success, colors.orange, colors.teal];
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-particle';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 3000);
            }, i * 40);
        }
    }

    async function syncToCloud(formData) {
        try {
            console.log('[*] Syncing to cloud...');
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: CLOUD_CONFIG.googleWebhookUrl,
                    headers: { 'Content-Type': 'application/json' },
                    data: JSON.stringify(formData),
                    onload: function(response) {
                        console.log('[+] Cloud sync successful');
                        resolve(true);
                    },
                    onerror: function(error) {
                        console.log('[!] Cloud sync error:', error);
                        resolve(false);
                    }
                });
            });
        } catch (e) {
            console.log('[!] Cloud sync error:', e.toString());
            return false;
        }
    }

    function setupEventListeners(triggerBar, drawer, colors) {
        triggerBar.addEventListener('click', toggleDrawer);
        document.getElementById('closeDrawer').addEventListener('click', toggleDrawer);
        document.getElementById('tabChecklist').addEventListener('click', () => switchTab('checklist', colors));
        document.getElementById('tabRecords').addEventListener('click', () => switchTab('records', colors));

        const employeeNameInput = document.getElementById('employeeNameInput');
        const caseNumberInput = document.getElementById('caseNumberInput');

        [employeeNameInput, caseNumberInput].forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = colors.brand;
                input.style.boxShadow = `0 0 0 3px rgba(25, 50, 93, 0.2)`;
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = colors.neutral3;
                input.style.boxShadow = 'none';
            });
        });

        const funQuotes = [
            { icon: '✎', text: 'Quality is not an act, it is a habit' },
            { icon: '⚬', text: 'Excellence is doing ordinary things extraordinarily well' },
            { icon: '▶', text: 'The devil is in the details, but so is salvation' },
            { icon: '🔑', text: 'Your work is your signature - make it count' },
            { icon: '🔥', text: 'Attention to detail is the difference between good and great' },
            { icon: '✵', text: 'Do it right the first time, every time' },
            { icon: '🏆', text: 'Quality means doing it right when no one is looking' },
            { icon: '😀', text: 'Better to do it slowly and correctly than quickly and wrong' },
            { icon: '💎', text: 'The bitterness of poor quality remains long after low price is forgotten' },
            { icon: '★', text: 'Small details make perfection, and perfection is no small detail' },
            { icon: '🔍', text: 'The more you check, the luckier you get' },
            { icon: '👈', text: 'Measure twice, cut once - validate always' },
            { icon: '🛡', text: 'Prevention is better than correction' },
            { icon: '😉', text: 'Consistency is the hallmark of excellence' },
            { icon: '♪', text: 'Perfect practice makes perfect performance' }
        ];

        let quoteIndex = 0;
        setInterval(() => {
            const quoteEmoji = document.getElementById('quoteEmoji');
            const funQuote = document.getElementById('funQuote');
            if (quoteEmoji && funQuote) {
                quoteIndex = (quoteIndex + 1) % funQuotes.length;
                const quote = funQuotes[quoteIndex];
                quoteEmoji.innerHTML = quote.icon;
                funQuote.textContent = `"${quote.text}"`;
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
                label.style.background = `linear-gradient(135deg, ${colors.white} 0%, rgba(25, 50, 93, 0.1) 100%)`;
                e.target.setAttribute('data-selected', 'true');
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
                    b.style.color = colors.neutral7;
                    b.style.transform = 'scale(1)';
                });
                if (value === 'yes') {
                    btn.style.background = `linear-gradient(135deg, ${colors.success} 0%, ${colors.successLight} 100%)`;
                    btn.style.borderColor = colors.success;
                    btn.style.color = colors.white;
                }
                btn.style.transform = 'scale(1.02)';
                btn.setAttribute('data-selected', value);
            });
        });

        function updateTimestamp() {
            const timestampDisplay = document.getElementById('timestampDisplay');
            if (timestampDisplay) {
                const now = new Date();
                const formatted = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                timestampDisplay.innerHTML = `[TIME] <strong>${formatted}</strong>`;
            }
        }
        updateTimestamp();
        setInterval(updateTimestamp, 1000);

        const form = document.getElementById('validationForm');
        const submitBtn = document.getElementById('submitBtn');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const employeeName = employeeNameInput.value.trim();
                const caseNumber = caseNumberInput.value.trim();

                if (!employeeName || !caseNumber) {
                    alert('[!] Please enter both name and case number!');
                    return;
                }

                const basicSelected = document.querySelector('.yes-no-btn[data-group="basicValidation"][data-selected]');
                const caseTypeSelected = document.querySelector('.case-type-radio:checked');
                const detailedSelected = document.querySelector('.yes-no-btn[data-group="detailedValidation"][data-selected]');

                if (!basicSelected || !caseTypeSelected || !detailedSelected) {
                    alert('Please answer all questions!');
                    return;
                }

                const timestamp = new Date().toISOString();
                const recordNumber = getAllRecords().length + 1;

                const formData = {
                    employeeName: employeeName,
                    caseNumber: caseNumber,
                    timestamp: timestamp,
                    readableTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    basicValidation: 'Yes',
                    caseTypeVerification: caseTypeSelected.value.toUpperCase(),
                    detailedValidation: 'Yes',
                    recordNumber: recordNumber,
                    validator: 'User',
                    verificationHash: 'HASH_' + Date.now()
                };

                try {
                    const records = getAllRecords();
                    records.push(formData);
                    localStorage.setItem('validationRecords', JSON.stringify(records));
                    console.log('[+] Record saved locally:', recordNumber);
                } catch (err) {
                    console.log('[!] Error saving to localStorage:', err);
                }

                await syncToCloud(formData);

                createConfetti(colors);
                alert(`[+] Record #${recordNumber} saved!\n\n[*] Cloud synced\n[*] Check Records`);

                form.reset();
                document.querySelectorAll('.yes-no-btn').forEach(btn => {
                    btn.style.background = colors.white;
                    btn.style.borderColor = colors.neutral3;
                    btn.style.color = colors.neutral7;
                    btn.style.transform = 'scale(1)';
                    btn.removeAttribute('data-selected');
                });
                document.querySelectorAll('.case-type-radio').forEach(radio => {
                    const label = radio.closest('label');
                    label.style.borderColor = colors.neutral3;
                    label.style.background = colors.white;
                });

                updateStats(colors);
                switchTab('records', colors);
                setTimeout(() => toggleDrawer(), 1000);
            });
        }
    }
})();
