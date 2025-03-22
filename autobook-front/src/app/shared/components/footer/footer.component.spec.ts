import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentYear to the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should display the current year in the copyright text', () => {
    const currentYear = new Date().getFullYear();
    const copyrightElement = fixture.debugElement.query(By.css('.copyright p')).nativeElement;
    
    expect(copyrightElement.textContent).toContain(`© ${currentYear} AutoBook`);
  });

  it('should display company logo and name', () => {
    const logoElement = fixture.debugElement.query(By.css('.logo-icon'));
    const brandNameElement = fixture.debugElement.query(By.css('.footer-brand h3'));
    
    expect(logoElement).toBeTruthy();
    expect(brandNameElement.nativeElement.textContent).toBe('AutoBook');
  });

  it('should have navigation sections', () => {
    const navColumns = fixture.debugElement.queryAll(By.css('.footer-nav-column'));
    
    expect(navColumns.length).toBe(3);
    
    // Check for product section
    const productSection = navColumns[0];
    expect(productSection.query(By.css('h4')).nativeElement.textContent).toBe('Product');
    expect(productSection.queryAll(By.css('li')).length).toBeGreaterThan(0);
    
    // Check for company section
    const companySection = navColumns[1];
    expect(companySection.query(By.css('h4')).nativeElement.textContent).toBe('Company');
    expect(companySection.queryAll(By.css('li')).length).toBeGreaterThan(0);
    
    // Check for resources section
    const resourcesSection = navColumns[2];
    expect(resourcesSection.query(By.css('h4')).nativeElement.textContent).toBe('Resources');
    expect(resourcesSection.queryAll(By.css('li')).length).toBeGreaterThan(0);
  });

  it('should have social media links', () => {
    const socialLinks = fixture.debugElement.queryAll(By.css('.social-links .social-link'));
    
    expect(socialLinks.length).toBe(4); // Facebook, Twitter, Instagram, LinkedIn
    
    // Verify each link has an SVG icon
    socialLinks.forEach(link => {
      expect(link.query(By.css('svg'))).toBeTruthy();
    });
  });

  it('should have footer bottom links', () => {
    const footerLinks = fixture.debugElement.queryAll(By.css('.footer-links a'));
    
    expect(footerLinks.length).toBe(3); // Terms, Privacy, Cookie
    expect(footerLinks[0].nativeElement.textContent).toBe('Terms of Service');
    expect(footerLinks[1].nativeElement.textContent).toBe('Privacy Policy');
    expect(footerLinks[2].nativeElement.textContent).toBe('Cookie Policy');
  });
});