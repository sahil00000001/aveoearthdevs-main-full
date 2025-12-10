"use client";

import React from 'react';
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
  CheckCircle,
  Clock, // Using Clock for Timeline
  Handshake, // Using Handshake for Partnerships in CTA
} from 'lucide-react';

// --- Custom Tailwind Color Approximations ---
// forest: emerald-700
// moss: emerald-500
// charcoal: gray-800
// muted-foreground: gray-600

// --- Simple Card Component (to replace Shadcn Card) ---
const CustomCard = ({ children, className = "" }) => (
  <div className={`rounded-xl bg-white border border-gray-100 shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

// --- Custom Button Component (to replace Shadcn Button) ---
const PrimaryButton = ({ children, className = "", onClick, variant = "default" }) => {
  const baseClasses = "flex items-center justify-center font-semibold rounded-full px-6 py-3 transition-all duration-300 transform active:scale-95 whitespace-nowrap";
  
  let styles;
  if (variant === "secondary") {
    // Used for CTA inside the green section
    styles = "bg-white text-emerald-700 hover:bg-emerald-50 hover:shadow-xl";
  } else if (variant === "outline") {
    // Used for secondary button in Hero
    styles = "border border-emerald-700 text-emerald-700 hover:bg-emerald-50/50 hover:shadow-md";
  } else {
    // Default/Primary button
    styles = "bg-emerald-700 text-white hover:bg-emerald-800 shadow-md hover:shadow-xl";
  }

  return (
    <button className={`${baseClasses} ${styles} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

// const metadata = { title: "About AveoEarth" };

export default function AboutPage() {
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
      image: 'https://placehold.co/200x200/22c55e/ffffff?text=AB',
      bio: 'Environmental engineer turned entrepreneur, passionate about sustainable innovation.'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Sustainability',
      image: 'https://placehold.co/200x200/10b981/ffffff?text=PS',
      bio: 'Former climate scientist with 10+ years in sustainable product development.'
    },
    {
      name: 'Daniel Kim',
      role: 'Chief Technology Officer',
      image: 'https://placehold.co/200x200/059669/ffffff?text=DK',
      bio: 'Tech leader building scalable solutions for sustainable e-commerce.'
    },
    {
      name: 'Leila Hassan',
      role: 'Head of Partnerships',
      image: 'https://placehold.co/200x200/047857/ffffff?text=LH',
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

  const CertificationIcon = ({ icon: Icon, colorClass }) => (
    <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-emerald-200 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl flex items-center justify-center shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
              Redefining Commerce for a
              <span className="text-emerald-700 block mt-2">Sustainable Tomorrow</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AveoEarth is more than a marketplace—we're a movement toward conscious consumption, 
              connecting eco-warriors with products that protect our planet and communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <PrimaryButton>
                Join Our Mission
                <ArrowRight className="w-5 h-5 ml-2" />
              </PrimaryButton>
              <PrimaryButton variant="outline">
                View Impact Report
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white shadow-inner">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <CustomCard key={index} className="text-center transition-all hover:shadow-2xl">
                  <div className="p-2 space-y-2">
                    <Icon className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                    <div className="text-4xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-gray-500 font-medium">{stat.label}</div>
                  </div>
                </CustomCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-800 border-l-4 border-emerald-600 pl-4">
                Our Story: The Genesis of Change
              </h2>
              
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
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
                
                <p className="font-semibold text-emerald-700">
                  Today, AveoEarth is home to thousands of carefully curated products from 
                  brands that share our commitment to environmental stewardship and social 
                  responsibility. Every item in our marketplace undergoes rigorous vetting 
                  to ensure it meets our strict sustainability standards.
                </p>
              </div>
              
              <PrimaryButton className="mt-6 bg-emerald-600 hover:bg-emerald-700">
                Learn More About Our Process
              </PrimaryButton>
            </div>
            
            <div className="relative p-4 bg-white rounded-3xl shadow-2xl shadow-emerald-200">
              <img 
                src="https://placehold.co/600x400/10b981/ffffff?text=Sustainable+Future" 
                alt="Our sustainable mission"
                className="w-full rounded-2xl object-cover h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-700/30 to-transparent rounded-2xl m-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">
              Our Guiding Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide every decision we make and every partnership we form.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <CustomCard key={index} className="text-center h-full transition-shadow hover:shadow-xl hover:border-emerald-200">
                  <div className="p-4 space-y-4">
                    <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                    <p className="text-gray-500 text-sm">{value.description}</p>
                  </div>
                </CustomCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">
              Meet the Visionaries
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate individuals united by a shared vision of a sustainable future.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <CustomCard key={index} className="text-center group transition-transform hover:scale-[1.02] hover:shadow-2xl h-full">
                <div className="p-2 space-y-4">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-emerald-500 shadow-md transition-all group-hover:border-emerald-700"
                    // Fallback for placeholder images
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/128x128/ccc/666?text=👤" }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-emerald-600 font-semibold">{member.role}</p>
                    <p className="text-sm text-gray-500 mt-2 italic">{member.bio}</p>
                  </div>
                </div>
              </CustomCard>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-32 bg-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">
              Our Journey: Key Milestones
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key steps in our mission to transform sustainable commerce, starting from the idea to market impact.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-emerald-300 transform -translate-x-1/2 hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`flex relative ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-start`}
                >
                  {/* Icon Dot */}
                  <div className="absolute md:relative flex-shrink-0 w-8 h-8 md:w-12 md:h-12 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-xl border-4 border-white transform md:translate-x-0 -left-1.5">
                    <Clock className="w-5 h-5" />
                  </div>

                  {/* Content Card (Left/Right alternating) */}
                  <CustomCard 
                    className={`p-6 w-full md:w-[calc(50%-24px)] transition-all duration-500 hover:shadow-emerald-300 shadow-lg ${
                      index % 2 === 0 ? 'md:ml-auto md:mr-6' : 'md:mr-auto md:ml-6'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                      <div className="text-2xl font-extrabold text-emerald-600">{milestone.year}</div>
                    </div>
                    <p className="text-gray-600">{milestone.description}</p>
                  </CustomCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">
              Verified Commitments
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our commitment to sustainability and ethical business is backed by official certifications.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <CustomCard className="text-center hover:shadow-2xl">
              <CertificationIcon icon={Award} colorClass="bg-gradient-to-r from-teal-500 to-teal-700" />
              <h3 className="text-xl font-bold text-gray-900">B-Corp Certified</h3>
              <p className="text-gray-500 mt-2">
                Meeting the highest standards of social and environmental performance, accountability, and transparency.
              </p>
            </CustomCard>
            
            <CustomCard className="text-center hover:shadow-2xl">
              <CertificationIcon icon={CheckCircle} colorClass="bg-gradient-to-r from-emerald-600 to-emerald-800" />
              <h3 className="text-xl font-bold text-gray-900">Carbon Neutral</h3>
              <p className="text-gray-500 mt-2">
                Offsetting $100\%$ of our operational carbon footprint through verified global projects.
              </p>
            </CustomCard>
            
            <CustomCard className="text-center hover:shadow-2xl">
              <CertificationIcon icon={Star} colorClass="bg-gradient-to-r from-green-500 to-lime-600" />
              <h3 className="text-xl font-bold text-gray-900">ISO 14001</h3>
              <p className="text-gray-500 mt-2">
                Implementing robust environmental management systems that minimize our ecological impact globally.
              </p>
            </CustomCard>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-emerald-700 text-white shadow-xl">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-extrabold">
              Join the Sustainable Revolution
            </h2>
            <p className="text-xl opacity-95 max-w-3xl mx-auto">
              Together, we can create a world where every purchase contributes to a healthier planet 
              and thriving communities. Your choices matter—make them count with AveoEarth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <PrimaryButton variant="secondary" className="shadow-lg hover:shadow-xl">
                <Leaf className="w-5 h-5 mr-2" />
                Start Shopping Sustainably
              </PrimaryButton>
              <PrimaryButton variant="secondary" className="shadow-lg hover:shadow-xl bg-transparent border-2 border-white text-forest">
                <Handshake className="w-5 h-5 mr-2" />
                Partner With Us
              </PrimaryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
