class ThemeManager {
    static init() {
      this.theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
      this.injectNavbar();
      this.handleAuthState();
      this.handleAlerts();
    }
  
    static injectNavbar() {
      const navbar = document.createElement('nav');
      navbar.className = 'navbar';
      navbar.innerHTML = `
        <a href="/" class="nav-link">CodeThru</a>
        <div class="nav-links">
          ${this.isLoggedIn() ? `
            <span class="nav-link">${this.getUsername()}</span>
            <a href="#" class="nav-link" id="logout">Logout</a>
          ` : `
            <a href="/login" class="nav-link">Login</a>
            <a href="/register" class="nav-link">Register</a>
          `}
          <button class="theme-toggle" onclick="ThemeManager.toggleTheme()">
            ${this.theme === 'dark' ? '🌞' : '🌙'}
          </button>
        </div>
      `;
      document.body.prepend(navbar);
    }
  
    static toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
      document.querySelector('.theme-toggle').textContent = this.theme === 'dark' ? '🌞' : '🌙';
    }
  
    static handleAuthState() {
      document.getElementById('logout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await fetch('/logOut', { method: 'PUT' });
          localStorage.removeItem('token');
          window.location.href = '/';
        } catch (error) {
          console.error('Logout failed:', error);
        }
      });
    }
  
    static handleAlerts() {
      const params = new URLSearchParams(window.location.search);
      const alert = params.get('alert');
      if (alert) this.showAlert(alert);
    }
  
    static showAlert(message) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'verdict';
      alertDiv.textContent = message;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 3000);
    }
  
    static isLoggedIn() {
      return localStorage.getItem('token') !== null;
    }
  
    static getUsername() {
      return localStorage.getItem('username') || 'User';
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());

  // Add this after ThemeManager class
class ProblemSubmitter {
    static init() {
      document.querySelectorAll('.code-submission form').forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const problemId = form.dataset.problem;
          const verdictEl = document.getElementById('verdict');
          
          verdictEl.textContent = 'Judging...';
          verdictEl.className = 'verdict';
  
          try {
            const response = await fetch(`/prob${problemId}Submit`, {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            verdictEl.textContent = result.verdict;
            verdictEl.classList.add(result.verdict === 'AC' ? 'ac' : 'wa');
            
            if (result.verdict === 'AC') {
              this.updateProblemStatus(problemId);
            }
          } catch (error) {
            verdictEl.textContent = 'Error';
            console.error('Submission failed:', error);
          }
        });
      });
    }
  
    static updateProblemStatus(problemId) {
      // Implement logic to update UI for solved problems
      const card = document.querySelector(`.problem-card[data-problem="${problemId}"]`);
      if (card) card.classList.add('solved');
    }
  }
  
  // Add to DOMContentLoaded event
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ProblemSubmitter.init();
  });