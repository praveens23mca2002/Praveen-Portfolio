document.addEventListener("DOMContentLoaded", () => {
    
    // --- Mobile Responsive Navigation Menu Logic ---
    const mobileMenu = document.getElementById("mobile-menu");
    const navLinksContainer = document.querySelector(".nav-links");
    const navLinks = document.querySelectorAll(".nav-links a");

    // Toggle menu on mobile hamburger click
    if (mobileMenu) {
        mobileMenu.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
            navLinksContainer.classList.toggle("active");
        });
    }

    // Close menu upon item selection
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu?.classList.remove("active");
            navLinksContainer.classList.remove("active");
        });
    });

    // --- Light/Dark Color Mode Toggle Logic ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const icon = themeToggleBtn.querySelector("i");
    
    // Read cached preferences from local storage if existing
    const cachedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", cachedTheme);
    updateThemeIcons(cachedTheme);

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const targetTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", targetTheme);
        localStorage.setItem("theme", targetTheme);
        updateThemeIcons(targetTheme);
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", toggleTheme);
    }

    function updateThemeIcons(theme) {
        if (icon) {
            icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        }
    }

    // --- Active Link Highlight & Intersection Fade-In Effects ---
    const sections = document.querySelectorAll(".section");
    
    const observerOptions = {
        root: null,
        threshold: 0.15, 
        rootMargin: "-10% 0px -20% 0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal element
                entry.target.classList.add("show");
                
                // Track current active state mapping in Navigation menu Bar
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Hide Navbar On Scroll ---
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            navbar.classList.add('hidden-nav');
            // Close the menu when scrolling
            mobileMenu?.classList.remove('active');
            navLinksContainer?.classList.remove('active');
        } else {
            navbar.classList.remove('hidden-nav');
        }
        lastScrollY = currentScrollY;
    });

    // --- Custom Toast Notification Handler ---
    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="toast-content">${message}</div>
        `;

        container.appendChild(toast);

        // Force a reflow to trigger CSS transition
        toast.offsetHeight;

        // Show the toast
        toast.classList.add('show');

        // Disappear in 5 seconds (5000ms)
        setTimeout(() => {
            toast.classList.replace('show', 'hide');
            // Remove from DOM after transition completes (400ms)
            setTimeout(() => {
                toast.remove();
                // Remove container if empty
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 400);
        }, 5000);
    }

    // --- Smooth Contact Form Interactivity Handling ---
    const contactForm = document.getElementById("form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

            const formData = new FormData(contactForm);
            
            fetch("https://formspree.io/f/xkoaydan", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    contactForm.reset();
                    showToast("Thanks for reaching out! Your message has been sent successfully.", "success");
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            showToast(data["errors"].map(error => error["message"]).join(", "), "error");
                        } else {
                            showToast("Oops! There was a problem submitting your form.", "error");
                        }
                    });
                }
            })
            .catch(error => {
                showToast("Oops! There was a problem submitting your form. Please check your internet connection.", "error");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }
});