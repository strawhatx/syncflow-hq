
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, ShoppingCart, Database, Zap, Users, BarChart, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <ShoppingCart className="h-8 w-8 text-green-600" />,
      title: "Shopify Integration",
      description: "Connect your Shopify store in seconds with our secure OAuth integration"
    },
    {
      icon: <Database className="h-8 w-8 text-blue-600" />,
      title: "Data Sync",
      description: "Automatically sync products, orders, and customers to your preferred tools"
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Real-time Updates",
      description: "Keep your data synchronized across all platforms in real-time"
    }
  ];

  const integrations = [
    { name: "Google Sheets", description: "Sync your Shopify data to spreadsheets" },
    { name: "Notion", description: "Organize store operations in Notion databases" },
    { name: "Airtable", description: "Use Airtable as your store's data hub" },
    { name: "Klaviyo", description: "Sync customer data for email marketing" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Store Owner",
      content: "This platform saved me hours every week. My Shopify data is now perfectly organized in Notion.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "E-commerce Manager",
      content: "The Google Sheets integration is a game-changer for our inventory management.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-green-100 text-green-800 border-green-200">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopify Integration Platform
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Connect Your Shopify Store to
            <span className="text-green-600 block">Everything</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Seamlessly sync your Shopify products, orders, and customers with Google Sheets, Notion, Airtable, and more. 
            No coding required – just powerful automation for your e-commerce business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate("/auth")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold border-2"
              onClick={() => navigate("/integrations")}
            >
              View Integrations
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Shopify Store Owners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop manually exporting and importing data. Automate your Shopify workflows with our powerful integration platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connect Shopify to Your Favorite Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our growing library of integrations to create the perfect workflow for your store.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-center">{integration.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {integration.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/integrations")}
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-green-50 hover:border-green-300"
            >
              View All Integrations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect your Shopify store and start automating your data workflows in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Shopify</h3>
              <p className="text-gray-600">
                Securely connect your Shopify store using our OAuth integration. Your credentials stay safe.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Destinations</h3>
              <p className="text-gray-600">
                Select where you want your Shopify data to go - Google Sheets, Notion, Airtable, or other tools.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Automate & Sync</h3>
              <p className="text-gray-600">
                Your data syncs automatically. Focus on growing your business while we handle the data management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Shopify Store Owners
            </h2>
            <p className="text-xl text-gray-600">
              Join hundreds of merchants who have streamlined their operations with our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Shopify Operations?
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join thousands of Shopify merchants who have automated their data workflows. 
            Start your free trial today and see the difference in 5 minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-white text-green-600 hover:bg-gray-100"
              onClick={() => navigate("/auth")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-green-600"
              onClick={() => navigate("/integrations")}
            >
              View Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-green-100 mt-8">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1000+ Happy Merchants</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
