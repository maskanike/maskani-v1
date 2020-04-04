const express = require('express');

const router = express.Router();

/* GET Home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Best Kenyan Rental Management System - Maskani', thisPage: 'home' });
});

/* GET Health page. */
router.get('/health', (req, res) => {
  res.send('I am healthy');
});

/* GET Login Page */
router.get('/login', (req, res) => {
  res.render('auth/login', { user: 'Eugene', title: 'Login to Maskani', thisPage: 'login' });
});

/* GET Signup Page */
router.get('/signup', (req, res) => {
  res.render('auth/signup', { user: 'Eugene', title: 'Signup for Maskani', thisPage: 'signup' });
});

/* GET Features Page */
router.get('/features', (req, res) => {
  res.render('pages/page_features', { title: 'Maskani Features', thisPage: 'features' });
});

/* GET Pricing Page */
router.get('/pricing', (req, res) => {
  res.render('pages/page_pricing', { title: 'Maskani Pricing', thisPage: 'pricing' });
});

/* GET TOS */
router.get('/terms-of-service', (req, res) => {
  res.render('pages/page_terms_of_service', { title: 'Maskani Terms of Service', thisPage: 'tos' });
});


/* GET Privacy Policy */
router.get('/privacy-policy', (req, res) => {
  res.render('pages/page_privacy_policy', { title: 'Maskani Privacy Policy', thisPage: 'pp' });
});


/* GET About Page */
router.get('/about', (req, res) => {
  res.render('pages/page_about', { title: 'About Maskani', thisPage: 'about' });
});

/* GET Contact Page */
router.get('/contact', (req, res) => {
  res.render('pages/page_contact', { title: 'Contact Maskani', thisPage: 'contact' });
});


/* --------------------------------------------------------------------------- */
/* APP VIEWS */
/* --------------------------------------------------------------------------- */

/* GET Dashboard Index */
router.get('/app/dashboard', (req, res) => {
  res.render('app/dashboard', { title: 'Maskani Dashboard', activePage: 'dashboard', thisPage: 'dashboard' });
});

/* GET Onboarding Index */
router.get('/app/onboarding', (req, res) => {
  res.render('app/onboarding', { title: 'Onboarding', activePage: 'onboarding' });
});

/* GET Invoicing Index */
router.get('/app/invoice', (req, res) => {
  res.render('app/invoice_tenants', { title: 'Invoice Tenants', activePage: 'invoice_tenants' });
});

/* GET Manage Tenants Index */
router.get('/app/manage-tenants', (req, res) => {
  res.render('app/manage_tenants', { title: 'Manage Tenants', activePage: 'manage_tenants' });
});

module.exports = router;
