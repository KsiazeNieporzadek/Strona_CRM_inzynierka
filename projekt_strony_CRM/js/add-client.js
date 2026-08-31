document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addClientForm");

  // FEP06: ostrzeżenie przed opuszczeniem formularza z niezapisanymi zmianami.
  let formIsDirty = false;
  let formSubmittedSuccessfully = false;

  form.addEventListener("input", () => {
    formIsDirty = true;
  });

  window.addEventListener("beforeunload", (e) => {
    if (formIsDirty && !formSubmittedSuccessfully) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Zatrzymanie domyślnego wysyłania formularza

    let isValid = true;

    // Funkcja pomocnicza do pokazywania/ukrywania błędów
    const checkField = (id, condition) => {
      const errorElem = document.getElementById(`error-${id}`);
      const inputElem = document.getElementById(id);
      
      if (!condition) {
        errorElem.classList.remove("hidden");
        inputElem.classList.add("border-red-500");
        isValid = false;
      } else {
        errorElem.classList.add("hidden");
        inputElem.classList.remove("border-red-500");
      }
    };

    // Pobranie wartości z inputów
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const status = document.getElementById("status").value;
    const pesel = document.getElementById("pesel").value.trim();
    const nip = document.getElementById("nip").value.trim();
    const email = document.getElementById("email").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();

    // WALIDACJA (Prawdziwe komunikaty błędu)
    // 1. Imię i Nazwisko nie mogą być puste
    checkField("firstName", firstName.length > 0);
    checkField("lastName", lastName.length > 0);
    
    // 2. Status musi być wybrany
    checkField("status", status !== "");

    // 3. PESEL musi mieć dokładnie 11 cyfr (tylko cyfry)
    const peselRegex = /^[0-9]{11}$/;
    checkField("pesel", peselRegex.test(pesel));

    // 4. Email musi mieć format x@y.z
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    checkField("email", emailRegex.test(email));

    // 5. NIP jest opcjonalny, ale jeśli jest wpisany, musi mieć 10 cyfr
    if (nip.length > 0) {
      const nipRegex = /^[0-9]{10}$/;
      checkField("nip", nipRegex.test(nip));
    } else {
      // Jeśli puste, ukrywamy błąd (bo NIP nie ma gwiazdki, nie jest wymagany)
      document.getElementById("error-nip").classList.add("hidden");
      document.getElementById("nip").classList.remove("border-red-500");
    }

    // 6. Kod pocztowy jest opcjonalny, ale jeśli jest wpisany, musi mieć format XX-XXX
    if (postalCode.length > 0) {
      const postalCodeRegex = /^[0-9]{2}-[0-9]{3}$/;
      checkField("postalCode", postalCodeRegex.test(postalCode));
    } else {
      // Jeśli puste, ukrywamy błąd (pole nie jest wymagane)
      document.getElementById("error-postalCode").classList.add("hidden");
      document.getElementById("postalCode").classList.remove("border-red-500");
    }

    // Jeśli wszystko jest poprawne - symulujemy zapis
    if (isValid) {
      const successMessage = document.getElementById("successMessage");
      successMessage.classList.remove("hidden");

      // Formularz zapisany (symulacja) - nie ostrzegaj już przed przekierowaniem.
      formSubmittedSuccessfully = true;

      // Ukrycie przycisków, by zapobiec podwójnemu kliknięciu
      form.querySelector("button[type='submit']").disabled = true;

      // Symulacja zapisania do API/JSON i powrót do tabeli po 2 sekundach
      setTimeout(() => {
        window.location.href = "clients.html";
      }, 2000);
    }
  });
});
