document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complaintForm');
    const photoInput = document.getElementById('photo');
    const fileNameDisplay = document.getElementById('file-name');
    const toast = document.getElementById('toast');

    // Display selected file name
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            fileNameDisplay.style.color = '#333';
        } else {
            fileNameDisplay.textContent = 'No file chosen';
            fileNameDisplay.style.color = '#666';
        }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
            // UI Feedback
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';

            const formData = new FormData(form);
            
            // Backend endpoint (we'll set this up next)
            const response = await fetch('https://complaints-form-bh26.onrender.com/api/complaints', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast('Success! Your issue has been reported.', 'success');
                form.reset();
                fileNameDisplay.textContent = 'No file chosen';
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast(error.message || 'Error submitting form. Is the server running?', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    function showToast(message, type) {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, 3000);
    }
});
