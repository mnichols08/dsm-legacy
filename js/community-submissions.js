document.querySelectorAll(".community-submission-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = form.querySelector(".community-form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    status.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
        },
        body: new URLSearchParams(new FormData(form)),
      });
      const result = await response.json();
      status.textContent = result.message || result.error || "Unable to submit right now.";
      status.dataset.error = response.ok ? "false" : "true";
      if (response.ok) form.reset();
    } catch (error) {
      status.textContent = "Unable to submit right now. Please try again later.";
      status.dataset.error = "true";
    } finally {
      submitButton.disabled = false;
    }
  });
});