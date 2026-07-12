
        window.addEventListener('DOMContentLoaded', () => {
            if (!sessionStorage.getItem('guidedWelcomeShown') || sessionStorage.getItem('resumeGuidedWelcome')) {
                sessionStorage.removeItem('resumeGuidedWelcome');
                setTimeout(checkGuidedApproval, 500);
            }
        });
    