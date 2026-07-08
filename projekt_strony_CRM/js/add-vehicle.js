document.getElementById("addVehicleForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let valid = true;

  const fields = [
    { id: "brand", label: "Marka" },
    { id: "model", label: "Model" },
    { id: "insuranceName", label: "Nazwa ubezpieczyciela" },
    { id: "productionDate", label: "Data produkcji", type: "date" },
    { id: "insuranceDate", label: "Ubezpieczenie do", type: "date" },
    { id: "vin", label: "Numer VIN", pattern: /^[A-HJ-NPR-Z0-9]{17}$/, errorText: "VIN musi mieć 17 znaków (bez I, O, Q)." },
    { id: "regNumber", label: "Numer rejestracyjny" } // tylko wymagalność
  ];

  fields.forEach(field => {
    const el = document.getElementById(field.id);
    const value = el.value.trim();
    const prevError = el.previousElementSibling;

    if (prevError && prevError.classList.contains("form-error")) {
      prevError.remove();
    }
    el.classList.remove("border-error");

    let showError = false;

    if (!value) {
      showError = true;
    } else if (field.pattern && !field.pattern.test(value)) {
      showError = true;
    } else if (field.type === "date" && isNaN(new Date(value).getTime())) {
      showError = true;
    }

    if (showError) {
      const error = document.createElement("div");
      error.className = "form-error text-sm text-[#e0597f] mb-1";
      error.textContent = field.errorText || `Pole "${field.label}" jest wymagane.`;
      el.parentNode.insertBefore(error, el);
      el.classList.add("border-error");
      valid = false;
    }
  });

  if (valid) {
    alert("Pojazd został poprawnie dodany!");
    document.getElementById("addVehicleForm").reset();

    fields.forEach(field => {
      const el = document.getElementById(field.id);
      el.classList.remove("border-error");
      const prevError = el.previousElementSibling;
      if (prevError && prevError.classList.contains("form-error")) {
        prevError.remove();
      }
    });
  }
});
