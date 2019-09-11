var express = require('express');
var router = express.Router();

/* GET Home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Best Kenyan Rental Management System - Maskani', thisPage: 'home' });
});

/* GET Login Page */
router.get('/login', function(req, res, next) {
  res.render('auth/login', { user: 'Eugene', title: 'Login to Maskani', thisPage: 'login' });
});

/* GET Signup Page */
router.get('/signup', function(req, res, next) {
  res.render('auth/signup', { user: 'Eugene', title: 'Signup for Maskani', thisPage: 'signup' });
});

/* GET Features Page */
router.get('/features', function(req, res, next) {
  res.render('pages/page_features', { title: 'Maskani Features', thisPage: 'features' });
});

/* GET Pricing Page */
router.get('/pricing', function(req, res, next) {
  res.render('pages/page_pricing', { title: 'Maskani Pricing', thisPage: 'pricing' });
});

/* GET TOS */
router.get('/terms-of-service', function(req, res, next) {
  res.render('pages/page_terms_of_service', { title: 'Maskani Terms of Service', thisPage: 'tos' });
});


/* GET Privacy Policy */
router.get('/privacy-policy', function(req, res, next) {
  res.render('pages/page_privacy_policy', { title: 'Maskani Privacy Policy', thisPage: 'pp' });
});


/* GET About Page */
router.get('/about', function(req, res, next) {
  res.render('pages/page_about', { title: 'About Maskani', thisPage: 'about' });
});

/* GET Contact Page */
router.get('/contact', function(req, res, next) {
  res.render('pages/page_contact', { title: 'Contact Maskani', thisPage: 'contact' });
});


/* --------------------------------------------------------------------------- */
/* APP VIEWS */
/* --------------------------------------------------------------------------- */

/* GET Dashboard Index */
router.get('/app/dashboard', function(req, res, next) {
  res.render('app/dashboard', { title: 'Maskani Dashboard', activePage: 'dashboard', thisPage: 'dashboard' });
});

/* GET Onboarding Index */
router.get('/app/onboarding', function(req, res, next) {
  res.render('app/onboarding', { title: 'Onboarding', activePage: 'onboarding' });
});

/* GET Invoicing Index */
router.get('/app/invoice', function(req, res, next) {
  res.render('app/invoice_tenants', { title: 'Invoice Tenants', activePage: 'invoice_tenants' });
});

/* GET Manage Tenants Index */
router.get('/app/manage-tenants', function (req, res, next) {
  res.render('app/manage_tenants', { title: 'Manage Tenants', activePage: 'manage_tenants' });
});

module.exports = router;
