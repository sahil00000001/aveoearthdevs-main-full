import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle,
  HelpCircle,
  Send,
  Leaf,
  Users,
  Package,
  Heart,
  ArrowRight
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    // Show success message
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'hello@aveoearth.com',
      description: 'Send us an email anytime!',
      action: 'mailto:hello@aveoearth.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 98765 43210',
      description: 'Mon-Fri from 8am to 5pm',
      action: 'tel:+919876543210'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Green Street, Eco Plaza',
      description: 'Mumbai, Maharashtra 400001',
      action: '#'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon - Fri: 9am - 6pm',
      description: 'Sat: 10am - 4pm',
      action: '#'
    }
  ];

  const helpCategories = [
    {
      icon: Package,
      title: 'Order Support',
      description: 'Track orders, returns, and delivery questions',
      topics: ['Order Status', 'Shipping Info', 'Returns & Exchanges', 'Refunds']
    },
    {
      icon: Leaf,
      title: 'Product Information',
      description: 'Learn about our sustainable products',
      topics: ['Eco Certifications', 'Product Details', 'Sustainability Impact', 'Care Instructions']
    },
    {
      icon: Users,
      title: 'Account Help',
      description: 'Manage your account and preferences',
      topics: ['Login Issues', 'Profile Settings', 'Password Reset', 'Newsletter Preferences']
    },
    {
      icon: Heart,
      title: 'Partnership',
      description: 'Collaborate with us on sustainability',
      topics: ['Vendor Applications', 'Brand Partnerships', 'Wholesale Inquiries', 'Sustainability Initiatives']
    }
  ];

  const faqs = [
    {
      question: 'How do you verify product sustainability?',
      answer: 'We have a rigorous 7-step verification process that includes third-party certifications, supply chain audits, and ongoing monitoring of environmental and social impact.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be in original condition. Some eco-sensitive items like personal care products have different return terms for hygiene reasons.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we ship within India. We\'re working on expanding to international markets while maintaining our carbon-neutral shipping commitment.'
    },
    {
      question: 'How is my environmental impact calculated?',
      answer: 'We track carbon footprint, water usage, and waste reduction for each product. Your personal impact dashboard shows cumulative savings based on your purchases compared to conventional alternatives.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-moss rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-charcoal">
              Get in Touch
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Have questions about sustainable shopping? Need help with an order? 
              We're here to help you on your eco-conscious journey.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-border rounded-lg bg-background"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="product">Product Information</option>
                        <option value="partnership">Partnership</option>
                        <option value="technical">Technical Support</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="consent" className="rounded" required />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground">
                      I agree to the processing of my personal data for the purpose of handling this inquiry.
                    </Label>
                  </div>
                  
                  <Button type="submit" className="w-full btn-hero">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-forest/10 rounded-lg flex items-center justify-center">
                        <info.icon className="w-5 h-5 text-forest" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal">{info.title}</h3>
                        <p className="text-forest font-medium">{info.content}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Chat */}
            <Card className="bg-gradient-moss text-white">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm opacity-90 mb-4">
                  Get instant answers to your questions with our live chat support.
                </p>
                <Button variant="secondary" className="bg-white text-forest hover:bg-white/90">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Track Your Order
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQs
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Leaf className="w-4 h-4 mr-2" />
                  Sustainability Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Categories */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-charcoal mb-4">
              How Can We Help?
            </h2>
            <p className="text-xl text-muted-foreground">
              Browse our help categories or contact us directly for personalized support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-moss rounded-2xl flex items-center justify-center mx-auto">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  </div>
                  <div className="space-y-1">
                    {category.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="text-xs text-muted-foreground">
                        • {topic}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Get Help
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-charcoal mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to the most common questions about AveoEarth.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-charcoal mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline">
              View All FAQs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Office Hours */}
        <section className="mt-20">
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-forest mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-charcoal mb-4">Our Response Times</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div>
                  <div className="font-semibold text-forest">Email</div>
                  <div className="text-sm text-muted-foreground">Within 24 hours</div>
                </div>
                <div>
                  <div className="font-semibold text-forest">Live Chat</div>
                  <div className="text-sm text-muted-foreground">Instant response</div>
                </div>
                <div>
                  <div className="font-semibold text-forest">Phone</div>
                  <div className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;