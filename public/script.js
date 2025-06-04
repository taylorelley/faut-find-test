document.addEventListener('DOMContentLoaded', function() {
    const deviceSelect = document.getElementById('deviceSelect');
    const reasoningTextarea = document.getElementById('reasoning');
    const submitBtn = document.getElementById('submitBtn');
    const feedbackDiv = document.getElementById('feedback');

    // Add event listeners
    submitBtn.addEventListener('click', handleSubmit);
    
    // Enable submit button only when both fields are filled
    function checkFormValidity() {
        const isValid = deviceSelect.value && reasoningTextarea.value.trim();
        submitBtn.disabled = !isValid;
    }

    deviceSelect.addEventListener('change', checkFormValidity);
    reasoningTextarea.addEventListener('input', checkFormValidity);

    // Initial check
    checkFormValidity();

    async function handleSubmit() {
        const deviceId = deviceSelect.value;
        const reasoning = reasoningTextarea.value.trim();

        if (!deviceId || !reasoning) {
            showFeedback('Please select a device and provide your reasoning.', 'error');
            return;
        }

        // Disable submit button during request
        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking...';

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
                showFeedback(result.feedback, 'success');
                celebrateSuccess();
            } else {
                showFeedback(result.feedback, 'error');
            }

        } catch (error) {
            showFeedback('Error validating your answer. Please try again.', 'error');
            console.error('Validation error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Diagnosis';
            checkFormValidity(); // Re-enable if form is still valid
        }
    }

    function showFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = `feedback ${type}`;
        feedbackDiv.classList.remove('hidden');
        
        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    const hints = [
        "Notice that both dynamic and static traffic share the same upstream path through AS→BH→GC→ZS...",
        "All ping tests succeed, so it's not a connectivity issue anywhere in the network...",
        "Dynamic requests work end-to-end through the entire shared path and processing cluster...",
        "Static requests fail after ZetaSplit, but ZS→TF1 and TF1→TF2 both respond to ping...",
        "The failure happens somewhere in the static security gateway chain, but which stage?"
    ];

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
});
