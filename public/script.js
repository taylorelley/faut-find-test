document.addEventListener('DOMContentLoaded', init);

let hints = [];

async function init() {
    const deviceSelect = document.getElementById('deviceSelect');
    const reasoningTextarea = document.getElementById('reasoning');
    const submitBtn = document.getElementById('submitBtn');
    const feedbackDiv = document.getElementById('feedback');

    // Load scenario configuration
    let scenario = {};
    try {
        const res = await fetch('/api/scenario');
        scenario = await res.json();
    } catch (err) {
        console.error('Failed to load scenario configuration', err);
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
    data.paths.forEach(p => {
        const item = document.createElement('div');
        item.className = 'path-item';
        item.innerHTML = `<h4>${p.title}</h4><p>${p.description}</p>` + (p.note ? `<small>${p.note}</small>` : '');
        pathInfo.appendChild(item);
    });

    const testSection = document.getElementById('testResults');
    testSection.innerHTML = '<h2>🧪 Observed Test Results</h2>';

    const dyn = document.createElement('div');
    dyn.className = 'test-category';
    dyn.innerHTML = `<h3>✅ ${data.test_results.dynamic.heading}</h3><div class="test-result success">` +
        data.test_results.dynamic.details.split('\n').map(p => `<p>${p}</p>`).join('') +
        '</div>';
    testSection.appendChild(dyn);

    const sta = document.createElement('div');
    sta.className = 'test-category';
    sta.innerHTML = `<h3>❌ ${data.test_results.static.heading}</h3><div class="test-result failure">` +
        data.test_results.static.details.split('\n').map(p => `<p>${p}</p>`).join('') +
        '</div>';
    testSection.appendChild(sta);

    const ping = document.createElement('div');
    ping.className = 'test-category';
    let pingHtml = `<h3>🏓 ${data.test_results.ping.heading}</h3><div class="ping-results">`;
    data.test_results.ping.results.forEach(r => {
        pingHtml += `<div class="ping-item">${r} <span class="status-badge success">✅</span></div>`;
    });
    pingHtml += '</div>';
    pingHtml += `<p class="note">${data.test_results.ping.note}</p>`;
    ping.innerHTML = pingHtml;
    testSection.appendChild(ping);

    hints = data.hints || [];
}

    populateScenario(scenario);

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
                    reasoning: reasoning
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
