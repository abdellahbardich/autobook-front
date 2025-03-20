import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero">
        <div class="hero-content">
          <h1>Create AI-Generated Books in Minutes</h1>
          <p>Transform your ideas into professionally formatted PDFs with text and images generated by AI</p>
          <div class="hero-buttons">
            <a routerLink="/auth/register" class="btn-primary">Get Started</a>
            <a routerLink="/auth/login" class="btn-secondary">Login</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="assets/images/hero-image.png" alt="AI Book Generator" />
        </div>
      </section>
      
      <section class="features">
        <h2>Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Text-Only Books</h3>
            <p>Generate complete books with AI-written content, perfect for novels, guides, and documentation.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🖼️</div>
            <h3>Books with Images</h3>
            <p>Create illustrated books with AI-generated images that match your text content.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Interactive Conversations</h3>
            <p>Chat with our AI to refine your book content and make specific adjustments.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Real-Time Progress</h3>
            <p>Watch your book being created in real-time with detailed progress tracking.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📂</div>
            <h3>Organize Collections</h3>
            <p>Group your books into collections for better organization and management.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3>PDF Export</h3>
            <p>Download your completed books as professionally formatted PDF documents.</p>
          </div>
        </div>
      </section>
      
      <section class="how-it-works">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Create a Book</h3>
            <p>Choose between text-only or illustrated books and provide a title and description.</p>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <h3>Describe Your Content</h3>
            <p>Tell our AI what you want in your book using natural language prompts.</p>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <h3>Review and Refine</h3>
            <p>Chat with our AI to make adjustments and perfect your content.</p>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <h3>Download Your Book</h3>
            <p>Get your completed book as a professionally formatted PDF document.</p>
          </div>
        </div>
      </section>
      
      <section class="cta">
        <div class="cta-content">
          <h2>Ready to Create Your First AI Book?</h2>
          <p>Join thousands of users who are already creating amazing content with our platform.</p>
          <a routerLink="/auth/register" class="btn-primary">Get Started Now</a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .hero {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 4rem 0;
    }
    
    .hero-content {
      flex: 1;
    }
    
    .hero-content h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .hero-content p {
      font-size: 1.25rem;
      color: #7f8c8d;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    
    .hero-buttons {
      display: flex;
      gap: 1rem;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.3s;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .btn-secondary {
      background-color: transparent;
      color: #3498db;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
      font-weight: 500;
      border: 1px solid #3498db;
      transition: all 0.3s;
    }
    
    .btn-secondary:hover {
      background-color: rgba(52, 152, 219, 0.1);
    }
    
    .hero-image {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    
    .hero-image img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .features, .how-it-works {
      padding: 4rem 0;
      border-top: 1px solid #ecf0f1;
    }
    
    h2 {
      font-size: 2rem;
      color: #2c3e50;
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .feature-card p {
      color: #7f8c8d;
      line-height: 1.5;
    }
    
    .steps {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    .step {
      flex: 1;
      min-width: 200px;
      text-align: center;
      padding: 1rem;
    }
    
    .step-number {
      width: 50px;
      height: 50px;
      background-color: #3498db;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
    }
    
    .step h3 {
      font-size: 1.25rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    
    .step p {
      color: #7f8c8d;
      line-height: 1.5;
    }
    
    .cta {
      background-color: #3498db;
      border-radius: 8px;
      padding: 4rem 2rem;
      margin: 4rem 0;
      text-align: center;
    }
    
    .cta-content h2 {
      color: white;
      margin-bottom: 1rem;
    }
    
    .cta-content p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.25rem;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta .btn-primary {
      background-color: white;
      color: #3498db;
      font-size: 1.1rem;
      padding: 1rem 2rem;
    }
    
    .cta .btn-primary:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
    
    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        text-align: center;
      }
      
      .hero-buttons {
        justify-content: center;
      }
      
      .steps {
        flex-direction: column;
      }
    }
  `,
  ],
})
export class HomeComponent {}

