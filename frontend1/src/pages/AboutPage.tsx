import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  Heart, 
  Users, 
  TreePine, 
  Award, 
  Globe,
  Target,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '50K+', icon: Users },
    { label: 'Trees Planted', value: '25K', icon: TreePine },
    { label: 'CO₂ Offset', value: '100T', icon: Leaf },
    { label: 'Countries', value: '15+', icon: Globe }
  ];

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability First',
      description: 'Every product we curate meets strict environmental standards and contributes to a healthier planet.'
    },
    {
      icon: Heart,
      title: 'Ethical Sourcing',
      description: 'We partner with brands that prioritize fair trade, worker welfare, and community development.'
    },
    {
      icon: Target,
      title: 'Quality Assurance',
      description: 'Rigorous testing and certification ensure all products meet our high standards for performance and safety.'
    },
    {
      icon: Award,
      title: 'Impact Transparency',
      description: 'Track your environmental impact with detailed metrics on carbon savings and positive change.'
    }
  ];

  const team = [
    {
      name: 'Anand Bharadwaj',
      role: 'Founder & CEO',
      image: '/api/placeholder/200/200',
      bio: 'Environmental engineer turned entrepreneur, passionate about sustainable innovation.'
    },
    {
      name: 'Sample 1',
      role: 'Head of Sustainability',
      image: '/api/placeholder/200/200',
      bio: 'Former climate scientist with 10+ years in sustainable product development.'
    },
    {
      name: 'Sample 2',
      role: 'Chief Technology Officer',
      image: '/api/placeholder/200/200',
      bio: 'Tech leader building scalable solutions for sustainable e-commerce.'
    },
    {
      name: 'Sample 3',
      role: 'Head of Partnerships',
      image: '/api/placeholder/200/200',
      bio: 'Connecting eco-conscious brands with customers who care about impact.'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'AveoEarth Founded',
      description: 'Started with a mission to make sustainable shopping accessible to everyone.'
    },
    {
      year: '2023',
      title: '10K Trees Planted',
      description: 'Reached our first major environmental milestone with community reforestation projects.'
    },
    {
      year: '2023',
      title: 'B-Corp Certification',
      description: 'Officially certified as a Benefit Corporation, committed to social and environmental impact.'
    },
    {
      year: '2024',
      title: '50K+ Customers',
      description: 'Built a thriving community of eco-conscious consumers making a difference.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-moss rounded-3xl flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-headline font-bold text-charcoal leading-tight">
              Redefining Commerce for a
              <span className="text-forest block">Sustainable Tomorrow</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AveoEarth is more than a marketplace—we're a movement toward conscious consumption, 
              connecting eco-warriors with products that protect our planet and communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-hero">
                Join Our Mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="btn-outline">
                View Impact Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-soft">
                <CardContent className="p-6">
                  <stat.icon className="w-12 h-12 text-forest mx-auto mb-4" />
                  <div className="text-3xl font-bold text-charcoal mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold text-charcoal">
                Our Story
              </h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  AveoEarth was born from a simple yet powerful belief: that every purchase 
                  is a vote for the kind of world we want to live in. Founded by a team of 
                  environmental advocates and tech innovators, we set out to solve a critical 
                  problem in sustainable shopping.
                </p>
                
                <p>
                  In a world flooded with greenwashing and false promises, finding truly 
                  sustainable products felt like searching for a needle in a haystack. 
                  We knew there had to be a better way—a platform that could cut through 
                  the noise and connect conscious consumers with verified eco-friendly products.
                </p>
                
                <p>
                  Today, AveoEarth is home to thousands of carefully curated products from 
                  brands that share our commitment to environmental stewardship and social 
                  responsibility. Every item in our marketplace undergoes rigorous vetting 
                  to ensure it meets our strict sustainability standards.
                </p>
              </div>
              
              <Button className="btn-secondary">
                Learn More About Our Process
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="/api/placeholder/600/400" 
                alt="Our sustainable mission"
                className="w-full rounded-2xl shadow-hero"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-charcoal mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every decision we make and every partnership we form.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-gradient-moss rounded-2xl flex items-center justify-center mx-auto">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            )
          )
        }
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-charcoal mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate individuals united by a shared vision of a sustainable future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal">{member.name}</h3>
                    <p className="text-forest font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-charcoal mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground">
              Key milestones in our mission to transform sustainable commerce.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-semibold text-charcoal">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-charcoal mb-4">
              Our Certifications
            </h2>
            <p className="text-xl text-muted-foreground">
              Verified commitments to sustainability and ethical business practices.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-earth rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">B-Corp Certified</h3>
                <p className="text-muted-foreground">
                  Meeting the highest standards of social and environmental performance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-moss rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Carbon Neutral</h3>
                <p className="text-muted-foreground">
                  Offsetting 100% of our operational carbon footprint through verified projects.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-forest to-moss rounded-2xl flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">ISO 14001</h3>
                <p className="text-muted-foreground">
                  Environmental management systems that minimize our ecological impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-moss text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold">
              Join the Sustainable Revolution
            </h2>
            <p className="text-xl opacity-90">
              Together, we can create a world where every purchase contributes to a healthier planet 
              and thriving communities. Your choices matter—make them count.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" className="bg-white text-forest hover:bg-white/90">
                Start Shopping Sustainably
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white text-forest hover:bg-white hover:text-forest">
                Partner With Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;