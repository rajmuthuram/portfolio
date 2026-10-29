(function () {
  "use strict";

  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  var sections = document.querySelectorAll("section[id], header[id]");
  var reveals = document.querySelectorAll(".reveal");
  var timeline = document.querySelector(".timeline");
  var form = document.getElementById("contact-form");
  var formNote = document.getElementById("form-note");
  var submitBtn = document.getElementById("contact-submit");
  var glow = document.querySelector(".cursor-glow");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setFormNote(message, type) {
    if (!formNote) return;
    formNote.textContent = message || "";
    formNote.classList.remove("is-success", "is-error");
    if (type) formNote.classList.add(type);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);

    var current = "";
    sections.forEach(function (section) {
      var top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.id;
      }
    });

    navAnchors.forEach(function (anchor) {
      var href = anchor.getAttribute("href") || "";
      anchor.classList.toggle("is-active", href === "#" + current);
    });
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navAnchors.forEach(function (anchor) {
      anchor.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });

    if (timeline) {
      var lineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              timeline.classList.add("is-drawn");
              lineObserver.unobserve(timeline);
            }
          });
        },
        { threshold: 0.25 }
      );
      lineObserver.observe(timeline);
    }
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    if (timeline) timeline.classList.add("is-drawn");
  }

  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var glowX = 0;
    var glowY = 0;
    var targetX = 0;
    var targetY = 0;
    var ticking = false;

    document.addEventListener(
      "pointermove",
      function (event) {
        targetX = event.clientX;
        targetY = event.clientY;
        document.body.classList.add("is-pointer");
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(function updateGlow() {
            glowX += (targetX - glowX) * 0.16;
            glowY += (targetY - glowY) * 0.16;
            glow.style.transform = "translate3d(" + glowX + "px," + glowY + "px,0)";
            if (Math.abs(targetX - glowX) > 0.4 || Math.abs(targetY - glowY) > 0.4) {
              requestAnimationFrame(updateGlow);
            } else {
              ticking = false;
            }
          });
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerleave",
      function () {
        document.body.classList.remove("is-pointer");
      },
      { passive: true }
    );
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameInput = form.elements.namedItem("name");
      var emailInput = form.elements.namedItem("email");
      var subjectInput = form.elements.namedItem("subject");
      var messageInput = form.elements.namedItem("message");

      var name = String((nameInput && nameInput.value) || "").trim();
      var email = String((emailInput && emailInput.value) || "").trim();
      var subject = String((subjectInput && subjectInput.value) || "").trim() || "Portfolio inquiry";
      var message = String((messageInput && messageInput.value) || "").trim();

      [nameInput, emailInput, messageInput].forEach(function (el) {
        if (el && el.classList) el.classList.remove("is-invalid");
      });

      if (!name || !email || !message || !isValidEmail(email)) {
        if (!name && nameInput) nameInput.classList.add("is-invalid");
        if ((!email || !isValidEmail(email)) && emailInput) emailInput.classList.add("is-invalid");
        if (!message && messageInput) messageInput.classList.add("is-invalid");
        setFormNote("Please fill in name, a valid email, and message.", "is-error");
        return;
      }

      form.classList.add("is-sending");
      if (submitBtn) submitBtn.textContent = "Sending…";
      setFormNote("Sending your message…", "");

      fetch("https://formsubmit.co/ajax/rajmuthuram@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
          _subject: "New message from portfolio — " + subject,
          _template: "table",
          _captcha: "false"
        })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, status: response.status, data: data };
          }).catch(function () {
            return { ok: response.ok, status: response.status, data: null };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            var serverMsg = result.data && (result.data.message || result.data.error);
            throw new Error(serverMsg || "Send failed");
          }
          form.reset();
          setFormNote("Thanks! Your message was sent successfully.", "is-success");
        })
        .catch(function (err) {
          var msg = (err && err.message) || "";
          if (/activate|confirm|verify/i.test(msg)) {
            setFormNote("Please check rajmuthuram@gmail.com and confirm FormSubmit once, then try again.", "is-error");
          } else {
            setFormNote("Could not send right now. Please try again in a moment.", "is-error");
          }
        })
        .finally(function () {
          form.classList.remove("is-sending");
          if (submitBtn) submitBtn.textContent = "Send Message";
        });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();

