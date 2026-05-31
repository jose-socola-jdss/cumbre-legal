import { gsap } from "gsap";

// Mobile Navigation & FAQ Toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-button");
  const navMenu = document.getElementById("nav-menu");
  const header = document.querySelector(".site-header");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      header.classList.toggle("menu-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // FAQ Accordion Trigger
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");
    const content = item.querySelector(".faq-content");
    const icon = item.querySelector(".faq-icon");

    if (trigger && content) {
      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";

        faqItems.forEach((otherItem) => {
          const otherTrigger = otherItem.querySelector(".faq-trigger");
          const otherContent = otherItem.querySelector(".faq-content");
          const otherIcon = otherItem.querySelector(".faq-icon");
          if (otherTrigger !== trigger && otherTrigger) {
            otherTrigger.setAttribute("aria-expanded", "false");
            if (otherContent) otherContent.hidden = true;
            if (otherIcon) otherIcon.textContent = "+";
          }
        });

        trigger.setAttribute("aria-expanded", String(!isOpen));
        content.hidden = isOpen;
        if (icon) icon.textContent = isOpen ? "+" : "−";
      });
    }
  });

  // Footer Year
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // Entrance Animations
  gsap.from(".hero-title, .badge, .hero-lead, .hero-actions", {
    y: 35,
    opacity: 0,
    duration: 1.3,
    stagger: 0.16,
    ease: "power3.out",
  });

  gsap.from(".hero-visual", {
    x: 40,
    opacity: 0,
    duration: 1.4,
    ease: "power2.out",
    delay: 0.2
  });

  // Risk Ledger Vertical Scroll Loop (Seamless cloning ticker)
  const ticker = document.getElementById("ledger-ticker-list");
  if (ticker && ticker.children.length > 1) {
    // Clone first item to append to the end for seamless looping
    const firstClone = ticker.children[0].cloneNode(true);
    ticker.appendChild(firstClone);
    
    const items = ticker.children;
    let currentIndex = 0;
    
    const runTicker = () => {
      currentIndex++;
      const targetY = -(ticker.children[currentIndex].offsetTop - ticker.children[0].offsetTop);
      
      gsap.to(ticker, {
        y: targetY,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          // Reset to 0 when reaching the cloned copy
          if (currentIndex >= items.length - 1) {
            currentIndex = 0;
            gsap.set(ticker, { y: 0 });
          }
        }
      });
    };
    
    setInterval(runTicker, 4200);
  }
});

// Custom Web Component for Cumbre Legal Autodiagnóstico
class CumbreQuiz extends HTMLElement {
  constructor() {
    super();
    this.currentStep = 0;
    this.answers = {};
    
    this.questions = [
      {
        id: "stage",
        question: "1. ¿En qué estado de maduración comercial se encuentra tu negocio?",
        options: [
          { text: "Lanzamiento preliminar (conseguir primeros clientes)", value: "start" },
          { text: "Operativo estable (facturación recurrente activa)", value: "active" },
          { text: "Expansión activa (levantamiento de capital o contratación masiva)", value: "growth" }
        ]
      },
      {
        id: "pain",
        question: "2. ¿Cuál representa el mayor foco de incertidumbre legal actual?",
        options: [
          { text: "Ausencia de contratos de servicios con proveedores o clientes", value: "contracts" },
          { text: "Divergencias o vacíos en el acuerdo de fundadores/socios", value: "partners" },
          { text: "Protección de propiedad intelectual de software o marca comercial", value: "intellectual" }
        ]
      },
      {
        id: "sector",
        question: "3. ¿En qué canal o mercado opera principalmente tu empresa?",
        options: [
          { text: "Tecnología (SaaS, Apps móviles, plataformas digitales)", value: "tech" },
          { text: "Servicios B2B (consultoría, agencias especializadas)", value: "services" },
          { text: "Comercio tradicional (retail, distribución física)", value: "retail" }
        ]
      }
    ];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (this.currentStep < this.questions.length) {
      this.renderQuestion();
    } else {
      this.renderResults();
    }
  }

  renderQuestion() {
    const q = this.questions[this.currentStep];
    const progress = ((this.currentStep + 1) / this.questions.length) * 100;

    this.innerHTML = `
      <div class="quiz-step-panel">
        <h4>${q.question}</h4>
        <div class="quiz-options">
          ${q.options.map((opt) => `
            <button type="button" class="quiz-opt-btn" data-value="${opt.value}">${opt.text}</button>
          `).join("")}
        </div>
        <div class="quiz-progress-bar" aria-hidden="true">
          <div class="quiz-progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
    `;

    this.querySelectorAll(".quiz-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.answers[q.id] = btn.dataset.value;
        this.currentStep++;
        this.render();
      });
    });
  }

  renderResults() {
    const { stage, pain, sector } = this.answers;
    
    // Risk score calculations (max risk 160)
    let score = 0;
    
    if (stage === "start") score += 15;
    else if (stage === "active") score += 45;
    else if (stage === "growth") score += 75;

    if (pain === "contracts") score += 25;
    else if (pain === "intellectual") score += 35;
    else if (pain === "partners") score += 50;

    if (sector === "retail") score += 15;
    else if (sector === "services") score += 20;
    else if (sector === "tech") score += 35;

    const riskPct = Math.min(100, Math.round((score / 160) * 100));
    
    let priority1 = "";
    let priority1Desc = "";
    let priority2 = "";
    let priority2Desc = "";
    let riskLevel = "MEDIO";

    if (riskPct >= 65) {
      riskLevel = "CRÍTICO";
      priority1 = "Redacción de Pacto de Socios y Vesting";
      priority1Desc = "Formalización obligatoria de porcentajes, mecanismos de salida, recompra de participaciones y reglas de decisión para resolver bloqueos corporativos.";
      priority2 = "Homologación de Propiedad Intelectual en Contratos";
      priority2Desc = "Traspaso de derechos de software, propiedad industrial e inventos de fundadores y freelance a la persona jurídica titular.";
    } else if (riskPct >= 35) {
      riskLevel = "MODERADO";
      priority1 = "Contrato de Prestación de Servicios (B2B)";
      priority1Desc = "Establecimiento de plazos firmes de entrega, hitos de pago comercial y cláusulas estrictas de limitación de responsabilidad civil.";
      priority2 = "Términos y Condiciones + Registro Marcario";
      priority2Desc = "Protección legal de tu portal o SaaS y registro preventivo de la marca principal para asegurar exclusividad marcaria.";
    } else {
      riskLevel = "BAJO";
      priority1 = "Acuerdo de Confidencialidad (NDA) Multilateral";
      priority1Desc = "Resguardo de propiedad intelectual e información confidencial en negociaciones preliminares con aliados comerciales.";
      priority2 = "Auditoría Contractual de Plantillas";
      priority2Desc = "Adecuación de minutas estándar recopiladas en internet para adecuarlas a la legislación mercantil vigente.";
    }

    this.innerHTML = `
      <div class="quiz-results-panel">
        <h4>Resultados de Exposición Judicial</h4>
        
        <div class="results-split">
          <div class="results-txt">
            <div class="road-item">
              <strong>1. Acción Inmediata: ${priority1}</strong>
              <p>${priority1Desc}</p>
            </div>
            <div class="road-item">
              <strong>2. Siguiente Acción: ${priority2}</strong>
              <p>${priority2Desc}</p>
            </div>
          </div>
          
          <div class="gauge-visual">
            <svg class="speedometer-svg" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
              <!-- Semi-circle Track -->
              <path class="speedo-bg" d="M30 100 A70 70 0 0 1 170 100" />
              <!-- Highlight fill -->
              <path id="speedo-fill" class="speedo-fill" d="M30 100 A70 70 0 0 1 170 100" />
              
              <!-- Needle Pointer -->
              <polygon id="speedo-pointer" class="speedo-pointer" points="98,100 102,100 100,25" fill="#f8fafc" />
              <circle cx="100" cy="100" r="6" fill="#d4af37" />
            </svg>
            <div class="gauge-txt">
              Nivel de Exposición: <strong>${riskLevel} (${riskPct}%)</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
          <a class="btn btn-primary" href="mailto:hola@cumbrelegal.test?subject=Autodiagnostico%20Riesgo%20${riskLevel}&body=Hola%20equipo,%20he%20completado%20el%20diagnóstico%20con%20resultado%20${riskLevel}%20(${riskPct}%).%20Quiero%20evaluar%20mi%20caso.">Solicitar Auditoría Legal</a>
          <button type="button" class="btn btn-secondary" id="reset-quiz-btn">Reiniciar Test</button>
        </div>
      </div>
    `;

    // Reset Quiz
    this.querySelector("#reset-quiz-btn").addEventListener("click", () => {
      this.currentStep = 0;
      this.answers = {};
      this.render();
    });

    // Speedometer Pointer Animate (GSAP)
    const pointer = this.querySelector("#speedo-pointer");
    const fill = this.querySelector("#speedo-fill");
    
    if (pointer && fill) {
      // Rotation angle from -90deg (0% risk) to +90deg (100% risk)
      const rotationAngle = -90 + (180 * riskPct) / 100;
      
      gsap.to(pointer, {
        rotation: rotationAngle,
        transformOrigin: "100px 100px",
        duration: 1.6,
        ease: "back.out(1.2)"
      });

      // Arc length is ~220px. Offset 220 = 0% fill, Offset 0 = 100% fill.
      const targetOffset = 220 - (220 * riskPct) / 100;
      gsap.to(fill, {
        strokeDashoffset: targetOffset,
        duration: 1.6,
        ease: "power2.out"
      });
    }
  }
}

customElements.define("cumbre-quiz", CumbreQuiz);
