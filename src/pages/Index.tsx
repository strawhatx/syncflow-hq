import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Database, Zap, Shield, Users, ArrowRight, CheckCircle, GitBranch, Settings, Monitor, Mail } from 'lucide-react';

const IndexPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { user } = useAuth();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Here you would typically send the email to your backend
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Syncflow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#connectors" className="text-gray-300 hover:text-white transition-colors">Connectors</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              {user ? (
                <Button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors' asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Login</Link>
                  </Button>
                  <Button className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors' asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30">
              🚀 Now in Beta - Join the Waitlist
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Sync anything.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              2-way. In minutes.
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The easiest way to sync structured data across your stack. Replace brittle scripts and expensive ETL tools with visual, versioned sync flows.
          </p>
          
          {/* Waitlist Form */}
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto mb-16">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                disabled={isSubmitted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Added!
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Preview */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                  <Database className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">Supabase</h3>
                  <p className="text-gray-400 text-sm">Production Database</p>
                </div>
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                    <Zap className="h-6 w-6 text-white animate-pulse" />
                  </div>
                </div>
                <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                  <Database className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="text-white font-semibold mb-2">MongoDB</h3>
                  <p className="text-gray-400 text-sm">Analytics Warehouse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Syncflow?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built for developers who need reliable, scalable data synchronization without the complexity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <Zap className="h-12 w-12 text-blue-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">2-Way Syncing</h3>
              <p className="text-gray-300">
                Bi-directional data flow with intelligent conflict resolution. Changes sync both ways, automatically.
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <Settings className="h-12 w-12 text-purple-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Visual Mapping</h3>
              <p className="text-gray-300">
                Drag-and-drop field mapping with custom transformations. No code required for common use cases.
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <Shield className="h-12 w-12 text-green-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Secure by Default</h3>
              <p className="text-gray-300">
                Encrypted credential storage, VPC support, and audit logs. Enterprise-grade security built-in.
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <Monitor className="h-12 w-12 text-yellow-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Monitoring</h3>
              <p className="text-gray-300">
                Live sync status, detailed logs, and intelligent alerting. Know exactly what's happening with your data.
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <Users className="h-12 w-12 text-teal-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Team Collaboration</h3>
              <p className="text-gray-300">
                Project-based organization with role-based access control. Perfect for growing teams.
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <GitBranch className="h-12 w-12 text-orange-400 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-4">Version Control</h3>
              <p className="text-gray-300">
                Version your sync configurations like code. Rollback changes, compare versions, and deploy with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Connectors Section */}
      <section id="connectors" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Connect Everything</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pre-built connectors for all your favorite databases and services
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Supabase', color: 'bg-green-500' },
              { name: 'PostgreSQL', color: 'bg-blue-500' },
              { name: 'MongoDB', color: 'bg-green-600' },
              { name: 'MySQL', color: 'bg-orange-500' },
              { name: 'Redis', color: 'bg-red-500' },
              { name: 'S3', color: 'bg-yellow-500' },
              { name: 'Snowflake', color: 'bg-blue-400' },
              { name: 'BigQuery', color: 'bg-blue-600' },
              { name: 'Salesforce', color: 'bg-blue-500' },
              { name: 'Stripe', color: 'bg-purple-500' },
              { name: 'Airtable', color: 'bg-yellow-600' },
              { name: 'Notion', color: 'bg-gray-700' }
            ].map((connector, index) => (
              <div key={index} className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 hover:transform hover:scale-105 text-center">
                <div className={`w-12 h-12 ${connector.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <Database className="h-6 w-6 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{connector.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to eliminate data drift forever?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of developers who've already streamlined their data workflows with Syncflow.
          </p>
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                disabled={isSubmitted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Added!
                  </>
                ) : (
                  <>
                    Get Early Access
                    <Mail className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GitBranch className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Syncflow</span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 Syncflow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;