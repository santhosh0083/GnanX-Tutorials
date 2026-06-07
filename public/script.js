function connectForm(formId, endpoint, statusId, successMessage) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);

  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Submitting...";

    const formData = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Request failed");
      }

      status.textContent = successMessage;
      form.reset();
    } catch (error) {
      status.textContent = error.message || "Please try again or contact us on WhatsApp.";
    }
  });
}

connectForm(
  "studentForm",
  "/student",
  "studentStatus",
  "Student enquiry submitted. We will contact you shortly."
);

connectForm(
  "tutorForm",
  "/tutor",
  "tutorStatus",
  "Tutor application submitted. Our team will review it soon."
);
