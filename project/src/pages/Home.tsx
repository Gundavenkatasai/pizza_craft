import * as React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Truck, Shield, Star } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const Home = (): JSX.Element => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pc-surface border-none text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-secondary-900/80"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center relative z-10">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-white">
              Authentic Pizza<br />
              <span className="text-primary-400">Delivered Fresh</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto animate-slide-up">
              Experience the perfect blend of traditional Italian recipes and modern convenience. 
              Made with love, delivered with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link
                to="/menu"
                className="pc-btn-primary px-8 py-4 text-lg transition-all transform hover:scale-105"
              >
                Order Now
              </Link>
              <Link
                to="/menu"
                className="border-2 border-white/50 bg-black/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-black transition-all backdrop-blur-sm"
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 pc-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold pc-text mb-4">
              Why Choose PizzaCraft?
            </h2>
            <p className="text-xl pc-text-secondary max-w-3xl mx-auto">
              We're committed to delivering an exceptional pizza experience with every order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group pc-card p-6 border-none bg-transparent">
              <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg pc-text mb-2">Fast Delivery</h3>
              <p className="pc-text-muted">Hot, fresh pizza delivered in 30 minutes or less</p>
            </div>

            <div className="text-center group pc-card p-6 border-none bg-transparent">
              <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg pc-text mb-2">Quality Ingredients</h3>
              <p className="pc-text-muted">Only the freshest, highest quality ingredients</p>
            </div>

            <div className="text-center group pc-card p-6 border-none bg-transparent">
              <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Truck className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-lg pc-text mb-2">Free Delivery</h3>
              <p className="pc-text-muted">Free delivery on orders over {formatCurrency(499)}</p>
            </div>

            <div className="text-center group pc-card p-6 border-none bg-transparent">
              <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="font-semibold text-lg pc-text mb-2">5-Star Rated</h3>
              <p className="pc-text-muted">Loved by thousands of satisfied customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Pizzas Section */}
      <section className="py-16 pc-surface border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold pc-text mb-4">
              Customer Favorites
            </h2>
            <p className="text-xl pc-text-secondary">
              Try our most popular pizzas loved by our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pc-card overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 group transition-all">
              <div className="overflow-hidden h-48">
                <img
                  src="https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Margherita Pizza"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl pc-text mb-2">Margherita Classic</h3>
                <p className="pc-text-muted mb-4">Fresh mozzarella, san marzano tomatoes, fresh basil</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gradient text-lg">From {formatCurrency(299)}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm pc-text-secondary">4.8</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pc-card overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 group transition-all">
              <div className="overflow-hidden h-48">
                <img
                  src="https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Pepperoni Pizza"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl pc-text mb-2">Pepperoni Supreme</h3>
                <p className="pc-text-muted mb-4">Premium pepperoni with mozzarella cheese</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gradient text-lg">From {formatCurrency(359)}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm pc-text-secondary">4.7</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pc-card overflow-hidden hover:border-orange-500/50 hover:shadow-orange-500/10 group transition-all">
              <div className="overflow-hidden h-48">
                <img
                  src="https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                  alt="Meat Lovers Pizza"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl pc-text mb-2">Meat Lovers</h3>
                <p className="pc-text-muted mb-4">Pepperoni, sausage, bacon, ham, and ground beef</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gradient text-lg">From {formatCurrency(459)}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm pc-text-secondary">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-block pc-btn-primary px-8 py-3 transition-all"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pc-surface border-t overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-500/5 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 pc-text">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 pc-text-secondary">
            Join thousands of satisfied customers and taste the difference
          </p>
          <Link
            to="/menu"
            className="inline-block pc-btn-primary px-8 py-4 text-lg transition-all transform hover:scale-105"
          >
            Start Your Order
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;