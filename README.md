# Container Homes Website Template

This is a template for a website about container and modular homes.

## Structure

- `index.html`: Home page (Landing Page)
- `about.html`: Company history and information
- `gallery.html`: Photo gallery of homes
- `contact.html`: Contact form and information
- `styles.css`: CSS styles (light and clean tones)
- `script.js`: Basic JavaScript for form validation
- `images/`: Directory for images (add your photos here)

## Features

- Responsive design
- Light color scheme
- 3 house sizes
- Financing information with bank partners
- Materials and production info
- Contact form with real email sending (EmailJS)
- Google Maps embed

## Email Contact Form Setup (SMTP Options)

Choose one of the following SMTP-based email services for your contact form:

### Option 1: EmailJS with SMTP (Recommended)
EmailJS supports direct SMTP configuration for maximum control.

1. **Create EmailJS Account**: Go to [https://www.emailjs.com/](https://www.emailjs.com/)

2. **Create SMTP Email Service**:
   - Go to "Email Services" → "Add New Service"
   - Select "SMTP" as the provider
   - Configure with your SMTP settings:
     - **Host**: Your SMTP server (e.g., smtp.gmail.com)
     - **Port**: 587 (TLS) or 465 (SSL)
     - **Username**: Your email address
     - **Password**: Your email password or app password
     - **Secure**: true

3. **Create Email Template**: Same as before with the template provided below

4. **Update script.js**: Replace the placeholder values with your EmailJS keys

### Option 2: Formspree (Simple SMTP)
Formspree handles SMTP for you with a simple setup.

1. **Create Account**: Go to [https://formspree.io/](https://formspree.io/)

2. **Create Form**:
   - Create a new form
   - Copy your form endpoint URL

3. **Update contact.html**: Change form action to your Formspree URL
4. **Update script.js**: Remove EmailJS code, Formspree handles submission automatically

### Option 3: Web3Forms (Advanced SMTP)
Web3Forms provides SMTP configuration options.

1. **Create Account**: Go to [https://web3forms.com/](https://web3forms.com/)

2. **Get Access Key**: Copy your access key

3. **Update script.js**: Replace EmailJS with Web3Forms API calls

### Email Template Content:
```
New contact form submission from your website:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Model Interested In: {{model}}

Message:
{{message}}
```

### SMTP Server Examples:
- **Gmail**: smtp.gmail.com (Port: 587, Use app password)
- **Outlook**: smtp-mail.outlook.com (Port: 587)
- **Yahoo**: smtp.mail.yahoo.com (Port: 587)
- **Custom SMTP**: Your hosting provider's SMTP settings

### Which SMTP Option to Choose?

- **EmailJS with SMTP**: Best for full control over email appearance and SMTP settings
- **Formspree**: Simplest setup, good for basic forms
- **Web3Forms**: Most flexible, supports custom SMTP servers

### Quick Setup Comparison:

| Service | Setup Time | SMTP Control | Free Limit | Best For |
|---------|------------|--------------|------------|----------|
| EmailJS | 10 min | Full | 200/month | Custom SMTP |
| Formspree | 5 min | None | 50/month | Quick setup |
| Web3Forms | 5 min | Limited | 250/month | Flexibility |

### Current Implementation:
The code is currently set up for **EmailJS with SMTP support**. To switch to Formspree:
1. Comment out the EmailJS section in `script.js`
2. Uncomment the Formspree section in `script.js`
3. Uncomment the Formspree form action in `contact.html`
4. Replace `YOUR_FORM_ID` with your Formspree form ID