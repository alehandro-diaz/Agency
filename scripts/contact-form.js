(() => {
    const TARGET_EMAIL = "primeestate1995@mail.ru";
    const FORM_SUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${TARGET_EMAIL}`;

    const form = document.getElementById("contactForm");
    if (!form) {
        return;
    }

    const statusEl = form.querySelector(".contact-form__status");
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');

    const getField = (name) => form.querySelector(`[name="${name}"]`);
    const getSelectText = (select) => {
        if (!select || select.selectedIndex < 0) {
            return "";
        }
        return select.options[select.selectedIndex]?.text?.trim() || "";
    };

    const setBusy = (busy) => {
        if (submitBtn) submitBtn.disabled = busy;
        form.classList.toggle("contact-form--sending", busy);
    };

    const showStatus = (message, isError) => {
        if (!statusEl) {
            return;
        }
        statusEl.textContent = message;
        statusEl.classList.toggle("contact-form__status--error", Boolean(isError));
    };

    const escapeXml = (value) =>
        String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&apos;");

    const buildXmlPayload = ({ fio, mail, phone, purpose, purposeLabel, message }) => {
        const submittedAt = new Date().toISOString();
        return (
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<contact_request>\n` +
            `  <submitted_at>${escapeXml(submittedAt)}</submitted_at>\n` +
            `  <fio>${escapeXml(fio)}</fio>\n` +
            `  <email>${escapeXml(mail)}</email>\n` +
            `  <phone>${escapeXml(phone)}</phone>\n` +
            `  <purpose code="${escapeXml(purpose)}">${escapeXml(purposeLabel)}</purpose>\n` +
            `  <message>${escapeXml(message)}</message>\n` +
            `</contact_request>\n`
        );
    };

    const downloadXml = (xmlText) => {
        const blob = new Blob([xmlText], { type: "application/xml;charset=utf-8" });
        const link = document.createElement("a");
        const stamp = new Date().toISOString().replaceAll(":", "-");
        link.href = URL.createObjectURL(blob);
        link.download = `contact-request-${stamp}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fioEl = getField("FIO");
        const mailEl = getField("mail");
        const phoneEl = getField("phone");
        const purposeEl = getField("purpose");
        const messageEl = getField("message");

        const fio = (fioEl?.value || "").trim();
        const mail = (mailEl?.value || "").trim();
        const phone = (phoneEl?.value || "").trim();
        const purpose = (purposeEl?.value || "").trim();
        const purposeLabel = purposeEl?.tagName === "SELECT" ? getSelectText(purposeEl) : purpose;
        const message = (messageEl?.value || "").trim();

        if (!fio || !mail || !phone) {
            showStatus("Заполните ФИО, электронную почту и телефон.", true);
            return;
        }

        const payload = {
            fio,
            mail,
            phone,
            purpose,
            purposeLabel,
            message
        };
        const xmlPayload = buildXmlPayload(payload);

        setBusy(true);
        showStatus("Отправка…", false);

        try {
            const response = await fetch(FORM_SUBMIT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    name: fio,
                    email: mail,
                    _subject: "PrimeEstate: новая заявка с сайта",
                    _captcha: "false",
                    message: `Новая заявка в XML формате:\n\n${xmlPayload}`,
                    phone,
                    purpose: purposeLabel
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === "false") {
                throw new Error(result.error || "Не удалось отправить форму.");
            }

            downloadXml(xmlPayload);
            showStatus("Сообщение отправлено. XML-файл заявки скачан.", false);
            form.reset();
        } catch (err) {
            console.error(err);
            showStatus(
                err.message ||
                    "Отправка не удалась. Проверьте интернет и подтвердите адрес в FormSubmit.",
                true
            );
        } finally {
            setBusy(false);
        }
    });
})();
