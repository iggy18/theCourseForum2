import { validateForm } from "../common/form.js";
import { postToDiscord, sendEmail } from "../common/send_feedback.js";

function submit(event) {
    var form = document.getElementById("bugform");
    var valid = validateForm(form);
    if (valid === true) {
        var url = window.location.href;
        var email = $("#emailField").val();
        var description = $("#descriptionField").val();
        var categories = "";
        for (var i = 1; i <= 4; i++) {
            var id = "#category" + i;
            if ($(id).is(":checked")) {
                categories += "[" + $(id).val() + "]";
            }
        }

        var content = `
        Bug Found!
        **URL:** ${url}
        **Categories:** ${categories}
        **Email:** ${email}
        **Description:** ${description}
        `;
        postToDiscord("bug", content);

        content = `
        Bug Report
        URL: ${url}
        Categories: ${categories}
        Email: ${email}
        Description: ${description}
        `;
        sendEmail("Bug Report", content, "support@thecourseforum.com");

        content = `
        Thanks for reaching out! We received the following bug report from you:
        Description: ${description}
        Categories: ${categories}

        We apologize for any inconveniences that this may have caused.
        Our team will be investigating the issue and will follow up with you shortly.

        Best,
        theCourseForum Team
        `;
        sendEmail("[theCourseForum] Thank you for your feedback!", content, email);

        resetForm();
    }
}

function resetForm() {
    var form = document.getElementById("bugform");
    form.classList.remove("was-validated");

    $("#descriptionField").val("");
    for (var i = 1; i <= 4; i++) {
        var id = "#category" + i;
        $(id).prop("checked", false);
    }
}

const form = document.getElementById("bugform");
form.onsubmit = submit;

// Show confirmation modal on form submit
$("#bugform").submit(function(e) {
    $("#bugModal").modal("hide");
    $("#confirmationModal").modal("show");
    return false;
});
