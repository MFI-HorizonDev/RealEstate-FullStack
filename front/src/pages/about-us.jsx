import React from "react";
import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Users, Shield, Award, Building2 } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            About RealEstate
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
            We are a leading property listing platform in the Philippines, connecting buyers,
            owners, and agents through a secure and transparent digital marketplace.
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              RealEstate was built to simplify and modernize the property buying, selling,
              and renting experience in the Philippines. We believe everyone deserves access
              to verified, transparent listings with fair pricing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform leverages advanced valuation algorithms, role-based access controls,
              and a guardian flagging system to ensure every listing meets our quality standards.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-secondary rounded-2xl p-6 text-center hover:shadow-lg transition">
              <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground font-medium">Verified Listings</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-2xl p-6 text-center hover:shadow-lg transition">
              <Users className="h-10 w-10 text-amber-700 dark:text-amber-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground">1,000+</p>
              <p className="text-sm text-muted-foreground font-medium">Active Users</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-2xl p-6 text-center hover:shadow-lg transition">
              <Shield className="h-10 w-10 text-green-700 dark:text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground font-medium">Secure Transactions</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-2xl p-6 text-center hover:shadow-lg transition">
              <Award className="h-10 w-10 text-purple-700 dark:text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground font-medium">Platform Support</p>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-5">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">For Buyers</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse verified property listings with transparent pricing, schedule tours
                with agents, and find your dream home with confidence.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-5">
                <Users className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">For Owners</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                List your properties with ease, manage your portfolio through a dedicated
                dashboard, and connect with qualified buyers and agents.
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-5">
                <Award className="h-6 w-6 text-green-700 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">For Agents</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Access a growing client base, manage property tours, track commissions,
                and grow your real estate career on a trusted platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-muted/40 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">Contact Us</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Have questions about our platform or need assistance? Reach out to our team and
            we'll get back to you as soon as possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border hover:shadow-lg transition">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                BGC, Taguig City<br />
                Metro Manila, Philippines
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border hover:shadow-lg transition">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Phone className="h-6 w-6 text-green-700 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                +63 (2) 8123 4567<br />
                Mon – Fri, 9AM – 6PM
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border hover:shadow-lg transition">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Mail className="h-6 w-6 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm">
                <a href="mailto:info@realestate.ph" className="text-primary hover:underline font-medium">
                  info@realestate.ph
                </a>
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-secondary border border-border rounded-xl p-6 text-sm text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-2">Platform Disclaimer</p>
            <p>
              RealEstate operates as a property listing platform only. We do not directly
              participate in, guarantee, or assume liability for any real estate transactions
              conducted between users. All property information is provided by the respective
              owners and agents. Buyers are advised to conduct their own due diligence before
              making any purchasing or rental decisions. For more details, please review our{" "}
              <Link to="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
