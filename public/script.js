document.addEventListener('DOMContentLoaded', init);

let hints = [];
let currentScenario = '';

async function init() {
    const deviceSelect = document.getElementById('deviceSelect');
    const reasoningTextarea = document.getElementById('reasoning');
    const submitBtn = document.getElementById('submitBtn');
    const feedbackDiv = document.getElementById('feedback');
    const scenarioSelect = document.getElementById('scenarioSelect');
    const scenarioToggle = document.getElementById('scenarioToggle');
    const scenarioControls = document.getElementById('scenarioControls');
    const uploadBtn = document.getElementById('scenarioUploadBtn');
    const fileInput = document.getElementById('scenarioFile');
    const uploadStatus = document.getElementById('scenarioUploadStatus');

    scenarioToggle.addEventListener('click', () => {
        scenarioControls.classList.toggle('hidden');
    });

    let scenario = {};
    try {
        const listRes = await fetch('/api/scenarios');
        const listData = await listRes.json();
        currentScenario = listData.default;
        listData.scenarios.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (name === currentScenario) opt.selected = true;
            scenarioSelect.appendChild(opt);
        });
        scenario = await loadScenario(currentScenario);
    } catch (err) {
        console.error('Failed to load scenarios', err);
        showFeedback('Unable to load scenario.', 'error', feedbackDiv);
        return;
    }

function populateScenario(data) {
    document.getElementById('pageTitle').textContent = `🔧 ${data.title}`;

    const overviewSection = document.getElementById('overviewSection');
    overviewSection.innerHTML = '<h2>Exercise Overview</h2>' +
        data.overview.split('\n').map(p => `<p>${p}</p>`).join('');

    const deviceGrid = document.getElementById('deviceGrid');
    const select = document.getElementById('deviceSelect');
    deviceGrid.innerHTML = '';
    select.innerHTML = '<option value="">Select a device...</option>';
    data.devices.forEach(d => {
        const div = document.createElement('div');
        div.className = 'device-item';
        div.innerHTML = `<strong>${d.id} - ${d.name}</strong><p>${d.description}</p>`;
        deviceGrid.appendChild(div);

        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.id} - ${d.name}`;
        select.appendChild(opt);
    });

    const diagramEl = document.getElementById('topologyDiagram');
    diagramEl.textContent = data.topology;

    // Render the Mermaid diagram after inserting the text
    if (window.mermaid) {
        try {
            // Ensure the element is treated as unprocessed
            diagramEl.removeAttribute('data-processed');

            if (typeof mermaid.run === 'function') {
                mermaid.run({ nodes: [diagramEl] });
            } else if (typeof mermaid.init === 'function') {
                mermaid.init(undefined, [diagramEl]);
            } else if (typeof mermaid.contentLoaded === 'function') {
                mermaid.contentLoaded();
            }
        } catch (err) {
            console.error('Mermaid rendering failed:', err);
        }
    }

    const pathInfo = document.getElementById('pathInfo');
    pathInfo.innerHTML = '';
    data.paths.forEach(p => {
        const item = document.createElement('div');
        item.className = 'path-item';
        item.innerHTML = `<h4>${p.title}</h4><p>${p.description}</p>` + (p.note ? `<small>${p.note}</small>` : '');
        pathInfo.appendChild(item);
    });

    const testSection = document.getElementById('testResults');
    testSection.innerHTML = '<h2>🧪 Observed Test Results</h2>';

    Object.keys(data.test_results).forEach(key => {
        const result = data.test_results[key];

        if (key === 'ping' && Array.isArray(result.results)) {
            const ping = document.createElement('div');
            ping.className = 'test-category';

            let pingHtml = `<h3>🏓 ${result.heading}</h3><div class="ping-results">`;
            result.results.forEach(r => {
                pingHtml += `<div class="ping-item">${r} <span class="status-badge success">✅</span></div>`;
            });
            pingHtml += '</div>';
            if (result.note) {
                pingHtml += `<p class="note">${result.note}</p>`;
            }
            ping.innerHTML = pingHtml;
            testSection.appendChild(ping);
        } else if (result && result.heading && result.details) {
            const div = document.createElement('div');
            div.className = 'test-category';

            let statusClass = '';
            let icon = 'ℹ️';
            const status = (result.status || '').toLowerCase();
            if (['success', 'pass', 'working'].includes(status)) {
                icon = '✅';
                statusClass = 'success';
            } else if (['failure', 'fail'].includes(status)) {
                icon = '❌';
                statusClass = 'failure';
            } else if (status === 'info') {
                icon = 'ℹ️';
            } else {
                const lower = result.heading.toLowerCase();
                if (lower.includes('working') || lower.includes('pass')) {
                    icon = '✅';
                    statusClass = 'success';
                } else if (lower.includes('fail')) {
                    icon = '❌';
                    statusClass = 'failure';
                }
            }

            div.innerHTML = `<h3>${icon} ${result.heading}</h3><div class="test-result ${statusClass}">` +
                result.details.split('\n').map(p => `<p>${p}</p>`).join('') +
                '</div>';
            testSection.appendChild(div);
        }
    });

    hints = data.hints || [];
}

async function loadScenario(name) {
    try {
        const res = await fetch(`/api/scenario?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        populateScenario(data);
        return data;
    } catch (err) {
        console.error('Failed to load scenario', err);
    }
}

    populateScenario(scenario);

    scenarioSelect.addEventListener('change', async () => {
        currentScenario = scenarioSelect.value;
        await loadScenario(currentScenario);
        checkFormValidity();
    });

    uploadBtn.addEventListener('click', async () => {
        if (!fileInput.files.length) return;
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled = true;
        uploadStatus.classList.add('hidden');
        try {
            const uploadRes = await fetch('/api/scenario/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadRes.ok && uploadData.success) {
                scenarioSelect.innerHTML = '';
                const listRes = await fetch('/api/scenarios');
                const listData = await listRes.json();
                listData.scenarios.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    scenarioSelect.appendChild(opt);
                });
                currentScenario = uploadData.name;
                scenarioSelect.value = currentScenario;
                await loadScenario(currentScenario);
                checkFormValidity();
                fileInput.value = '';
                showFeedback(`Scenario "${uploadData.name}" uploaded!`, 'success', uploadStatus);
            } else {
                showFeedback(uploadData.error || 'Upload failed', 'error', uploadStatus);
            }
        } catch (err) {
            console.error('Upload failed', err);
            showFeedback('Upload failed', 'error', uploadStatus);
        } finally {
            uploadBtn.textContent = 'Upload';
            uploadBtn.disabled = false;
        }
    });

    // Add event listeners
    submitBtn.addEventListener('click', () => handleSubmit(deviceSelect, reasoningTextarea, submitBtn, feedbackDiv));
    
    // Enable submit button only when both fields are filled
    function checkFormValidity() {
        const isValid = deviceSelect.value && reasoningTextarea.value.trim();
        submitBtn.disabled = !isValid;
    }

    deviceSelect.addEventListener('change', checkFormValidity);
    reasoningTextarea.addEventListener('input', checkFormValidity);

    // Initial check
    checkFormValidity();

    async function handleSubmit(selectEl, textEl, buttonEl, feedback) {
        const deviceId = selectEl.value;
        const reasoning = textEl.value.trim();

        if (!deviceId || !reasoning) {
            showFeedback('Please select a device and provide your reasoning.', 'error', feedback);
            return;
        }

        // Disable submit button during request
        buttonEl.disabled = true;
        buttonEl.textContent = 'Checking...';

        try {
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deviceId: deviceId,
                    reasoning: reasoning,
                    scenarioName: currentScenario
                })
            });

            const result = await response.json();

            if (result.correct) {
                showFeedback(result.feedback, 'success', feedback);
                celebrateSuccess();
            } else {
                showFeedback(result.feedback, 'error', feedback);
            }

        } catch (error) {
            showFeedback('Error validating your answer. Please try again.', 'error', feedback);
            console.error('Validation error:', error);
        } finally {
            buttonEl.disabled = false;
            buttonEl.textContent = 'Submit Diagnosis';
            checkFormValidity(); // Re-enable if form is still valid
        }
    }

    function showFeedback(message, type, target) {
        target.textContent = message;
        target.className = `feedback ${type}`;
        target.classList.remove('hidden');

        // Scroll to feedback
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function celebrateSuccess() {
        // Add some visual celebration
        document.body.style.animation = 'celebration 0.5s ease-in-out';
        
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Add confetti effect (simple version)
        createConfetti();
    }

    function createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${Math.random() * 2 + 2}s linear forwards`;
            confettiContainer.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 4000);
    }

    // Add CSS for confetti animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
        
        @keyframes celebration {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
    `;
    document.head.appendChild(style);

    // Add helpful hints functionality

    let hintIndex = 0;
    
    // Add hint button
    const hintBtn = document.createElement('button');
    hintBtn.textContent = '💡 Need a hint?';
    hintBtn.className = 'hint-btn submit-btn';
    
    hintBtn.addEventListener('click', function() {
        if (hintIndex < hints.length) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'feedback';
            hintDiv.style.background = 'rgba(255,255,255,0.2)';
            hintDiv.style.color = 'white';
            hintDiv.style.border = '1px solid rgba(255,255,255,0.3)';
            hintDiv.textContent = `Hint ${hintIndex + 1}: ${hints[hintIndex]}`;
            
            // Remove previous hints
            const existingHints = document.querySelectorAll('.hint-message');
            existingHints.forEach(hint => hint.remove());
            
            hintDiv.classList.add('hint-message');
            feedbackDiv.parentNode.insertBefore(hintDiv, feedbackDiv);
            
            hintIndex++;
            
            if (hintIndex >= hints.length) {
                hintBtn.textContent = '🎯 No more hints!';
                hintBtn.disabled = true;
            }
            
            hintDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
    
    submitBtn.parentNode.appendChild(hintBtn);
}
